/**
 * PII Anonymizer
 * Redacts or replaces detected PII in text
 */

import type { DetectionResult } from "./recognizers";

export interface AnonymizerConfig {
	replacements: Record<string, string>;
}

export interface AnonymizationResult {
	text: string;
	modified: boolean;
	stats: {
		totalRedactions: number;
		byEntity: Record<string, number>;
	};
}

/**
 * Anonymize text by replacing detected PII with placeholders
 */
export function anonymize(
	text: string,
	detections: DetectionResult[],
	config: AnonymizerConfig,
): AnonymizationResult {
	if (detections.length === 0) {
		return {
			text,
			modified: false,
			stats: {
				totalRedactions: 0,
				byEntity: {},
			},
		};
	}

	// Sort detections by position (reverse order to maintain indices)
	const sortedDetections = [...detections].sort((a, b) => b.start - a.start);

	let anonymizedText = text;
	const stats: Record<string, number> = {};

	// Replace from end to start to preserve indices
	for (const detection of sortedDetections) {
		const replacement =
			config.replacements[detection.entityType] || "[REDACTED]";

		anonymizedText =
			anonymizedText.slice(0, detection.start) +
			replacement +
			anonymizedText.slice(detection.end);

		stats[detection.entityType] = (stats[detection.entityType] || 0) + 1;
	}

	return {
		text: anonymizedText,
		modified: true,
		stats: {
			totalRedactions: detections.length,
			byEntity: stats,
		},
	};
}

/**
 * Sanitize messages array (for LLM requests)
 */
export function sanitizeMessages(
	messages: Array<{ role?: string; content?: string }>,
	detections: DetectionResult[][],
	config: AnonymizerConfig,
): {
	sanitizedMessages: Array<{ role?: string; content: string }>;
	totalRedactions: number;
	byEntity: Record<string, number>;
} {
	const sanitizedMessages: Array<{ role?: string; content: string }> = [];
	let totalRedactions = 0;
	const combinedStats: Record<string, number> = {};

	for (let i = 0; i < messages.length; i++) {
		const message = messages[i];
		const messageDetections = detections[i] || [];

		if (!message || typeof message.content !== "string") {
			sanitizedMessages.push({ ...message, content: "" });
			continue;
		}

		const result = anonymize(message.content, messageDetections, config);

		sanitizedMessages.push({
			...message,
			content: result.text,
		});

		totalRedactions += result.stats.totalRedactions;

		for (const [entity, count] of Object.entries(result.stats.byEntity)) {
			combinedStats[entity] = (combinedStats[entity] || 0) + count;
		}
	}

	return {
		sanitizedMessages,
		totalRedactions,
		byEntity: combinedStats,
	};
}
