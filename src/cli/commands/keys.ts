import { formatTimestamp, getApiKeys } from "../utils/query";

interface CliOptions {
	limit?: number;
}

export async function runKeys(options: CliOptions) {
	const keys = await getApiKeys(options);

	if (keys.length === 0) {
		console.log("No API keys found.");
		return;
	}

	const formatted = keys.map((key) => ({
		id: key.id,
		name: key.name,
		key: key.key.substring(0, 20) + "...",
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
