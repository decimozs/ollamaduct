# Privacy Shield

Enterprise-grade PII detection and redaction for secure AI deployments.

## Overview

Privacy Shield automatically detects and redacts personally identifiable information (PII) from requests before they reach LLM providers. It supports 25+ entity types with configurable detection modes.

## Detection Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `strict` | Maximum detection, higher false positives | High-security environments |
| `balanced` | High-confidence detections only (default) | General production use |
| `audit` | Detect without redaction | Testing and compliance |
| `off` | Disable PII detection | Non-sensitive data |

## Usage

### Request Headers

```bash
# balanced mode (default)
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "x-pii-mode: balanced" \
  ...

# strict mode
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "x-pii-mode: strict" \
  ...

# audit mode - detect without redaction
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "x-pii-mode: audit" \
  ...

# disable detection
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "x-pii-mode: off" \
  ...
```

### Response Headers

- `X-PII-Detected` - Whether PII was detected (true/false)
- `X-PII-Count` - Number of PII detections
- `X-PII-Entities` - Comma-separated entity types

## Detected Entities

### Personal Information

| Entity | Example |
|--------|---------|
| Email | user@example.com |
| Phone Number | +1-555-123-4567 |
| US SSN | 123-45-6789 |
| US Passport | AB1234567 |
| Date of Birth | 1990-01-15 |

### Financial Information

| Entity | Example |
|--------|---------|
| Credit Card | 4111-1111-1111-1111 |
| US Bank Account | 1234567890 |
| IBAN | DE89 3704 0044 0532 0130 00 |
| Bitcoin Address | 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2 |
| Ethereum Address | 0x71C7656EC7ab88b098defB751B7401B5f6d8976F |

### Credentials

| Entity | Example |
|--------|---------|
| OpenAI API Key | sk-... |
| AWS Access Key | AKIAIOSFODNN7EXAMPLE |
| AWS Secret Key | wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY |
| Azure Key | your-azure-key |
| Google API Key | AIza... |
| GitHub Token | ghp_... |
| JWT Token | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| Private Key | -----BEGIN RSA PRIVATE KEY----- |
| Password | password123 |

### Network Information

| Entity | Example |
|--------|---------|
| IPv4 Address | 192.168.1.1 |
| IPv6 Address | 2001:0db8:85a3:0000:0000:8a2e:0370:7334 |
| MAC Address | 00:1B:44:11:3A:B7 |
| URL with Credentials | https://user:pass@example.com |

### Medical

| Entity | Example |
|--------|---------|
| Medical License | MD123456 |

## Response Sanitization

Optionally sanitize LLM responses for PII:

```bash
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "x-pii-response: true" \
  ...
```

Response headers include:
- `X-PII-Response-Redacted: true`
- `X-PII-Response-Count: N`

## Local-Only Mode

Force requests through local providers only:

```bash
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "x-local-only: true" \
  -H "x-provider: ollama" \
  ...
```

Returns 403 if cloud provider is used with local-only mode:

```json
{
  "error": "Local-only mode enabled. Only Ollama (local) provider is allowed.",
  "code": "LOCAL_ONLY_VIOLATION"
}
```

## Configuration

Edit `src/config.ts` to customize detection:

```typescript
export const PII_CONFIG = {
  defaultMode: "balanced",
  replacements: {
    EMAIL: "[EMAIL]",
    CREDIT_CARD: "[CREDIT_CARD]",
    US_SSN: "[SSN]",
    PHONE_NUMBER: "[PHONE]",
    IP_ADDRESS: "[IP_ADDRESS]",
    // ... more entity types
  },
  responseSanitization: false,
  customPatterns: [],
};
```

### Custom Patterns

Add organization-specific patterns:

```typescript
customPatterns: [
  {
    name: 'EMPLOYEE_ID',
    regex: 'EMP-\\d{5}',
    entityType: 'EMPLOYEE_ID',
    score: 0.9
  },
  {
    name: 'PROJECT_CODE',
    regex: 'PRJ-[A-Z]{3}-\\d{4}',
    entityType: 'PROJECT_CODE',
    score: 0.85
  }
]
```

## Compliance

Privacy Shield helps meet compliance requirements:

| Standard | Features |
|----------|----------|
| GDPR | PII redaction, data residency controls |
| HIPAA | Local-only mode for PHI protection |
| PCI-DSS | Credit card detection and redaction |
| SOC 2 | Audit logging, access controls |

## Audit Mode

Use audit mode for testing and compliance:

```bash
curl -X POST "http://localhost:3000/v1/chat/completions" \
  -H "x-pii-mode: audit" \
  ...
```

This returns detection results without modifying the request, allowing you to:
- Test detection accuracy
- Generate compliance reports
- Monitor PII exposure
