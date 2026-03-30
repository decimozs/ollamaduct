# Quick Start

Get up and running with Ollamaduct Gateway in minutes.

## Prerequisites

- [Bun](https://bun.sh) runtime (v1.0 or higher)
- [Ollama](https://ollama.com) installed and running locally

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

Edit `.env` with your Ollama settings:

```bash
# Ollama server URL (default: http://localhost:11434)
OLLAMA_URL=http://localhost:11434

# Optional: Ollama API key for cloud models
OLLAMA_KEY=your-ollama-cloud-key

# Optional: Default model to use (default: llama2)
DEFAULT_MODEL=llama2
```

### 2. Ensure Ollama is Running

```bash
# Pull a model if needed
ollama pull llama2

# Verify Ollama is running
ollama list
```

### 3. Create Workspace

```bash
# Create your first workspace
bun run cli workspaces --create "My Project"
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
# Chat with Ollama using native API
curl -X POST "http://localhost:3000/api/chat" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Available Models

Ollamaduct uses models from your local Ollama installation. Common models include:

| Model | Description |
|-------|-------------|
| llama2 | General purpose (default) |
| llama3 | Latest Llama 3 |
| llama3.3 | Llama 3.3 instruction-tuned |
| qwen2.5-coder | Code generation |
| mistral | General purpose |

Pull additional models with: `ollama pull <model-name>`

## Next Steps

- [API Reference](API_REFERENCE.md) - Learn about all endpoints and options
- [CLI Commands](CLI_COMMANDS.md) - Manage workspaces and view analytics
- [Privacy Shield](PRIVACY_SHIELD.md) - Configure PII detection
- [Deployment](DEPLOYMENT.md) - Deploy to production

---

## Disclaimer

Ollamaduct is an independent project and is not affiliated with the official Ollama project.
