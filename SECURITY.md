# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability within Ollamaduct, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices

### Deployment

- Always use HTTPS in production via a reverse proxy
- Keep your `.env` file secure and never commit it to version control
- Restrict network access to the gateway
- Regularly update Ollama and its models

### API Keys

- Use strong, unique API keys for each workspace
- Rotate keys periodically
- Never expose API keys in client-side code or logs

### Privacy

- Enable PII detection for sensitive data
- Review the Privacy Shield documentation for configuration options
- Consider using local-only mode for compliance requirements

### Dependencies

- Keep dependencies up to date
- Run security audits periodically

## Scope

This security policy applies to the Ollamaduct gateway codebase. It does not cover:
- Ollama runtime itself
- Underlying operating system
- Network infrastructure
