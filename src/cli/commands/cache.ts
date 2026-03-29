import { clearCache, getCacheStats } from "../../lib/vector-store";

interface CliOptions {
	model?: string;
	clear?: boolean;
}

export async function runCache(options: CliOptions) {
	if (options.clear) {
		const count = await clearCache(options.model);
		console.log("");
		if (options.model) {
			console.log(`Cleared ${count} cache entries for model: ${options.model}`);
		} else {
			console.log(`Cleared all ${count} cache entries`);
		}
		return;
	}

	const stats = await getCacheStats();

	console.log("");
	console.log("Semantic Cache Statistics");
	console.log("");

	const formatted = [
		{ metric: "Total Entries", value: stats.totalEntries.toString() },
		{ metric: "Expired Entries", value: stats.expiredEntries.toString() },
	];

	for (const [model, count] of Object.entries(stats.byModel)) {
		formatted.push({ metric: `  - ${model}`, value: count.toString() });
	}

	console.table(formatted);
	console.log("");
	console.log("To clear cache:");
	console.log("  ollamaduct cache --clear            # Clear all");
	console.log("  ollamaduct cache --clear --model llama2  # Clear by model");
}
