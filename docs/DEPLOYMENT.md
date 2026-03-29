# Deployment

Guide for deploying Ollamaduct Gateway to production.

## Environment Variables

### Required

```bash
# At least one provider key is required
OPENAI_KEY=sk-your-openai-key
```

### Optional

```bash
# Additional providers
GROQ_KEY=your-groq-key
OLLAMA_KEY=your-ollama-key
OLLAMA_CLOUD_KEY=your-ollama-cloud-key

# Server configuration
PORT=3000
HOST=0.0.0.0
```

## Docker Deployment

### Build

```dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
```

### Build and Run

```bash
docker build -t ollamaduct-gateway .
docker run -p 3000:3000 \
  -e OPENAI_KEY=sk-... \
  -e GROQ_KEY=your-groq-key \
  ollamaduct-gateway
```

### Docker Compose

```yaml
version: '3.8'

services:
  gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_KEY=${OPENAI_KEY}
      - GROQ_KEY=${GROQ_KEY}
      - OLLAMA_KEY=${OLLAMA_KEY}
    volumes:
      - ./pathway.db:/app/pathway.db
```

## Production Best Practices

### Security

1. **Use TLS/SSL** - Deploy behind a reverse proxy (Nginx, Caddy) with HTTPS
2. **Environment Variables** - Never commit API keys to version control
3. **Rate Limiting** - Configure appropriate limits based on your usage
4. **Network Isolation** - Use firewall rules to restrict access

### Performance

1. **Caching** - Semantic caching is enabled by default
2. **Database** - Use SQLite for single-instance deployments
3. **Memory** - Ensure adequate RAM for embeddings model
4. **Monitoring** - Track latency and error rates

### Reliability

1. **Health Checks** - Use `/healthcheck` endpoint for load balancer probes
2. **Logging** - Monitor logs for errors and anomalies
3. **Backups** - Regular database backups
4. **Graceful Shutdown** - Allow in-flight requests to complete

### Privacy

1. **PII Detection** - Enable in production for sensitive data
2. **Local-Only Mode** - Use for compliance requirements
3. **Response Sanitization** - Enable `x-pii-response` header as needed

## Systemd Service

Create `/etc/systemd/system/ollamaduct.service`:

```ini
[Unit]
Description=Ollamaduct Gateway
After=network.target

[Service]
Type=simple
User=ollamaduct
WorkingDirectory=/opt/ollamaduct
ExecStart=/usr/bin/bun run src/index.ts
Restart=always
Environment=OPENAI_KEY=sk-...
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable ollamaduct
sudo systemctl start ollamaduct
```

## Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### Health Check

```bash
curl http://localhost:3000/healthcheck
```

### Metrics to Track

- Request latency (p50, p95, p99)
- Error rate by type
- Cache hit/miss ratio
- Token usage by model
- Cost attribution by workspace

## Scaling

### Horizontal Scaling

For high availability, run multiple instances behind a load balancer:

1. Use a shared database (not SQLite)
2. Disable in-memory caching or use Redis
3. Configure sticky sessions if needed

### Vertical Scaling

- Increase RAM for embedding models
- Use SSD for faster database access
- Consider dedicated CPU for inference

## Backup and Recovery

### Backup Database

```bash
cp pathway.db pathway.db.backup
```

### Restore

```bash
cp pathway.db.backup pathway.db
```

## Troubleshooting

### Connection Refused

- Check if port is correct
- Verify firewall rules
- Check if server is running

### 502 Bad Gateway

- Verify provider API keys
- Check network connectivity
- Review provider status

### High Latency

- Check cache configuration
- Monitor provider response times
- Review embedding model performance
