# API Reference

Complete API documentation for Ollamaduct Gateway.

## Base URL

```
http://localhost:3000
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/healthcheck` | Detailed health status |
| GET | `/api/tags` | List available models |
| POST | `/api/chat` | Chat completion (Ollama) |
| POST | `/v1/chat/completions` | Chat completion (OpenAI-compatible) |

## Authentication

All requests require a Bearer token in the Authorization header:

```bash
-H "Authorization: Bearer YOUR_API_KEY"
```

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token with API key |
| `x-provider` | No | Provider name (default: openai) |
| `x-pii-mode` | No | PII detection mode (strict/balanced/audit/off) |
| `x-local-only` | No | Force local-only providers (true/false) |
| `x-cache` | No | Enable/disable semantic cache (default: true) |
| `x-pii-response` | No | Sanitize LLM response (default: false) |
| `x-pii-audit` | No | Detect without redaction (default: false) |

## Response Headers

| Header | Description |
|--------|-------------|
| `X-Cache` | HIT or MISS - Cache status |
| `X-Cache-Similarity` | Similarity score (0-1) for cache hits |
| `X-PII-Detected` | Whether PII was detected (true/false) |
| `X-PII-Count` | Number of PII detections |
| `X-PII-Entities` | Comma-separated entity types |
| `X-Local-Only` | Whether local-only mode was enforced |
| `X-PII-Response-Redacted` | Whether response was sanitized |

## OpenAI-Compatible API

### Chat Completions

**Endpoint:** `POST /v1/chat/completions`

**Request:**

```bash
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-provider: openai" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

**Response:**

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Streaming Chat Completions

```bash
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

## Ollama API

### List Models

**Endpoint:** `GET /api/tags`

```bash
curl -X GET "http://localhost:3000/api/tags" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "models": [
    {
      "name": "llama2",
      "model": "llama2:latest",
      "size": 3826793472,
      "modified_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Chat Completion

**Endpoint:** `POST /api/chat`

```bash
curl -X POST "http://localhost:3000/api/chat" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": false
  }'
```

**Response:**

```json
{
  "model": "llama2",
  "message": {
    "role": "assistant",
    "content": "Hello! How can I help you today?"
  },
  "done": true,
  "total_duration": 5000000000,
  "prompt_eval_count": 10,
  "eval_count": 20
}
```

### Streaming Chat Completion

```bash
curl -X POST "http://localhost:3000/api/chat" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

## Supported Providers

| Provider | Header Value | Environment Key |
|----------|--------------|-----------------|
| OpenAI | `openai` | `OPENAI_KEY` |
| Groq | `groq` | `GROQ_KEY` |
| Ollama (local) | `ollama` | `OLLAMA_KEY` |
| Ollama Cloud | `ollama:cloud` | `OLLAMA_CLOUD_KEY` |

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Invalid or missing API key",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden

```json
{
  "error": "Local-only mode enabled. Only Ollama (local) provider is allowed.",
  "code": "LOCAL_ONLY_VIOLATION"
}
```

### 502 Bad Gateway

```json
{
  "error": "Failed to connect to provider",
  "code": "PROVIDER_ERROR"
}
```

## Rate Limiting

Rate limiting is planned for future releases. Configure appropriate limits based on your provider's quotas.
