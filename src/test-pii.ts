/**
 * Test PII Detection
 * Run with: bun run src/test-pii.ts
 */

import { PIIDetector } from "./lib/pii";

console.log("🔒 Testing PII Detection System\n");

const testCases = [
	{
		name: "Email Detection",
		text: "My email is john.doe@example.com and I can be reached there.",
		expected: ["EMAIL"],
	},
	{
		name: "Credit Card Detection",
		text: "My credit card is 4111-1111-1111-1111 and expires next month.",
		expected: ["CREDIT_CARD"],
	},
	{
		name: "API Key Detection",
		text: "Use this key: sk-1234567890abcdefghijk for authentication.",
		expected: ["OPENAI_API_KEY"],
	},
	{
		name: "Multiple PII Types",
		text: "Contact me at admin@company.com or call 555-123-4567. My SSN is 123-45-6789.",
		expected: ["EMAIL", "PHONE_NUMBER", "US_SSN"],
	},
	{
		name: "IP Address",
		text: "The server is at 192.168.1.1 and the backup is at 10.0.0.5",
		expected: ["IP_ADDRESS"],
	},
	{
		name: "No PII",
		text: "This is a normal message without any sensitive information.",
		expected: [],
	},
];

// Test in balanced mode (default)
console.log("Mode: balanced (default)\n");
const detector = new PIIDetector({ mode: "balanced" });

for (const testCase of testCases) {
	console.log(`Test: ${testCase.name}`);
	console.log(`Input: "${testCase.text}"`);

	const detections = detector.analyze(testCase.text);
	const detectedTypes = [...new Set(detections.map((d) => d.entityType))];

	console.log(`Expected: [${testCase.expected.join(", ")}]`);
	console.log(`Detected: [${detectedTypes.join(", ")}]`);

	if (detections.length > 0) {
		console.log("Details:");
		for (const detection of detections) {
			console.log(
				`  - ${detection.entityType}: "${detection.text}" (confidence: ${detection.score})`,
			);
		}
	}

	const passed = testCase.expected.every((e) => detectedTypes.includes(e));
	console.log(passed ? "✅ PASS\n" : "❌ FAIL\n");
}

// Test anonymization
console.log("\n📝 Testing Anonymization\n");

import { PII_CONFIG } from "./config";
import { anonymize } from "./lib/pii/anonymizer";

const testText =
	"Email me at john@example.com or call 555-1234. My API key is sk-abc123xyz456.";
console.log(`Original: "${testText}"`);

const detections = detector.analyze(testText);
const result = anonymize(testText, detections, {
	replacements: PII_CONFIG.replacements,
});

console.log(`Anonymized: "${result.text}"`);
console.log(`Redactions: ${result.stats.totalRedactions}`);
console.log(`By entity:`, result.stats.byEntity);

console.log("\n✅ All tests completed!");
