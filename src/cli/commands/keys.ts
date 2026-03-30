import {
	createApiKey,
	formatTimestamp,
	getApiKeys,
	getWorkspaces,
} from "../utils/query";

interface CliOptions {
	limit?: number;
	create?: string;
	workspace?: string;
}

export async function runKeys(options: CliOptions) {
	if (options.create) {
		const workspaces = await getWorkspaces({});
		const workspaceId = options.workspace || workspaces[0]?.id;

		if (!workspaceId) {
			console.log("No workspace found. Create one first:");
			console.log('  ollamaduct workspaces --create "My Workspace"');
			return;
		}

		const key = await createApiKey(options.create, workspaceId);
		console.log("");
		console.log("API key created successfully!");
		console.log("");
		console.log(`  Name: ${options.create}`);
		console.log(`  Key: ${key.key}`);
		console.log(`  Workspace: ${workspaceId}`);
		console.log("");
		console.log("Use this key in requests:");
		console.log(`  curl -H "Authorization: Bearer ${key.key}" ...`);
		return;
	}

	const keys = await getApiKeys(options);

	if (keys.length === 0) {
		console.log("No API keys found.");
		return;
	}

	const formatted = keys.map((key) => ({
		id: key.id,
		name: key.name,
		key: `${key.key.substring(0, 20)}...`,
		workspace_id: key.workspace_id,
		is_active: key.is_active ? "Yes" : "No",
		created_at: formatTimestamp(key.created_at),
		last_used: key.last_used_at ? formatTimestamp(key.last_used_at) : "Never",
	}));

	console.log("");
	console.log(`API Keys (${keys.length} keys)`);
	console.log("");

	console.table(formatted);
}
