/**
 * PII Detection and Anonymization Library
 * Presidio-inspired privacy shield for LLM Gateway
 */

export { PRESIDIO_PATTERNS, getAllPatterns } from "./patterns";
export type { PatternConfig, CustomPattern } from "./patterns";

export { PIIDetector, detectPII } from "./recognizers";
export type {
	DetectionResult,
	DetectionMode,
	DetectorOptions,
} from "./recognizers";

export { anonymize, sanitizeMessages } from "./anonymizer";
export type { AnonymizerConfig, AnonymizationResult } from "./anonymizer";
