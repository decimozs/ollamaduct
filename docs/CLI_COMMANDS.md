# CLI Commands

Ollamaduct includes a comprehensive CLI for managing workspaces, API keys, and viewing analytics for your Ollama gateway.

## Usage

```bash
ollamaduct <command> [options]
```

## Server Management

### Start Server

```bash
# Start with default port (3000) in foreground
ollamaduct start

# Start on custom port
ollamaduct start --port 8080

# Start in background (detached)
ollamaduct start --detach
ollamaduct start -d
```

### Stop Server

```bash
ollamaduct stop
```

### Server Status

```bash
ollamaduct status
```

### Server Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--port <n>` | | Server port (default: 3000) |
| `--detach` | `-d` | Run server in background |

## Initialization

### First-Time Setup

```bash
ollamaduct init
```

This creates the necessary configuration and database files in your data directory.

## Workspace Management

### List Workspaces

```bash
ollamaduct workspaces
```

### Create Workspace

```bash
ollamaduct workspaces --create "My Project"
```

### Delete Workspace

```bash
ollamaduct workspaces --delete ws_abc123
```

## Model Management

### List Available Models

```bash
ollamaduct models
```

This shows models available in your local Ollama installation or Ollama Cloud.

## API Key Management

### List API Keys

```bash
ollamaduct keys
```

### Create API Key

```bash
# Create with default workspace
ollamaduct keys --create

# Create with specific workspace
ollamaduct keys --create --workspace ws_abc123
```

### Delete API Key

```bash
ollamaduct keys --delete key_abc123
```

## Usage Logs

### View Logs

```bash
# View recent logs
ollamaduct logs

# Limit results
ollamaduct logs --limit 50

# Filter by workspace
ollamaduct logs --workspace ws_abc123

# Filter by model
ollamaduct logs --model llama2

# Combine filters
ollamaduct logs --workspace ws_abc123 --model llama2 --limit 100
```

## Statistics

### View Statistics

```bash
# Overall statistics
ollamaduct stats

# By workspace
ollamaduct stats --workspace ws_abc123

# By model
ollamaduct stats --model llama2
```

## Cache Management

### View Cache Statistics

```bash
ollamaduct cache
```

### Clear Cache

```bash
# Clear all cache
ollamaduct cache --clear

# Clear by model
ollamaduct cache --clear --model llama2

# Clear by workspace
ollamaduct cache --clear --workspace ws_abc123
```

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--port <n>` | | Server port (default: 3000) |
| `--detach` | `-d` | Run server in background |
| `--limit <n>` | | Limit number of results (default: 20) |
| `--workspace <id>` | | Filter by workspace ID |
| `--model <name>` | | Filter by model name |
| `--clear` | | Clear cache |
| `--force` | | Force reinitialize (init only) |
| `--version, -v` | | Show version number |
| `--help, -h` | | Show help message |

## Examples

```bash
# First time setup
ollamaduct init

# Start server
ollamaduct start
ollamaduct start --port 8080
ollamaduct start --detach
ollamaduct start -d

# Check status
ollamaduct status

# View logs
ollamaduct logs
ollamaduct logs --limit 50 --workspace ws_abc123

# View statistics
ollamaduct stats

# Manage workspaces
ollamaduct workspaces
ollamaduct workspaces --create "My Project"

# Manage API keys
ollamaduct keys
ollamaduct keys --create --workspace ws_abc123

# List models
ollamaduct models

# Manage cache
ollamaduct cache
ollamaduct cache --clear

# Stop server
ollamaduct stop
```
