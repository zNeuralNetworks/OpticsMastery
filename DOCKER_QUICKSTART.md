# Docker Quick Start — Optics Master

## One-Command Deploy

```bash
docker run -d -p 3000:3000 --restart unless-stopped optics-master:latest
```

Open browser: `http://localhost:3000`

---

## For Multiple MacBooks (No Source Code)

Each team member:

```bash
# Run container (does not require source code)
docker run -d --name optics-master -p 3000:3000 --restart unless-stopped optics-master:latest

# View logs
docker logs -f optics-master

# Stop when done
docker stop optics-master
```

---

## Docker Compose (Simpler Management)

```bash
# Start
docker compose -f compose.prod.yaml up -d

# View logs
docker logs -f optics-master

# Stop
docker compose -f compose.prod.yaml down
```

---

## Development (With Source Code)

```bash
# Clone repo
git clone <repo-url>
cd optics-master

# Start dev environment (hot reload)
docker compose up

# Open browser
# http://localhost:5173
```

---

## Check Status

```bash
# Is container running?
docker ps | grep optics-master

# Healthy?
curl http://localhost:3000

# Resource usage
docker stats optics-master
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `docker run -d -p 8080:3000 optics-master:latest` |
| Container crashes | `docker logs optics-master` |
| High memory | `docker run -d -p 3000:3000 -m 512m optics-master:latest` |
| Update image | `docker pull optics-master:latest` |

---

## Full Documentation

See `DOCKER_DEPLOYMENT_GUIDE.md` for complete reference.
