import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { PIIConfig } from "./types";

function getDataDir(): string {
	if (process.platform === "win32") {
		return process.env.APPDATA
			? join(process.env.APPDATA, "ollamaduct")
			: join(homedir(), "AppData", "Roaming", "ollamaduct");
	}
	return join(homedir(), ".ollamaduct");
}

export const DATA_DIR = getDataDir();
export const DB_PATH = join(DATA_DIR, "ollamaduct.db");
export const CONFIG_PATH = join(DATA_DIR, "config.env");
export const PID_PATH = join(DATA_DIR, "server.pid");

function loadConfigFile(filePath: string): void {
	if (!existsSync(filePath)) {
		return;
	}

	const content = readFileSync(filePath, "utf-8");
	for (const line of content.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith("#")) {
			const equalsIndex = trimmed.indexOf("=");
			if (equalsIndex > 0) {
				const key = trimmed.slice(0, equalsIndex).trim();
				const value = trimmed.slice(equalsIndex + 1).trim();
				process.env[key] = value;
			}
		}
	}
}

loadConfigFile(CONFIG_PATH);

if (!existsSync(CONFIG_PATH) && existsSync("./.env")) {
	loadConfigFile("./.env");
}

export interface OllamaConfig {
	url: string;
	apiKey?: string;
}

export const OLLAMA_CONFIG: OllamaConfig = {
	url: process.env.OLLAMA_URL || "http://localhost:11434",
	apiKey: process.env.OLLAMA_KEY,
};

export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "llama2";

export const API_KEY = process.env.API_KEY;

if (!API_KEY && process.env.SHOW_API_KEY_WARNING === "true") {
	console.warn("Warning: API_KEY not set - gateway will not be secured!");
}

export const PII_CONFIG: PIIConfig = {
	defaultMode: "balanced",

	replacements: {
		EMAIL: "[EMAIL]",
		CREDIT_CARD: "[CREDIT_CARD]",
		US_SSN: "[SSN]",
		PHONE_NUMBER: "[PHONE]",
		IP_ADDRESS: "[IP_ADDRESS]",
		IPV6_ADDRESS: "[IP_ADDRESS]",
		OPENAI_API_KEY: "[API_KEY]",
		AWS_ACCESS_KEY: "[AWS_KEY]",
		AWS_SECRET_KEY: "[AWS_SECRET]",
		GITHUB_TOKEN: "[GITHUB_TOKEN]",
		GOOGLE_API_KEY: "[API_KEY]",
		AZURE_KEY: "[AZURE_KEY]",
		SLACK_TOKEN: "[SLACK_TOKEN]",
		US_BANK_ACCOUNT: "[BANK_ACCOUNT]",
		IBAN: "[IBAN]",
		CRYPTO_WALLET_BTC: "[CRYPTO_WALLET]",
		CRYPTO_WALLET_ETH: "[CRYPTO_WALLET]",
		MAC_ADDRESS: "[MAC_ADDRESS]",
		URL_WITH_CREDENTIALS: "[URL_REDACTED]",
		JWT_TOKEN: "[JWT_TOKEN]",
		PRIVATE_KEY: "[PRIVATE_KEY]",
		PASSWORD_IN_URL: "[PASSWORD]",
		US_PASSPORT: "[PASSPORT]",
		MEDICAL_LICENSE: "[MEDICAL_LICENSE]",
		DATE_OF_BIRTH: "[DATE]",
	},

	responseSanitization: false,

	customPatterns: [],
};
