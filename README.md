# Ollamaduct

A lightweight, local-first AI gateway for Ollama with workspaces, cost tracking, and privacy controls.

## Overview

Ollamaduct sits between your applications and LLM providers, providing essential features for production AI applications: authentication, usage analytics, intelligent caching, and enterprise-grade PII detection.

## Features

- **Workspaces** - Organize projects and track usage separately per workspace
- **Ollama Integration** - Native Ollama gateway with local and cloud model support
- **Authentication & API Keys** - Secure API key-based authentication per workspace
- **Cost Tracking & Analytics** - Real-time usage tracking and cost attribution by workspace
- **Semantic Caching** - Vector-based intelligent caching with 95%+ similarity detection
- **Privacy Shield** - Enterprise-grade PII detection and redaction with 25+ entity types

## Use Cases

- **Production AI Applications** - Add authentication, rate limiting, and cost tracking to your AI features
- **Privacy-Sensitive Workloads** - Keep data on-premise with local Ollama deployment
- **Cost Optimization** - Cache frequent queries and track usage across teams
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

MIT License - see [LICENSE](../LICENSE) for details.
