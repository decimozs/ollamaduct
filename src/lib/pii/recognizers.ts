/**
 * PII Detection Engine
 * Analyzes text for personally identifiable information
 */

import type { CustomPattern, PatternConfig } from "./patterns";
import { getAllPatterns } from "./patterns";

export interface DetectionResult {
	entityType: string;
	text: string;
	start: number;
	end: number;
	score: number;
}

export type DetectionMode = "strict" | "balanced" | "audit" | "off";

export interface DetectorOptions {
	mode: DetectionMode;
	customPatterns?: CustomPattern[];
	minScore?: number;
}

/**
 * PII Detector class
 */
export class PIIDetector {
	private patterns: Record<string, PatternConfig>;
	private mode: DetectionMode;
	private minScore: number;

	constructor(options: DetectorOptions) {
		this.mode = options.mode;
		this.patterns = getAllPatterns(options.customPatterns);

		// Set minimum score based on mode
		if (options.minScore !== undefined) {
			this.minScore = options.minScore;
		} else {
			this.minScore = this.mode === "strict" ? 0.5 : 0.8;
		}
	}

	/**
	 * Analyze text and return all PII detections
	 */
	analyze(text: string): DetectionResult[] {
		if (this.mode === "off" || !text) {
			return [];
		}

		const results: DetectionResult[] = [];

		for (const [entityType, pattern] of Object.entries(this.patterns)) {
			// Skip low-confidence patterns in balanced mode
			if (this.mode === "balanced" && pattern.score < this.minScore) {
				continue;
			}

			// Reset regex lastIndex to start from beginning
			pattern.regex.lastIndex = 0;

			let match: RegExpExecArray | null = null;
			// biome-ignore lint/suspicious/noAssignInExpressions: regex.exec pattern requires assignment in loop
			while ((match = pattern.regex.exec(text)) !== null) {
				const matchedText = match[0];
				const start = match.index;
				const end = start + matchedText.length;

				// Apply custom validator if exists
				if (pattern.validator && !pattern.validator(matchedText)) {
					continue;
				}

				results.push({
					entityType,
					text: matchedText,
					start,
					end,
					score: pattern.score,
				});
			}
		}

		// Sort by position in text
		return results.sort((a, b) => a.start - b.start);
	}

	/**
	 * Analyze multiple texts in batch
	 */
	analyzeBatch(texts: string[]): DetectionResult[][] {
		return texts.map((text) => this.analyze(text));
	}

	/**
	 * Check if text contains any PII
	 */
	containsPII(text: string): boolean {
		return this.analyze(text).length > 0;
	}

	/**
	 * Get statistics about detected PII
	 */
	getStats(detections: DetectionResult[]): Record<string, number> {
		const stats: Record<string, number> = {};

		for (const detection of detections) {
			stats[detection.entityType] = (stats[detection.entityType] || 0) + 1;
		}

		return stats;
	}
}

/**
 * Quick helper to detect PII in text
 */
export function detectPII(
	text: string,
	mode: DetectionMode = "balanced",
	customPatterns?: CustomPattern[],
): DetectionResult[] {
	const detector = new PIIDetector({ mode, customPatterns });
	return detector.analyze(text);
}
