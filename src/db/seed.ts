import { db } from "./index";

const TEAM_ID = "team_default";
const API_KEY_ID = "apikey_default";

async function seed() {
	await db`
    INSERT OR IGNORE INTO teams (id, name, created_at)
    VALUES (${TEAM_ID}, 'Default Team', ${Date.now()})
  `;

	await db`
    INSERT OR IGNORE INTO api_keys (id, key, team_id, name, is_active, created_at)
    VALUES (${API_KEY_ID}, 'pk_test_default_key', ${TEAM_ID}, 'Default Test Key', 1, ${Date.now()})
  `;

	const modelRates = [
		{
			id: "openai-gpt-4",
			provider: "openai",
			model: "gpt-4",
			inputPricePer1M: 30.0,
			outputPricePer1M: 60.0,
		},
		{
			id: "openai-gpt-4o",
			provider: "openai",
			model: "gpt-4o",
			inputPricePer1M: 2.5,
			outputPricePer1M: 10.0,
		},
		{
			id: "openai-gpt-4o-mini",
			provider: "openai",
			model: "gpt-4o-mini",
			inputPricePer1M: 0.15,
			outputPricePer1M: 0.6,
		},
		{
			id: "openai-o1",
			provider: "openai",
			model: "o1",
			inputPricePer1M: 15.0,
			outputPricePer1M: 60.0,
		},
		{
			id: "groq-llama-3.1-70b",
			provider: "groq",
			model: "llama-3.1-70b-instant",
			inputPricePer1M: 0.59,
			outputPricePer1M: 0.79,
		},
		{
			id: "groq-llama-3.1-8b",
			provider: "groq",
			model: "llama-3.1-8b-instant",
			inputPricePer1M: 0.19,
			outputPricePer1M: 0.19,
		},
		{
			id: "groq-mixtral-8x7b",
			provider: "groq",
			model: "mixtral-8x7b-32768",
			inputPricePer1M: 0.24,
			outputPricePer1M: 0.24,
		},
		{
			id: "ollama-llama3.3",
			provider: "ollama:cloud",
			model: "llama3.3",
			inputPricePer1M: 0.0,
			outputPricePer1M: 0.0,
		},
		{
			id: "ollama-qwen2.5-coder",
			provider: "ollama:cloud",
			model: "qwen2.5-coder:14b",
			inputPricePer1M: 0.0,
			outputPricePer1M: 0.0,
		},
		{
			id: "ollama-llama3",
			provider: "ollama:cloud",
			model: "llama3",
			inputPricePer1M: 0.0,
			outputPricePer1M: 0.0,
		},
	];

	for (const rate of modelRates) {
		await db`
      INSERT OR IGNORE INTO model_rates (id, provider, model, input_price_per_1m, output_price_per_1m)
      VALUES (${rate.id}, ${rate.provider}, ${rate.model}, ${rate.inputPricePer1M}, ${rate.outputPricePer1M})
    `;
	}

	console.log("Seeding complete!");
}

seed();
