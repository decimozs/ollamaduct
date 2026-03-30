import { db } from "../../db";

export interface UsageLog {
	id: string;
	api_key_id: string;
	workspace_id: string;
	model: string;
	input_tokens: number;
	output_tokens: number;
	latency_ms: number;
	created_at: number;
}

export interface ApiKey {
	id: string;
	key: string;
	workspace_id: string;
	name: string;
	is_active: number;
	created_at: number;
	last_used_at: number | null;
}

export interface Workspace {
	id: string;
	name: string;
	created_at: number;
	pii_mode?: string;
	pii_response_sanitize?: number;
	pii_custom_patterns?: string;
}

export interface OllamaModel {
	name: string;
	model: string;
	size: number;
	modified_at: string;
}

export async function getUsageLogs(options: {
	limit?: number;
	workspace?: string;
	model?: string;
}): Promise<UsageLog[]> {
	const limit = options.limit || 20;

	let result: UsageLog[];

	if (options.workspace && options.model) {
		result = (await db`
      SELECT * FROM usage_logs 
      WHERE workspace_id = ${options.workspace}
      AND model = ${options.model}
      ORDER BY created_at DESC LIMIT ${limit}
    `) as UsageLog[];
	} else if (options.workspace) {
		result = (await db`
      SELECT * FROM usage_logs 
      WHERE workspace_id = ${options.workspace}
      ORDER BY created_at DESC LIMIT ${limit}
    `) as UsageLog[];
	} else if (options.model) {
		result = (await db`
      SELECT * FROM usage_logs 
      WHERE model = ${options.model}
      ORDER BY created_at DESC LIMIT ${limit}
    `) as UsageLog[];
	} else {
		result = (await db`
      SELECT * FROM usage_logs 
      ORDER BY created_at DESC LIMIT ${limit}
    `) as UsageLog[];
	}

	return result;
}

export async function getStats(options: { workspace?: string }): Promise<{
	totalRequests: number;
	totalInputTokens: number;
	totalOutputTokens: number;
	avgLatency: number;
}> {
	interface StatsRow {
		total_requests: number;
		total_input_tokens: number;
		total_output_tokens: number;
		avg_latency: number;
	}

	let result: StatsRow[];

	if (options.workspace) {
		result = await db`
      SELECT 
        COUNT(*) as total_requests,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(AVG(latency_ms), 0) as avg_latency
      FROM usage_logs 
      WHERE workspace_id = ${options.workspace}
    `;
	} else {
		result = await db`
      SELECT 
        COUNT(*) as total_requests,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(AVG(latency_ms), 0) as avg_latency
      FROM usage_logs
    `;
	}

	const row = result[0];

	if (!row) {
		return {
			totalRequests: 0,
			totalInputTokens: 0,
			totalOutputTokens: 0,
			avgLatency: 0,
		};
	}

	return {
		totalRequests: row.total_requests || 0,
		totalInputTokens: row.total_input_tokens || 0,
		totalOutputTokens: row.total_output_tokens || 0,
		avgLatency: Math.round(row.avg_latency || 0),
	};
}

export async function getApiKeys(_options: {
	limit?: number;
}): Promise<ApiKey[]> {
	const result = await db`SELECT * FROM api_keys ORDER BY created_at DESC`;
	return result as ApiKey[];
}

export async function createApiKey(
	name: string,
	workspaceId: string,
): Promise<ApiKey> {
	const id = `key_${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
	const key = `sk_${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
	const now = Date.now();

	await db`
		INSERT INTO api_keys (id, key, workspace_id, name, is_active, created_at)
		VALUES (${id}, ${key}, ${workspaceId}, ${name}, 1, ${now})
	`;

	return {
		id,
		key,
		workspace_id: workspaceId,
		name,
		is_active: 1,
		created_at: now,
		last_used_at: null,
	};
}

export async function getWorkspaces(_options: {
	limit?: number;
}): Promise<Workspace[]> {
	const result = await db`SELECT * FROM workspaces ORDER BY created_at DESC`;
	return result as Workspace[];
}

export async function getModels(): Promise<OllamaModel[]> {
	try {
		const { OLLAMA_CONFIG } = await import("../../config");
		const response = await fetch(`${OLLAMA_CONFIG.url}/api/tags`);
		if (!response.ok) {
			throw new Error(`Failed to fetch models: ${response.statusText}`);
		}
		const data = (await response.json()) as { models?: OllamaModel[] };
		return data.models || [];
	} catch (error) {
		console.error("Failed to fetch Ollama models:", error);
		return [];
	}
}

export function formatTimestamp(timestamp: number): string {
	return new Date(timestamp).toLocaleString();
}
