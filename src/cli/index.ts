import { runLogs } from "./commands/logs";
import { runStats } from "./commands/stats";
import { runKeys } from "./commands/keys";
import { runWorkspaces } from "./commands/workspaces";
import { runCache } from "./commands/cache";
import { runModels } from "./commands/models";

interface CliOptions {
	limit?: number;
	workspace?: string;
	model?: string;
	help?: boolean;
	clear?: boolean;
	create?: string;
	delete?: string;
}

function parseArgs(): { command: string; options: CliOptions } {
	const args = process.argv.slice(2);
	const options: CliOptions = {};
	let command = "help";

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const nextArg = args[i + 1];

		if (arg === "--help" || arg === "-h") {
			options.help = true;
			continue;
		}

		if (arg === "--clear") {
			options.clear = true;
			continue;
		}

		if (arg === "--limit" && nextArg && !nextArg.startsWith("--")) {
			options.limit = parseInt(nextArg, 10);
			i++;
		} else if (arg === "--workspace" && nextArg && !nextArg.startsWith("--")) {
			options.workspace = nextArg;
			i++;
		} else if (arg === "--model" && nextArg && !nextArg.startsWith("--")) {
			options.model = nextArg;
			i++;
		} else if (arg === "--create" && nextArg && !nextArg.startsWith("--")) {
			options.create = nextArg;
			i++;
		} else if (arg === "--delete" && nextArg && !nextArg.startsWith("--")) {
			options.delete = nextArg;
			i++;
		} else if (arg && !arg.startsWith("--")) {
			command = arg;
		}
	}

	return { command, options };
}

function printHelp() {
	console.log(
		`
Ollamaduct CLI - Ollama Gateway

Usage: ollamaduct <command> [options]

Commands:
  logs         View usage logs
  stats        View usage statistics
  keys         Manage API keys
  workspaces   Manage workspaces
  models       List available Ollama models
  cache        Manage semantic cache

Workspace Commands:
  ollamaduct workspaces                   List all workspaces
  ollamaduct workspaces --create "Name"   Create a new workspace
  ollamaduct workspaces --delete <id>     Delete a workspace

Options:
  --limit <n>       Limit number of results (default: 20)
  --workspace <id>  Filter by workspace ID
  --model <name>    Filter by model name
  --clear           Clear cache
  --help, -h        Show this help message

Examples:
  ollamaduct logs
  ollamaduct logs --limit 50
  ollamaduct logs --workspace ws_abc123
  ollamaduct stats
  ollamaduct stats --workspace ws_abc123
  ollamaduct workspaces
  ollamaduct workspaces --create "My Project"
  ollamaduct models
  ollamaduct cache
  ollamaduct cache --clear
  `.trim(),
	);
}

async function main() {
	const { command, options } = parseArgs();

	if (options.help) {
		printHelp();
		return;
	}

	switch (command) {
		case "logs":
			await runLogs(options);
			break;
		case "stats":
			await runStats(options);
			break;
		case "keys":
			await runKeys(options);
			break;
		case "workspaces":
			await runWorkspaces(options);
			break;
		case "models":
			await runModels(options);
			break;
		case "cache":
			await runCache(options);
			break;
		case "help":
			printHelp();
			break;
		default:
			console.error(`Unknown command: ${command}`);
			console.log("Run 'ollamaduct --help' for usage information");
			process.exit(1);
	}
}

main();
