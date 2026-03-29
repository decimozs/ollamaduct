import { getStats } from "../utils/query";

interface CliOptions {
	workspace?: string;
}

export async function runStats(options: CliOptions) {
	const stats = await getStats(options);

	const filterText = options.workspace
		? ` for workspace ${options.workspace}`
		: "";

	console.log("");
	console.log(`Usage Statistics${filterText}`);
	console.log("");

	const formatted = [
		{ metric: "Total Requests", value: stats.totalRequests.toLocaleString() },
		{
			metric: "Total Input Tokens",
			value: stats.totalInputTokens.toLocaleString(),
		},
		{
			metric: "Total Output Tokens",
			value: stats.totalOutputTokens.toLocaleString(),
		},
		{ metric: "Average Latency", value: `${stats.avgLatency}ms` },
	];

	console.table(formatted);
}
