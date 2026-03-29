/**
 * PII Sanitization Middleware
 * Detects and redacts personally identifiable information in LLM requests
 */

import { PII_CONFIG } from "../config";
import type { CustomPattern, DetectionMode } from "../lib/pii";
import { PIIDetector, sanitizeMessages } from "../lib/pii";
import type { SanitizationResult } from "../types";

/**
 * Sanitize request messages for PII
 * Returns sanitized body and metadata about redactions
 */
export async function sanitizeRequest(
	body: { messages?: Array<{ role?: string; content?: string }> },
	headers: {
		"x-pii-mode"?: string;
		"x-pii-audit"?: string;
	},
): Promise<{
	sanitizedBody: typeof body;
	result: SanitizationResult;
}> {
	// Get PII mode from headers or use default
	const piiModeHeader = headers["x-pii-mode"];
	const piiMode: DetectionMode =
		piiModeHeader === "strict" ||
		piiModeHeader === "balanced" ||
		piiModeHeader === "audit" ||
		piiModeHeader === "off"
			? piiModeHeader
			: PII_CONFIG.defaultMode;

	// Check if in audit-only mode (detect but don't redact)
	const auditOnly = headers["x-pii-audit"] === "true" || piiMode === "audit";

	// If PII detection is off, return original body
	if (piiMode === "off") {
		return {
			sanitizedBody: body,
			result: {
				sanitized: false,
				redactions: {
					total: 0,
					byEntity: {},
				},
			},
		};
	}

	// Extract messages
	const messages = body.messages || [];
	if (messages.length === 0) {
		return {
			sanitizedBody: body,
			result: {
				sanitized: false,
				redactions: {
					total: 0,
					byEntity: {},
				},
			},
		};
	}

	// Convert custom patterns from config
	const customPatterns: CustomPattern[] = PII_CONFIG.customPatterns.map(
		(p) => ({
			name: p.name,
			regex: new RegExp(p.regex, "g"),
			entityType: p.entityType,
			score: p.score,
		}),
	);

	// Create detector
	const detector = new PIIDetector({
		mode: piiMode,
		customPatterns,
	});

	// Analyze all messages
	const messageTexts = messages.map((m) => m.content || "");
	const allDetections = detector.analyzeBatch(messageTexts);

	// Calculate total detections
	const totalDetections = allDetections.reduce(
		(sum, detections) => sum + detections.length,
		0,
	);

	// If no PII detected, return original
	if (totalDetections === 0) {
		return {
			sanitizedBody: body,
			result: {
				sanitized: false,
				redactions: {
					total: 0,
					byEntity: {},
				},
			},
		};
	}

	// If audit-only mode, don't redact but return detection info
	if (auditOnly) {
		const stats: Record<string, number> = {};
		for (const detections of allDetections) {
			for (const detection of detections) {
				stats[detection.entityType] = (stats[detection.entityType] || 0) + 1;
			}
		}

		return {
			sanitizedBody: body,
			result: {
				sanitized: false,
				redactions: {
					total: totalDetections,
					byEntity: stats,
				},
			},
		};
	}

	// Sanitize messages
	const { sanitizedMessages, totalRedactions, byEntity } = sanitizeMessages(
		messages,
		allDetections,
		{ replacements: PII_CONFIG.replacements },
	);

	return {
		sanitizedBody: {
			...body,
			messages: sanitizedMessages,
		},
		result: {
			sanitized: totalRedactions > 0,
			redactions: {
				total: totalRedactions,
				byEntity,
			},
		},
	};
}

/**
 * Sanitize LLM response for PII (optional, opt-in)
 */
export async function sanitizeResponse(
	responseText: string,
	headers: {
		"x-pii-mode"?: string;
	},
): Promise<{
	sanitizedResponse: string;
	result: SanitizationResult;
}> {
	// Get PII mode
	const piiModeHeader = headers["x-pii-mode"];
	const piiMode: DetectionMode =
		piiModeHeader === "strict" ||
		piiModeHeader === "balanced" ||
		piiModeHeader === "audit" ||
		piiModeHeader === "off"
			? piiModeHeader
			: PII_CONFIG.defaultMode;

	if (piiMode === "off") {
		return {
			sanitizedResponse: responseText,
			result: {
				sanitized: false,
				redactions: {
					total: 0,
					byEntity: {},
				},
			},
		};
	}

	// Parse JSON response
	let responseBody: { choices?: Array<{ message?: { content?: string } }> };
	try {
		responseBody = JSON.parse(responseText);
	} catch {
		// If not JSON, return as-is
		return {
			sanitizedResponse: responseText,
			result: {
				sanitized: false,
				redactions: {
					total: 0,
					byEntity: {},
				},
			},
		};
	}

	// Extract content from response
	const choices = responseBody.choices || [];
	if (choices.length === 0) {
		return {
			sanitizedResponse: responseText,
			result: {
				sanitized: false,
				redactions: {
					total: 0,
					byEntity: {},
				},
			},
		};
	}

	// Create detector
	const detector = new PIIDetector({
		mode: piiMode,
		customPatterns: [],
	});

	// Check each choice for PII
	let hasRedactions = false;
	const combinedStats: Record<string, number> = {};

	for (const choice of choices) {
		const content = choice.message?.content || "";
		const detections = detector.analyze(content);

		if (detections.length > 0) {
			const { text: redactedText, stats } = await import(
				"../lib/pii/anonymizer"
			).then((m) =>
				m.anonymize(content, detections, {
					replacements: PII_CONFIG.replacements,
				}),
			);

			if (choice.message) {
				choice.message.content = redactedText;
			}

			hasRedactions = true;

			for (const [entity, count] of Object.entries(stats.byEntity)) {
				combinedStats[entity] = (combinedStats[entity] || 0) + count;
			}
		}
	}

	return {
		sanitizedResponse: JSON.stringify(responseBody),
		result: {
			sanitized: hasRedactions,
			redactions: {
				total: Object.values(combinedStats).reduce(
					(sum, count) => sum + count,
					0,
				),
				byEntity: combinedStats,
			},
		},
	};
}
