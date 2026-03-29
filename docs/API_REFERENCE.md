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
| GET | `/api/tags` | List available Ollama models |
| POST | `/api/chat` | Chat completion |

## Authentication

All requests require a Bearer token in the Authorization header:

```bash
-H "Authorization: Bearer YOUR_API_KEY"
```

Create an API key using:
```bash
bun run cli keys --create
```

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token with API key |
| `x-pii-mode` | No | PII detection mode (strict/balanced/audit/off) |
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
| `X-PII-Response-Redacted` | Whether response was sanitized |

## List Models

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

## Chat Completion

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

## Streaming Chat Completion

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

Response is streamed as NDJSON:

```json
{"model":"llama2","message":{"role":"assistant","content":"Hello"},"done":false}
{"model":"llama2","message":{"role":"assistant","content":"Hello!"},"done":false}
{"model":"llama2","done":true,"prompt_eval_count":10,"eval_count":20}
```

## Available Models

Ollamaduct uses models from your local Ollama installation. Configure the default model in `.env`:

```bash
DEFAULT_MODEL=llama2
```

Common models:

| Model | Description |
|-------|-------------|
| llama2 | General purpose (default) |
| llama3 | Latest Llama 3 |
| llama3.3 | Llama 3.3 instruction-tuned |
| qwen2.5-coder | Code generation |
| mistral | General purpose |

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Invalid or missing API key",
  "code": "UNAUTHORIZED"
}
```

### 502 Bad Gateway

```json
{
  "error": "Failed to connect to Ollama",
  "code": "PROVIDER_ERROR"
}
```

## Rate Limiting

Rate limiting is planned for future releases.
