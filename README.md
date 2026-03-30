<img width="180" height="200" alt="Gemini_Generated_Image_b0130pb0130pb013 1" src="https://github.com/user-attachments/assets/6eda59f4-923a-40e4-b5c9-a0ee3f8851c1" />

# Ollamaduct

A lightweight, local-first AI gateway for Ollama with workspaces, usage analytics, and privacy controls.

## Overview

Ollamaduct is an open-source gateway designed to sit between your local apps and Ollama. It adds a layer of intelligence to your LLM setup, handling the heavy lifting like managing access, tracking usage, and speeding up responses with smart caching while ensuring sensitive data stays under your control.

> [!NOTE]
> Ollamaduct is currently CLI-only. A web-based interface and MCP server support are planned for future releases to improve the overall experience. Contributions and feedback are welcome!

## Installation

### Prerequisites

- [Bun](https://bun.sh) or [Node.js](https://nodejs.org) 18+
- [Ollama](https://ollama.com) (local or cloud)

### Quick Install

```bash
# Using npm
npm install -g ollamaduct

# Using bun
bun install -g ollamaduct
```

### Verify Installation

```bash
ollamaduct --version
```

## Configuration

### First-Time Setup

```bash
ollamaduct init
```

This creates the configuration file at `~/.ollamaduct/config.env` (Linux/Mac) or `%APPDATA%/ollamaduct/config.env` (Windows).

### Configuration File

Edit the config file to customize your gateway:

```bash
# Ollama Settings
OLLAMA_URL=https://ollama.com
OLLAMA_API_KEY=your_ollama_api_key

# Security - REQUIRED for production
API_KEY=your-secure-gateway-api-key

# Default model
DEFAULT_MODEL=llama2
```

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_URL` | Ollama endpoint URL | `http://localhost:11434` |
| `OLLAMA_API_KEY` | API key for Ollama Cloud | - |
| `API_KEY` | Gateway authentication key | (not set - insecure) |
| `DEFAULT_MODEL` | Default model to use | `llama2` |

## Quick Start

```bash
# Start the gateway server
ollamaduct start

# Or start on custom port
ollamaduct start --port 8080

# Check server status
ollamaduct status

# Stop the server
ollamaduct stop
```

### Usage Examples

```bash
# List available models
ollamaduct models

# Manage API keys
ollamaduct keys
ollamaduct keys --create

# View usage logs
ollamaduct logs
ollamaduct logs --limit 50

# View statistics
ollamaduct stats

# Manage workspaces
ollamaduct workspaces
ollamaduct workspaces --create "My Project"

# Manage cache
ollamaduct cache
ollamaduct cache --clear
```

## Upgrade

To upgrade to the latest version:

```bash
# Using npm
npm install -g ollamaduct

# Using bun
bun install -g ollamaduct
```

Check current version:

```bash
ollamaduct --version
```

## Features

- **Workspaces** - Organize projects and track usage separately per workspace
- **Ollama Integration** - Native Ollama gateway with local and cloud model support
- **Authentication & API Keys** - Secure API key-based authentication per workspace
- **Usage Analytics** - Real-time usage tracking and analytics by workspace
- **Semantic Caching** - Vector-based intelligent caching with 95%+ similarity detection
- **Privacy Shield** - Enterprise-grade PII detection and redaction with 25+ entity types

## Use Cases

- **Production AI Applications** - Add authentication, usage tracking, and caching to your AI features
- **Privacy-Sensitive Workloads** - Keep data on-premise with local Ollama deployment
- **Performance Optimization** - Cache frequent queries and speed up responses
- **Local AI Gateway** - Secure gateway for self-hosted Ollama instances
- **Compliance** - Automatically redact PII before sending to LLM providers

## Documentation

- [Quick Start](docs/QUICK_START.md) - Get up and running in minutes
- [CLI Commands](docs/CLI_COMMANDS.md) - Manage workspaces and view analytics
- [API Reference](docs/API_REFERENCE.md) - Endpoint documentation and examples
- [Deployment](docs/DEPLOYMENT.md) - Docker and production deployment guide
- [Privacy Shield](docs/PRIVACY_SHIELD.md) - PII detection and configuration
- [Contributing](docs/CONTRIBUTING.md) - Development setup and contribution guidelines

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

Ollamaduct is an independent project and is not affiliated with the official Ollama project.
