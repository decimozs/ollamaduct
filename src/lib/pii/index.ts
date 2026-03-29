/**
 * PII Detection and Anonymization Library
 * Presidio-inspired privacy shield for LLM Gateway
 */

export type { AnonymizationResult, AnonymizerConfig } from "./anonymizer";
export { anonymize, sanitizeMessages } from "./anonymizer";
export type { CustomPattern, PatternConfig } from "./patterns";
export { getAllPatterns, PRESIDIO_PATTERNS } from "./patterns";
export type {
	DetectionMode,
	DetectionResult,
	DetectorOptions,
} from "./recognizers";
export { detectPII, PIIDetector } from "./recognizers";
