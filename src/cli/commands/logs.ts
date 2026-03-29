import { formatTimestamp, getUsageLogs } from "../utils/query";

interface CliOptions {
	limit?: number;
	workspace?: string;
	model?: string;
}

export async function runLogs(options: CliOptions) {
	const logs = await getUsageLogs(options);

	if (logs.length === 0) {
		console.log("No usage logs found.");
		if (options.workspace || options.model) {
			console.log("Try removing filters to see more results.");
		}
		return;
	}

	const formatted = logs.map((log) => ({
		created_at: formatTimestamp(log.created_at),
		model: log.model,
		input_tokens: log.input_tokens,
		output_tokens: log.output_tokens,
		latency_ms: `${log.latency_ms}ms`,
	}));

	console.log("");
	console.log(`Usage Logs (${logs.length} entries)`);
	console.log("");

	console.table(formatted);
}
