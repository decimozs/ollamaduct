import { db } from "../db";
import { generateEmbedding, generateHash } from "./embedding";

const SIMILARITY_THRESHOLD = 0.05;
const CACHE_EXPIRY_DAYS = 7;

interface CacheEntry {
	id: string;
	model: string;
	prompt_hash: string;
	prompt_text: string;
	response_text: string;
	embedding: number[];
	created_at: number;
	expires_at: number | null;
}

const cacheStore: Map<string, CacheEntry> = new Map();

function cosineSimilarity(a: number[], b: number[]): number {
	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i++) {
		const ai = a[i] ?? 0;
		const bi = b[i] ?? 0;
		dotProduct += ai * bi;
		normA += ai * ai;
		normB += bi * bi;
	}

	if (normA === 0 || normB === 0) return 0;
	return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function initVectorStore(): Promise<void> {
	try {
		const existingEntries = await db`
      SELECT * FROM semantic_cache
      WHERE expires_at IS NULL OR expires_at > ${Date.now()}
    `;

		cacheStore.clear();

		const entries = existingEntries as CacheEntry[];
		for (const entry of entries) {
			if (!entry?.prompt_text) continue;
			const embedding = await generateEmbedding(entry.prompt_text);
			const entryWithEmbedding = {
				...entry,
				embedding,
			};
			cacheStore.set(entry.id, entryWithEmbedding);
		}

		console.log(`Vector store initialized with ${cacheStore.size} entries`);
	} catch (error) {
		console.error("Failed to initialize vector store:", error);
	}
}

export async function searchCache(
	prompt: string,
	model: string,
): Promise<{ response: string; similarity: number } | null> {
	if (cacheStore.size === 0) {
		await initVectorStore();
	}

	try {
		const promptEmbedding = await generateEmbedding(prompt);

		let bestMatch: {
			id: string;
			entry: CacheEntry;
			similarity: number;
		} | null = null;

		for (const [id, entry] of cacheStore.entries()) {
			if (entry.model !== model) {
				continue;
			}

			if (entry.expires_at && entry.expires_at < Date.now()) {
				continue;
			}

			const similarity = cosineSimilarity(promptEmbedding, entry.embedding);

			if (similarity > 1 - SIMILARITY_THRESHOLD) {
				if (!bestMatch || similarity > bestMatch.similarity) {
					bestMatch = { id, entry, similarity };
				}
			}
		}

		if (bestMatch) {
			await db`
        UPDATE semantic_cache 
        SET created_at = ${Date.now()}
        WHERE id = ${bestMatch.id}
      `;

			return {
				response: bestMatch.entry.response_text,
				similarity: bestMatch.similarity,
			};
		}

		return null;
	} catch (error) {
		console.error("Error searching cache:", error);
		return null;
	}
}

export async function upsertCache(
	prompt: string,
	response: string,
	model: string,
): Promise<void> {
	try {
		const promptHash = await generateHash(prompt);
		const promptEmbedding = await generateEmbedding(prompt);
		const cacheId = globalThis.crypto.randomUUID();
		const expiresAt = Date.now() + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

		await db`
      INSERT INTO semantic_cache (
        id, model, prompt_hash, prompt_text, response_text, 
        similarity, created_at, expires_at
      ) VALUES (
        ${cacheId}, ${model}, ${promptHash}, ${prompt}, 
        ${response}, 1.0, ${Date.now()}, ${expiresAt}
      )
    `;

		cacheStore.set(cacheId, {
			id: cacheId,
			model,
			prompt_hash: promptHash,
			prompt_text: prompt,
			response_text: response,
			embedding: promptEmbedding,
			created_at: Date.now(),
			expires_at: expiresAt,
		});

		console.log(`Cached response for model: ${model}`);
	} catch (error) {
		console.error("Error upserting cache:", error);
	}
}

export async function clearCache(model?: string): Promise<number> {
	try {
		if (model) {
			const result =
				await db`DELETE FROM semantic_cache WHERE model = ${model}`;

			let deletedCount = 0;
			for (const [id, entry] of cacheStore.entries()) {
				if (entry.model === model) {
					cacheStore.delete(id);
					deletedCount++;
				}
			}

			return (result as any)?.changes || deletedCount;
		} else {
			const result = await db`DELETE FROM semantic_cache`;
			const count = cacheStore.size;
			cacheStore.clear();
			return (result as any)?.changes || count;
		}
	} catch (error) {
		console.error("Error clearing cache:", error);
		return 0;
	}
}

export async function getCacheStats(): Promise<{
	totalEntries: number;
	byModel: Record<string, number>;
	expiredEntries: number;
}> {
	const entries = await db`
    SELECT model, COUNT(*) as count FROM semantic_cache 
    GROUP BY model
  `;

	const [expiredResult] = await db`
    SELECT COUNT(*) as count FROM semantic_cache 
    WHERE expires_at IS NOT NULL AND expires_at < ${Date.now()}
  `;

	const byModel: Record<string, number> = {};
	let totalEntries = 0;

	const entriesArray = entries as { model: string; count: number }[];
	for (const entry of entriesArray) {
		if (entry?.model) {
			byModel[entry.model] = entry.count;
			totalEntries += entry.count;
		}
	}

	const expired = expiredResult as { count: number } | undefined;

	return {
		totalEntries,
		byModel,
		expiredEntries: expired?.count || 0,
	};
}

export async function cleanupExpiredCache(): Promise<number> {
	try {
		const result = await db`
      DELETE FROM semantic_cache 
      WHERE expires_at IS NOT NULL AND expires_at < ${Date.now()}
    `;

		await initVectorStore();

		return (result as { changes?: number })?.changes || 0;
	} catch (error) {
		console.error("Error cleaning up expired cache:", error);
		return 0;
	}
}
