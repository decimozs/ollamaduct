import { db } from "../db";

export interface AuthContext {
	workspaceId: string;
	apiKeyId: string;
}

export async function authMiddleware(c: {
	req: {
		header: (name: string) => string | undefined;
	};
	json: (body: unknown, status?: number) => Response;
}): Promise<AuthContext | null> {
	const authHeader = c.req.header("Authorization");

	if (!authHeader) {
		c.json({ error: "Missing Authorization header" }, 401);
		return null;
	}

	const [type, key] = authHeader.split(" ");

	if (type !== "Bearer" || !key) {
		c.json({ error: "Invalid Authorization header format" }, 401);
		return null;
	}

	const [apiKey] = await db`SELECT * FROM api_keys WHERE key = ${key}`;

	if (!apiKey) {
		c.json({ error: "Invalid API key" }, 401);
		return null;
	}

	if (!apiKey.is_active) {
		c.json({ error: "API key is inactive" }, 401);
		return null;
	}

	await db`UPDATE api_keys SET last_used_at = ${Date.now()} WHERE id = ${apiKey.id}`;

	return {
		workspaceId: apiKey.workspace_id,
		apiKeyId: apiKey.id,
	};
}
