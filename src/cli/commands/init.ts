import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { CONFIG_PATH, DATA_DIR } from "../../config";

const DEFAULT_CONFIG = `# Ollamaduct Configuration
# Generated on first run

# Ollama Settings
OLLAMA_URL=http://localhost:11434

# Security - REQUIRED for production
# Generate a secure key: openssl rand -base64 32
API_KEY=

# Default model to use when not specified
DEFAULT_MODEL=llama2
`;

export async function runInit(options: { force?: boolean }) {
	console.log("");
	console.log("Initializing Ollamaduct...");
	console.log("");

	const dataDir = DATA_DIR;

	if (existsSync(dataDir) && !options.force) {
		console.log(`Data directory already exists: ${dataDir}`);
		console.log("Use --force to reinitialize.");
		return;
	}

	if (!existsSync(dataDir)) {
		mkdirSync(dataDir, { recursive: true });
		console.log(`Created data directory: ${dataDir}`);
	}

	if (!existsSync(CONFIG_PATH)) {
		writeFileSync(CONFIG_PATH, DEFAULT_CONFIG);
		console.log(`Created config file: ${CONFIG_PATH}`);
	} else {
		console.log(`Config file already exists: ${CONFIG_PATH}`);
	}

	console.log("");
	console.log("Running database migrations...");
	console.log("");

	try {
		const { db } = await import("../../db");
		await db`
			CREATE TABLE IF NOT EXISTS workspaces (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				created_at INTEGER,
				pii_mode TEXT DEFAULT 'balanced',
				pii_response_sanitize INTEGER DEFAULT 0,
				pii_custom_patterns TEXT
			)
		`;

		await db`
			CREATE TABLE IF NOT EXISTS api_keys (
				id TEXT PRIMARY KEY,
				key TEXT NOT NULL UNIQUE,
				workspace_id TEXT NOT NULL REFERENCES workspaces(id),
				name TEXT NOT NULL,
				is_active INTEGER DEFAULT 1,
				created_at INTEGER,
				last_used_at INTEGER,
				pii_mode TEXT
			)
		`;

		await db`
			CREATE TABLE IF NOT EXISTS usage_logs (
				id TEXT PRIMARY KEY,
				api_key_id TEXT NOT NULL REFERENCES api_keys(id),
				workspace_id TEXT NOT NULL REFERENCES workspaces(id),
				model TEXT NOT NULL,
				input_tokens INTEGER NOT NULL,
				output_tokens INTEGER NOT NULL,
				latency_ms INTEGER NOT NULL,
				created_at INTEGER
			)
		`;

		await db`
			CREATE TABLE IF NOT EXISTS semantic_cache (
				id TEXT PRIMARY KEY,
				model TEXT NOT NULL,
				prompt_hash TEXT NOT NULL,
				prompt_text TEXT NOT NULL,
				response_text TEXT NOT NULL,
				similarity REAL NOT NULL,
				created_at INTEGER NOT NULL,
				expires_at INTEGER
			)
		`;

		await db`
			CREATE INDEX IF NOT EXISTS idx_semantic_cache_model 
			ON semantic_cache(model)
		`;

		await db`
			CREATE INDEX IF NOT EXISTS idx_semantic_cache_expires 
			ON semantic_cache(expires_at)
		`;

		console.log("Database initialized successfully!");
	} catch (error) {
		console.error("Failed to initialize database:", error);
		process.exit(1);
	}

	console.log("");
	console.log("Initialization complete!");
	console.log("");
	console.log("Next steps:");
	console.log(`  1. Edit config: ${CONFIG_PATH}`);
	console.log("  2. Set API_KEY in config (required for production)");
	console.log("  3. Start server: ollamaduct server start");
	console.log("");
}
