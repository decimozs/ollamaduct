# Quick Start

Get up and running with Ollamaduct Gateway in minutes.

## Prerequisites

- [Bun](https://bun.sh) runtime (v1.0 or higher)

## Installation

```bash
# Navigate to gateway directory
cd gateway

# Install dependencies
bun install

# Initialize database
bun run migrate

# Set up environment variables
cp .env.example .env
```

## Configuration

### 1. Configure Environment Variables

Edit `.env` with your API keys:

```bash
# Required - at least one provider key
OPENAI_KEY=sk-your-openai-key

# Optional - additional providers
GROQ_KEY=your-groq-key
OLLAMA_KEY=your-ollama-key
```

### 2. Create Workspace

```bash
# Create your first workspace
bun run cli workspaces --create "My Project"
```

### 3. Add LLM Providers

```bash
# Add OpenAI
bun run cli providers --add --name "openai" --url "https://api.openai.com/v1/chat/completions" --env-key "OPENAI_KEY"

# Add local Ollama
bun run cli providers --add --name "ollama" --url "http://localhost:11434/v1/chat/completions" --env-key "OLLAMA_KEY" --local

# Add Groq
bun run cli providers --add --name "groq" --url "https://api.groq.com/openai/v1/chat/completions" --env-key "GROQ_KEY"
```

### 4. Create API Key

```bash
# Create an API key for your workspace
bun run cli keys --create --workspace "My Project"
```

## Run

```bash
# Start development server
bun run dev
```

Server will start at `http://localhost:3000`

## First Request

```bash
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-provider: openai" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Next Steps

- [API Reference](API_REFERENCE.md) - Learn about all endpoints and options
- [CLI Commands](CLI_COMMANDS.md) - Manage workspaces, providers, and view analytics
- [Privacy Shield](PRIVACY_SHIELD.md) - Configure PII detection
- [Deployment](DEPLOYMENT.md) - Deploy to production
