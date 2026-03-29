# CLI Commands

Ollamaduct includes a comprehensive CLI for managing workspaces, providers, and viewing analytics.

## Usage

```bash
bun run cli <command> [options]
```

## Workspace Management

### List Workspaces

```bash
bun run cli workspaces
```

### Create Workspace

```bash
bun run cli workspaces --create "My Project"
```

### Delete Workspace

```bash
bun run cli workspaces --delete ws_abc123
```

## Provider Management

### List Providers

```bash
bun run cli providers
```

### Add Provider

```bash
# Add OpenAI
bun run cli providers --add --name "openai" --url "https://api.openai.com/v1/chat/completions" --env-key "OPENAI_KEY"

# Add local Ollama
bun run cli providers --add --name "ollama" --url "http://localhost:11434/v1/chat/completions" --env-key "OLLAMA_KEY" --local

# Add Ollama Cloud
bun run cli providers --add --name "ollama:cloud" --url "https://api.ollama.com/v1/chat/completions" --env-key "OLLAMA_CLOUD_KEY"

# Add Groq
bun run cli providers --add --name "groq" --url "https://api.groq.com/openai/v1/chat/completions" --env-key "GROQ_KEY"
```

### Delete Provider

```bash
bun run cli providers --delete openai
```

## API Key Management

### List API Keys

```bash
bun run cli keys
```

### Create API Key

```bash
# Create with default workspace
bun run cli keys --create

# Create with specific workspace
bun run cli keys --create --workspace "My Project"
```

### Delete API Key

```bash
bun run cli keys --delete key_abc123
```

## Usage Logs

### View Logs

```bash
# View recent logs
bun run cli logs

# Limit results
bun run cli logs --limit 50

# Filter by provider
bun run cli logs --provider openai

# Filter by workspace
bun run cli logs --workspace ws_abc123

# Filter by model
bun run cli logs --model gpt-4

# Combine filters
bun run cli logs --provider openai --workspace ws_abc123 --limit 100
```

## Statistics

### View Statistics

```bash
# Overall statistics
bun run cli stats

# By provider
bun run cli stats --provider openai

# By workspace
bun run cli stats --workspace ws_abc123
```

## Cache Management

### View Cache Statistics

```bash
bun run cli cache
```

### Clear Cache

```bash
# Clear all cache
bun run cli cache --clear

# Clear by provider
bun run cli cache --clear --provider openai

# Clear by workspace
bun run cli cache --clear --workspace ws_abc123
```

## Model Rates

### View Model Rates

```bash
bun run cli rates
```

### Add Model Rate

```bash
bun run cli rates --add --model gpt-4 --input-rate 0.03 --output-rate 0.06
```

### Delete Model Rate

```bash
bun run cli rates --delete gpt-4
```

## Teams

### List Teams

```bash
bun run cli teams
```

### Create Team

```bash
bun run cli teams --create "Engineering"
```

### Delete Team

```bash
bun run cli teams --delete team_abc123
```
