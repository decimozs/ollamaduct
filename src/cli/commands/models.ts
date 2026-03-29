import { getModels } from "../utils/query";

interface CliOptions {
	limit?: number;
}

export async function runModels(_options: CliOptions) {
	const models = await getModels();

	if (models.length === 0) {
		console.log("No models found.");
		console.log("Make sure Ollama is running and accessible.");
		return;
	}

	const formatted = models.map((m) => ({
		name: m.name,
		model: m.model,
		size: formatSize(m.size),
		modified_at: new Date(m.modified_at).toLocaleString(),
	}));

	console.log("");
	console.log(`Ollama Models (${models.length} available)`);
	console.log("");

	console.table(formatted);
}

function formatSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(1)} ${units[unitIndex]}`;
}
