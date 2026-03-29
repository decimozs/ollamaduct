# Deployment

Guide for deploying Ollamaduct Gateway to production.

## Environment Variables

### Required

```bash
# Ollama server URL (ensure Ollama is running)
OLLAMA_URL=http://localhost:11434
```

### Optional

```bash
# Default model (default: llama2)
DEFAULT_MODEL=llama2

# Ollama Cloud API key (if using cloud models)
OLLAMA_KEY=your-ollama-cloud-key

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
  -e OLLAMA_URL=http://host.docker.internal:11434 \
  -v ollama_data:/root/.ollama \
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
      - OLLAMA_URL=http://host.docker.internal:11434
      - DEFAULT_MODEL=llama2
    volumes:
      - ./pathway.db:/app/pathway.db
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
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
2. **Response Sanitization** - Enable `x-pii-response` header as needed

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
Environment=OLLAMA_URL=http://localhost:11434
Environment=DEFAULT_MODEL=llama2
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

- Check if Ollama is running
- Verify `OLLAMA_URL` is correct
- Check firewall rules

### 502 Bad Gateway

- Verify Ollama is accessible
- Check network connectivity
- Review Ollama server logs

### High Latency

- Check cache configuration
- Monitor Ollama response times
- Review embedding model performance

### No Models Available

- Pull models: `ollama pull llama2`
- Verify Ollama is running: `ollama list`
