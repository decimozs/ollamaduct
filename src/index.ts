import { honoLogLayer } from "@loglayer/hono";
import {
	getSimplePrettyTerminal,
	moonlight,
} from "@loglayer/transport-simple-pretty-terminal";
import { LogLayer } from "loglayer";
import { Ollama } from "ollama";
import { serializeError } from "serialize-error";
import { DEFAULT_MODEL, OLLAMA_CONFIG } from "./config";
import { searchCache, upsertCache } from "./lib/vector-store";
import { authMiddleware } from "./middleware/auth";
import { sanitizeRequest, sanitizeResponse } from "./middleware/sanitize";
import type { OllamaRequest, UsageStats } from "./types";
import { createApp } from "./utils";

const log = new LogLayer({
	errorSerializer: serializeError,
	transport: getSimplePrettyTerminal({
		runtime: "node",
		theme: moonlight,
	}),
});

const ollama = new Ollama({
	host: OLLAMA_CONFIG.url,
});

const app = createApp()
	.use(honoLogLayer({ instance: log }))
	.get("/", (c) => {
		return c.text("Welcome to Ollamaduct - Ollama Gateway!");
	})
	.get("/healthcheck", async (c) => {
		return c.json({
			message: "OK",
		});
	})
	.get("/api/tags", async (c) => {
		const auth = await authMiddleware(c);
		if (!auth) return;

		try {
			const data = await ollama.list();
			return c.json(data);
		} catch (error) {
			console.error("Failed to fetch models:", error);
			return c.json({ error: "Failed to connect to Ollama" }, 502);
		}
	})
	.post("/api/chat", async (c) => {
		const auth = await authMiddleware(c);
		if (!auth) return;

		const body = await c.req.json();
		const requestBody = body as OllamaRequest;
		const model = requestBody.model || DEFAULT_MODEL;
		const isStreaming = requestBody.stream !== false;

		const { sanitizedBody, result: sanitizationResult } = await sanitizeRequest(
			body,
			{
				"x-pii-mode": c.req.header("x-pii-mode"),
				"x-pii-audit": c.req.header("x-pii-audit"),
			},
		);

		const sanitizedRequest = sanitizedBody as OllamaRequest;

		if (sanitizationResult.sanitized) {
			console.log("PII detected and redacted:", sanitizationResult.redactions);
		}

		const promptText = Array.isArray(sanitizedRequest.messages)
			? sanitizedRequest.messages
					.map((m: { content?: string }) => m.content || "")
					.join("\n")
			: "";

		const cacheEnabled = c.req.header("x-cache") !== "false";

		if (cacheEnabled && promptText && !isStreaming) {
			const cachedResult = await searchCache(promptText, model);
			if (cachedResult) {
				return c.json({
					message: cachedResult.response,
					_cache: "HIT",
					_cache_similarity: cachedResult.similarity.toFixed(4),
				});
			}
		}

		const ollamaUrl = `${OLLAMA_CONFIG.url}/api/chat`;

		const startTime = Date.now();

		if (isStreaming) {
			try {
				let fullResponse = "";
				let inputTokens = 0;
				let outputTokens = 0;

				const stream = new ReadableStream({
					async start(controller) {
						const encoder = new TextEncoder();
						try {
							const response = await ollama.chat({
								model,
								messages: sanitizedRequest.messages,
								stream: true,
								options: sanitizedRequest.options,
							});

							for await (const chunk of response) {
								const jsonLine = `${JSON.stringify(chunk)}\n`;
								controller.enqueue(encoder.encode(jsonLine));

								if (chunk.message?.content) {
									fullResponse += chunk.message.content;
								}

								if (chunk.done) {
									inputTokens = chunk.prompt_eval_count || 0;
									outputTokens = chunk.eval_count || 0;
								}
							}
						} catch (error) {
							console.error("Stream error:", error);
						} finally {
							controller.close();
						}
					},
				});

				const latencyMs = Date.now() - startTime;

				c.req.raw.signal.addEventListener("abort", () => {
					// Stream will be automatically cancelled
				});

				const ctx = c as {
					executionCtx?: { waitUntil: (fn: Promise<void>) => void };
				};

				const logUsage = async () => {
					try {
						await logUsageStats(
							model,
							{ inputTokens, outputTokens },
							auth.apiKeyId,
							auth.workspaceId,
							latencyMs,
						);
					} catch (error) {
						console.error("Failed to log usage:", error);
					}
				};

				try {
					if (ctx.executionCtx?.waitUntil) {
						ctx.executionCtx.waitUntil(logUsage());
					} else {
						await logUsage();
					}
				} catch {
					// Ignore
				}

				return new Response(stream, {
					headers: {
						"Content-Type": "application/x-ndjson",
						"X-Cache": "MISS",
						"X-PII-Detected": sanitizationResult.sanitized ? "true" : "false",
						"X-PII-Count": sanitizationResult.redactions.total.toString(),
					},
				});
			} catch (error) {
				console.error("Chat error:", error);
				return c.json({ error: "Failed to chat with Ollama" }, 502);
			}
		}

		try {
			const response = await ollama.chat({
				model,
				messages: sanitizedRequest.messages,
				stream: false,
				options: sanitizedRequest.options,
			});

			const latencyMs = Date.now() - startTime;

			const inputTokens = response.prompt_eval_count || 0;
			const outputTokens = response.eval_count || 0;

			const usage: UsageStats = {
				inputTokens,
				outputTokens,
			};

			try {
				await logUsageStats(
					model,
					usage,
					auth.apiKeyId,
					auth.workspaceId,
					latencyMs,
				);
			} catch (error) {
				console.error("Failed to log usage:", error);
			}

			let responseText = JSON.stringify(response);

			const responseSanitize = c.req.header("x-pii-response") === "true";
			if (responseSanitize) {
				const sanitized = await sanitizeResponse(responseText, {
					"x-pii-mode": c.req.header("x-pii-mode"),
				});
				responseText = sanitized.sanitizedResponse;
				if (sanitized.result.sanitized) {
					console.log("PII in response redacted:", sanitized.result.redactions);
				}
			}

			if (cacheEnabled && promptText) {
				try {
					await upsertCache(promptText, responseText, model);
				} catch (error) {
					console.error("Failed to cache response:", error);
				}
			}

			const responseHeaders: Record<string, string> = {
				"Content-Type": "application/json",
				"X-Cache": "MISS",
				"X-PII-Detected": sanitizationResult.sanitized ? "true" : "false",
				"X-PII-Count": sanitizationResult.redactions.total.toString(),
			};

			if (sanitizationResult.sanitized) {
				responseHeaders["X-PII-Entities"] = Object.keys(
					sanitizationResult.redactions.byEntity,
				).join(",");
			}

			if (responseSanitize) {
				responseHeaders["X-PII-Response-Redacted"] = "true";
			}

			for (const [key, value] of Object.entries(responseHeaders)) {
				c.header(key, value);
			}

			return c.body(responseText);
		} catch (error) {
			console.error("Chat error:", error);
			return c.json({ error: "Failed to chat with Ollama" }, 502);
		}
	});

async function logUsageStats(
	model: string,
	usage: UsageStats,
	apiKeyId: string,
	workspaceId: string,
	latencyMs: number,
) {
	const { db } = await import("./db");

	await db`
		INSERT INTO usage_logs (
			id,
			api_key_id,
			workspace_id,
			model,
			input_tokens,
			output_tokens,
			latency_ms,
			created_at
		)
		VALUES (
			${globalThis.crypto.randomUUID()},
			${apiKeyId},
			${workspaceId},
			${model},
			${usage.inputTokens},
			${usage.outputTokens},
			${latencyMs},
			${Date.now()}
		)
	`;
}

export default app;
