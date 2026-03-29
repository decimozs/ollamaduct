import type { PIIConfig } from "./types";

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

if (!API_KEY) {
	console.warn(
		"Warning: API_KEY not set in .env - gateway will not be secured!",
	);
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
