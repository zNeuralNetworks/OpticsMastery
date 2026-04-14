# Optics Master — Docker Deployment Guide

## Quick Start

### Production (Recommended for MacBooks)

**Run production container:**
```bash
docker run -d \
  --name optics-master \
  -p 3000:3000 \
  --restart unless-stopped \
  optics-master:latest
```

Access at `http://localhost:3000`

### With Docker Compose (Production)

```bash
docker compose -f compose.prod.yaml up -d
```

**View logs:**
```bash
docker logs -f optics-master
```

**Stop & clean up:**
```bash
docker compose -f compose.prod.yaml down
```

---

## Docker Images

### Available Images
```
optics-master:latest      # Latest production build
optics-master:0.1.0       # Version-tagged build
```

### Image Specifications
- **Base**: `node:20-alpine` (slim, 220MB total)
- **Built**: Multi-stage production build
- **Non-root user**: `nodejs` (UID 1001)
- **Port**: 3000
- **Health check**: HTTP GET on port 3000, 30s interval
- **Entrypoint**: `serve -s dist -l 3000` (static file server)

### Image Size Breakdown
```
optics-master:latest    220MB  compressed: 53.4MB
└─ Stage 1 (builder):   Discarded after build (includes node_modules, source)
└─ Stage 2 (runtime):   220MB  (node:20-alpine + serve + dist/)
   ├─ node:20-alpine    170MB
   ├─ serve binary      ~5MB
   └─ dist/ folder      ~10MB (production bundle)
```

---

## Deployment Scenarios

### Scenario 1: Single MacBook (Development or Testing)

```bash
# Run once
docker run -d -p 3000:3000 optics-master:latest

# Or with docker compose
docker compose -f compose.prod.yaml up -d
```

### Scenario 2: Multiple MacBooks (No Source Code)

**Each MacBook:**
1. Pull the pre-built image:
   ```bash
   docker pull your-registry/optics-master:latest
   ```

2. Run container:
   ```bash
   docker run -d --name optics-master -p 3000:3000 --restart unless-stopped optics-master:latest
   ```

3. Access: `http://localhost:3000`

**To distribute image across team:**
- Push to Docker Hub: `docker push your-registry/optics-master:latest`
- Or use GitHub Container Registry (ghcr.io)
- Or use a private Docker registry (AWS ECR, Azure ACR, etc.)

### Scenario 3: Cloud Deployment (Google Cloud Run, AWS ECS, etc.)

The image is already Cloud Run compatible:

```bash
# Google Cloud Run
gcloud run deploy optics-master \
  --image optics-master:latest \
  --platform managed \
  --port 3000 \
  --region us-central1

# Docker environment variable is read automatically
```

---

## Volume & Network Configuration

### Persistent Storage (Optional)

If you need to store logs or configuration:

```bash
docker run -d \
  -p 3000:3000 \
  -v optics-master-logs:/var/log/optics \
  optics-master:latest
```

### Multi-Container Setup (Docker Compose)

```yaml
version: '3.8'
services:
  optics-master:
    image: optics-master:latest
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      NODE_ENV: production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "-O-", "http://localhost:3000"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

---

## Environment Variables

### Available Variables
```
PORT=3000                  # Server port (default: 3000)
NODE_ENV=production        # Set to 'production' (default: production)
```

### Custom Configuration

If API keys or other config needed in future:

```bash
docker run -d \
  -p 3000:3000 \
  -e PORT=8080 \
  -e VITE_GEMINI_API_KEY=sk-... \
  optics-master:latest
```

---

## Health Checks & Monitoring

### Container Health Status

```bash
# Check health status
docker inspect optics-master --format='{{json .State.Health}}'

# Expected output when healthy:
{"Status":"healthy","FailingStreak":0,"Log":[...]}
```

### View Logs

```bash
# Real-time logs
docker logs -f optics-master

# Last 100 lines
docker logs --tail 100 optics-master

# Since specific time
docker logs --since 30m optics-master
```

### HTTP Health Check

```bash
# Manual health test
curl -v http://localhost:3000

# Should return:
# HTTP/1.1 200 OK
# Content-Type: text/html; charset=utf-8
```

---

## Development Environment

For developers working with source code:

```bash
# Start dev environment with hot reload
docker compose up

# This uses Dockerfile.dev + compose.yaml
# Mounts source code with live file watching
# Accessible at http://localhost:5173 (Vite default)
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs optics-master

# Common issues:
# 1. Port 3000 already in use
docker run -d -p 8080:3000 optics-master:latest

# 2. Permission issues (shouldn't occur with non-root user)
docker run -d --user root -p 3000:3000 optics-master:latest
```

### High Memory Usage

```bash
# Check resource usage
docker stats optics-master

# Limit memory if needed
docker run -d \
  -p 3000:3000 \
  -m 512m \
  --memory-swap 1g \
  optics-master:latest
```

### Slow Performance

1. Check CPU throttling:
   ```bash
   docker stats --no-stream optics-master
   ```

2. Check disk I/O:
   ```bash
   docker inspect optics-master --format='{{json .GraphDriver}}'
   ```

3. Increase resource limits:
   ```bash
   docker run -d \
     -p 3000:3000 \
     --cpus 2 \
     -m 1g \
     optics-master:latest
   ```

---

## Image Updates

### Check for Updates

```bash
# Pull latest image
docker pull optics-master:latest

# Check local versions
docker images optics-master
```

### Update Running Container

```bash
# 1. Stop old container
docker stop optics-master
docker rm optics-master

# 2. Pull new image
docker pull optics-master:latest

# 3. Run new container
docker run -d -p 3000:3000 --restart unless-stopped optics-master:latest
```

### Zero-Downtime Update (Production)

Using Docker Compose with multiple containers:

```bash
# Update to latest
docker compose -f compose.prod.yaml down
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
```

---

## Security Considerations

### Current Setup
✅ Non-root user (nodejs:1001)
✅ Read-only filesystem (no source code)
✅ Health checks enabled
✅ Alpine Linux (minimal attack surface)
✅ No unnecessary packages

### Network Security

```bash
# Restrict port binding to localhost only
docker run -d -p 127.0.0.1:3000:3000 optics-master:latest
```

### Registry Scanning

For production use, scan image for vulnerabilities:

```bash
# With Docker Scout (free tier)
docker scout cves optics-master:latest

# Or external tools:
# - Trivy: trivy image optics-master:latest
# - Grype: grype optics-master:latest
```

---

## Distribution for Team

### Option 1: Docker Hub (Public)

```bash
# Tag image
docker tag optics-master:latest your-username/optics-master:latest

# Push to Docker Hub
docker login
docker push your-username/optics-master:latest

# Team members run:
docker run -d -p 3000:3000 your-username/optics-master:latest
```

### Option 2: GitHub Container Registry (Private)

```bash
# Create personal access token with 'write:packages' scope

# Login
echo $GH_TOKEN | docker login ghcr.io -u $GH_USERNAME --password-stdin

# Tag & push
docker tag optics-master:latest ghcr.io/$GH_USERNAME/optics-master:latest
docker push ghcr.io/$GH_USERNAME/optics-master:latest

# Team members:
docker pull ghcr.io/$GH_USERNAME/optics-master:latest
docker run -d -p 3000:3000 ghcr.io/$GH_USERNAME/optics-master:latest
```

### Option 3: AWS ECR (Private)

```bash
# Create repo
aws ecr create-repository --repository-name optics-master

# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag & push
docker tag optics-master:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/optics-master:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/optics-master:latest

# Team members:
docker run -d -p 3000:3000 123456789.dkr.ecr.us-east-1.amazonaws.com/optics-master:latest
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build & Push Docker Image

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build & Push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            your-username/optics-master:latest
            your-username/optics-master:${{ github.ref_name }}
          cache-from: type=registry,ref=your-username/optics-master:buildcache
          cache-to: type=registry,ref=your-username/optics-master:buildcache,mode=max
```

---

## Files Reference

### Production Dockerfile
```
Dockerfile          # Multi-stage production build
├─ Stage 1 (builder)
│  ├─ Copy package.json
│  ├─ npm ci (install deps)
│  ├─ npm run typecheck
│  ├─ npm run test:ci
│  └─ npm run build → dist/
└─ Stage 2 (runtime)
   ├─ node:20-alpine
   ├─ serve binary
   ├─ non-root user
   ├─ health check
   └─ CMD: serve -s dist -l 3000
```

### Docker Compose Files
```
compose.yaml             # Development (hot reload, volume mounts)
compose.prod.yaml        # Production (lightweight, restart policy)
```

### Development Dockerfile
```
Dockerfile.dev           # Single-stage dev image
├─ node:20-alpine
├─ npm ci
├─ EXPOSE 5173
└─ CMD: npm run dev --host 0.0.0.0
```

### Build Exclusions
```
.dockerignore            # Optimized: ~831 bytes, excludes node_modules, .git, etc.
```

---

## Performance Metrics

### Build Time
```
First build:     ~40-50s (including typecheck, tests, build)
Cached build:    ~2-3s   (uses Docker layer cache)
```

### Runtime
```
Cold start:      ~2-3s   (health check passes)
Memory usage:    ~150-200MB (idle)
CPU usage:       <1%     (idle)
Disk footprint:  220MB   (compressed: 53.4MB)
```

---

## Getting Help

### View Build Details

```bash
# See full build output
docker buildx build --progress plain -f Dockerfile .
```

### Check Version

```bash
# Check Dockerfile version
docker inspect optics-master:latest --format='{{json .Config.Labels}}'

# Check app version (inside container)
docker run optics-master:latest cat package.json | grep version
```

### Report Issues

Include these details:

```bash
# OS & Docker version
docker --version
docker compose version
uname -a

# Container details
docker inspect optics-master:latest
docker logs optics-master
docker stats --no-stream optics-master
```

---

## Summary

| Task | Command |
|------|---------|
| **Run (1 liner)** | `docker run -d -p 3000:3000 optics-master:latest` |
| **Run with compose** | `docker compose -f compose.prod.yaml up -d` |
| **View logs** | `docker logs -f optics-master` |
| **Stop** | `docker stop optics-master` |
| **Health check** | `curl http://localhost:3000` |
| **Update** | `docker pull optics-master:latest` |
| **Resource limits** | `docker run -d -p 3000:3000 --cpus 2 -m 1g optics-master:latest` |

---

**Ready to deploy.** Access the application immediately after starting the container at `http://localhost:3000`.
