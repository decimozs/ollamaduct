import { db } from "./index";

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

console.log("Migration complete!");
