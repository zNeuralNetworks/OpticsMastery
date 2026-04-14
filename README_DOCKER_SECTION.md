# Docker Setup

## Quick Start

### Production (Any MacBook)
```bash
docker run -d -p 3000:3000 --restart unless-stopped optics-master:latest
```
Open: `http://localhost:3000`

### Development (With Source)
```bash
docker compose up
```
Open: `http://localhost:5173` (hot reload enabled)

### Using Management Script
```bash
./docker-control.sh start    # Start container
./docker-control.sh logs     # View logs
./docker-control.sh stop     # Stop container
```

## Documentation

- **[DOCKER_INDEX.md](DOCKER_INDEX.md)** — Navigation guide (start here)
- **[DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)** — 1-page quick reference
- **[DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md)** — Complete deployment guide
- **[DOCKER_BUILD_COMPLETE.md](DOCKER_BUILD_COMPLETE.md)** — Build summary

## Image Details

- **Image:** `optics-master:latest` (v0.1.0)
- **Base:** node:20-alpine
- **Size:** 220MB (compressed: 53.4MB)
- **Port:** 3000
- **User:** nodejs (non-root, UID 1001)
- **Health Check:** HTTP GET / (30s interval)

## Features

✅ Multi-stage production build  
✅ Non-root user (security)  
✅ Health checks (auto-recovery)  
✅ No source code in image  
✅ One-command deployment  
✅ Cloud Run compatible  
✅ TypeScript + tests in CI  

## For Team

No source code needed:
```bash
docker run -d -p 3000:3000 optics-master:latest
```

## Development

With hot reload:
```bash
docker compose up
# Edit files → auto-reload at http://localhost:5173
```

## Deployment

See [DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md) for:
- Google Cloud Run
- AWS ECS / Kubernetes
- GitHub Actions CI/CD
- Multi-MacBook distribution
