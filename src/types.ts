import type { HonoLogLayerVariables } from "@loglayer/hono";
import type { DetectionMode } from "./lib/pii";

export interface AppBindings {
	Variables: {
		logger: HonoLogLayerVariables;
	};
}

export interface OllamaMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

export interface OllamaRequest {
	model: string;
	messages: OllamaMessage[];
	stream?: boolean;
	options?: {
		temperature?: number;
		top_p?: number;
		top_k?: number;
		repeat_penalty?: number;
		seed?: number;
	};
}

export interface OllamaResponse {
	model: string;
	message: OllamaMessage;
	done: boolean;
	total_duration?: number;
	load_duration?: number;
	prompt_eval_count?: number;
	eval_count?: number;
}

export interface OllamaModel {
	name: string;
	model: string;
	size: number;
	modified_at: string;
}

export interface OllamaTagsResponse {
	models: OllamaModel[];
}

export interface UsageStats {
	inputTokens: number;
	outputTokens: number;
}

export interface PIIConfig {
	defaultMode: DetectionMode;
	replacements: Record<string, string>;
	responseSanitization: boolean;
	customPatterns: Array<{
		name: string;
		regex: string;
		entityType: string;
		score?: number;
	}>;
}

export interface SanitizationResult {
	sanitized: boolean;
	redactions: {
		total: number;
		byEntity: Record<string, number>;
	};
}
