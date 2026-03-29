/**
 * PII Detection Patterns - Presidio-inspired
 * Comprehensive regex patterns for detecting various types of PII
 */

export interface PatternConfig {
	regex: RegExp;
	score: number;
	validator?: (match: string) => boolean;
	description?: string;
}

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
	const digits = cardNumber.replace(/\D/g, "");
	let sum = 0;
	let isEven = false;

	for (let i = digits.length - 1; i >= 0; i--) {
		let digit = parseInt(digits[i] || "0", 10);

		if (isEven) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}

		sum += digit;
		isEven = !isEven;
	}

	return sum % 10 === 0;
}

/**
 * Comprehensive PII patterns based on Presidio entity types
 */
export const PRESIDIO_PATTERNS: Record<string, PatternConfig> = {
	EMAIL: {
		regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
		score: 1.0,
		description: "Email addresses",
	},

	CREDIT_CARD: {
		regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
		score: 0.95,
		validator: luhnCheck,
		description: "Credit card numbers (Visa, Mastercard, Amex, etc.)",
	},

	US_SSN: {
		regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
		score: 0.9,
		description: "US Social Security Numbers",
	},

	PHONE_NUMBER: {
		regex:
			/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b|\b\d{3}-\d{4}\b/g,
		score: 0.85,
		description: "US Phone numbers",
	},

	IP_ADDRESS: {
		regex:
			/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
		score: 0.8,
		description: "IPv4 addresses",
	},

	IPV6_ADDRESS: {
		regex:
			/\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b|\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b/g,
		score: 0.8,
		description: "IPv6 addresses",
	},

	OPENAI_API_KEY: {
		regex: /\bsk-[a-zA-Z0-9]{10,}\b/g,
		score: 1.0,
		description: "OpenAI API keys",
	},

	AWS_ACCESS_KEY: {
		regex: /\b(AKIA[0-9A-Z]{16})\b/g,
		score: 0.95,
		description: "AWS Access Key IDs",
	},

	AWS_SECRET_KEY: {
		regex: /\b[A-Za-z0-9/+=]{40}\b/g,
		score: 0.7,
		description: "AWS Secret Access Keys",
	},

	GITHUB_TOKEN: {
		regex: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g,
		score: 1.0,
		description: "GitHub Personal Access Tokens",
	},

	GOOGLE_API_KEY: {
		regex: /\bAIza[0-9A-Za-z_-]{35}\b/g,
		score: 0.95,
		description: "Google API keys",
	},

	AZURE_KEY: {
		regex: /\b[a-zA-Z0-9/+=]{88}\b/g,
		score: 0.7,
		description: "Azure keys",
	},

	SLACK_TOKEN: {
		regex: /\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}\b/g,
		score: 0.95,
		description: "Slack tokens",
	},

	US_BANK_ACCOUNT: {
		regex: /\b\d{8,17}\b/g,
		score: 0.5,
		description: "US Bank account numbers (low confidence)",
	},

	IBAN: {
		regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g,
		score: 0.85,
		description: "International Bank Account Numbers",
	},

	CRYPTO_WALLET_BTC: {
		regex: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
		score: 0.8,
		description: "Bitcoin wallet addresses",
	},

	CRYPTO_WALLET_ETH: {
		regex: /\b0x[a-fA-F0-9]{40}\b/g,
		score: 0.8,
		description: "Ethereum wallet addresses",
	},

	MAC_ADDRESS: {
		regex: /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b/g,
		score: 0.75,
		description: "MAC addresses",
	},

	URL_WITH_CREDENTIALS: {
		regex: /\b(?:https?:\/\/)[^:]+:[^@]+@[^\s]+/g,
		score: 0.95,
		description: "URLs with embedded credentials",
	},

	JWT_TOKEN: {
		regex: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\b/g,
		score: 0.9,
		description: "JWT tokens",
	},

	PRIVATE_KEY: {
		regex: /-----BEGIN (?:RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/g,
		score: 1.0,
		description: "Private keys",
	},

	PASSWORD_IN_URL: {
		regex: /\b(?:password|pwd|pass)=([^&\s]+)/gi,
		score: 0.9,
		description: "Passwords in URLs or query parameters",
	},

	US_PASSPORT: {
		regex: /\b[0-9]{9}\b/g,
		score: 0.5,
		description: "US Passport numbers (low confidence)",
	},

	MEDICAL_LICENSE: {
		regex: /\b[A-Z]{1,2}\d{4,8}\b/g,
		score: 0.6,
		description: "Medical license numbers",
	},

	DATE_OF_BIRTH: {
		regex:
			/\b(?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12][0-9]|3[01])[-\/](?:19|20)\d{2}\b/g,
		score: 0.6,
		description: "Dates of birth (MM/DD/YYYY or MM-DD-YYYY)",
	},
};

/**
 * Custom pattern interface for organization-specific PII
 */
export interface CustomPattern {
	name: string;
	regex: RegExp;
	entityType: string;
	score?: number;
	description?: string;
}

/**
 * Get all patterns including custom ones
 */
export function getAllPatterns(
	customPatterns?: CustomPattern[],
): Record<string, PatternConfig> {
	const allPatterns = { ...PRESIDIO_PATTERNS };

	if (customPatterns) {
		for (const custom of customPatterns) {
			allPatterns[custom.entityType] = {
				regex: custom.regex,
				score: custom.score || 0.8,
				description: custom.description,
			};
		}
	}

	return allPatterns;
}
