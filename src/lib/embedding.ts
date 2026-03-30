import {
	env,
	type FeatureExtractionPipeline,
	pipeline,
} from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = ".cache/transformers";

let embedder: FeatureExtractionPipeline | null = null;
let modelLoaded = false;

interface EmbeddingOutput {
	data: Float32Array;
}

export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_DIMENSION = 384;

export async function generateEmbedding(text: string): Promise<number[]> {
	if (!embedder) {
		console.log(`Loading embedding model: ${EMBEDDING_MODEL}...`);
		embedder = (await pipeline(
			"feature-extraction",
			EMBEDDING_MODEL,
		)) as FeatureExtractionPipeline;
		modelLoaded = true;
		console.log("Embedding model loaded!");
	}

	const output = (await embedder(text, {
		pooling: "mean",
		normalize: true,
	})) as EmbeddingOutput;

	return Array.from(output.data);
}

export function isEmbeddingModelLoaded(): boolean {
	return modelLoaded;
}

export async function generateHash(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
