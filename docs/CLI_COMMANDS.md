# CLI Commands

Ollamaduct includes a comprehensive CLI for managing workspaces, API keys, and viewing analytics for your Ollama gateway.

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

## Model Management

### List Available Models

```bash
bun run cli models
```

This shows models available in your local Ollama installation.

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

# Filter by workspace
bun run cli logs --workspace ws_abc123

# Filter by model
bun run cli logs --model llama2

# Combine filters
bun run cli logs --workspace ws_abc123 --model llama2 --limit 100
```

## Statistics

### View Statistics

```bash
# Overall statistics
bun run cli stats

# By workspace
bun run cli stats --workspace ws_abc123

# By model
bun run cli stats --model llama2
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

# Clear by model
bun run cli cache --clear --model llama2

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
# Add rate for a model (for cost tracking)
bun run cli rates --add --model llama2 --input-rate 0.0 --output-rate 0.0
```

### Delete Model Rate

```bash
bun run cli rates --delete llama2
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
