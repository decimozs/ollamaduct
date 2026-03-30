import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function getDefaultDataDir(): string {
	if (process.platform === "win32") {
		return process.env.APPDATA
			? join(process.env.APPDATA, "ollamaduct")
			: join(homedir(), "AppData", "Roaming", "ollamaduct");
	}
	return join(homedir(), ".ollamaduct");
}

function parseArgs(): {
	port: number;
	configPath: string;
	showConfig: boolean;
} {
	const args = process.argv.slice(2);
	let port = 3000;
	let configPath = "";
	let showConfig = false;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--port" && i + 1 < args.length) {
			const val = args[i + 1];
			if (val) {
				port = parseInt(val, 10);
				i++;
			}
		} else if (arg === "--config" && i + 1 < args.length) {
			const val = args[i + 1];
			if (val) {
				configPath = val;
				i++;
			}
		} else if (arg === "--show-config") {
			showConfig = true;
		}
	}

	if (!configPath) {
		configPath = join(getDefaultDataDir(), "config.env");
	}

	return { port, configPath, showConfig };
}

const { port, configPath, showConfig } = parseArgs();

console.log("");
console.log("===========================================");
console.log("         Ollamaduct Gateway Server        ");
console.log("===========================================");
console.log("");

function loadConfigFromFile(filePath: string): void {
	if (!existsSync(filePath)) {
		console.warn(`Config file not found: ${filePath}`);
		return;
	}

	const content = readFileSync(filePath, "utf-8");
	const lines = content.split(/\r?\n/);
	let loadedCount = 0;

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith("#")) {
			const equalsIndex = trimmed.indexOf("=");
			if (equalsIndex > 0) {
				const key = trimmed.slice(0, equalsIndex).trim();
				const value = trimmed.slice(equalsIndex + 1).trim();
				process.env[key] = value;
				loadedCount++;
			}
		}
	}
	console.log(`Loaded ${loadedCount} config values from ${filePath}`);
}

if (existsSync(configPath)) {
	loadConfigFromFile(configPath);
	console.log("");
} else {
	console.log(`Note: Config file not found at ${configPath}`);
	console.log("Using environment variables or defaults.");
	console.log("");
}

if (showConfig) {
	console.log("Current Configuration:");
	console.log("-----------------------");
	console.log(`PORT: ${port}`);
	console.log(
		`OLLAMA_URL: ${process.env.OLLAMA_URL || "http://localhost:11434"}`,
	);
	console.log(
		`OLLAMA_API_KEY: ${process.env.OLLAMA_API_KEY ? "***set***" : "not set"}`,
	);
	console.log(`DEFAULT_MODEL: ${process.env.DEFAULT_MODEL || "llama2"}`);
	console.log(`API_KEY: ${process.env.API_KEY ? "***set***" : "not set"}`);
	console.log("");
}

import app from "./index";

Bun.serve({
	fetch: app.fetch,
	port,
	idleTimeout: 255,
});

console.log(`Gateway server running at http://localhost:${port}`);
