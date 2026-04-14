# Cloud Run Deployment Fix

## Problem
Cloud Run deployment was failing with error:
```
The user-provided container failed to start and listen on the port defined by 
the PORT=8080 environment variable
```

## Root Cause
- Cloud Run sets `PORT=8080` by default
- The original Dockerfile hardcoded port 3000
- The health check also referenced port 3000
- The cloudbuild.yaml used GKE deploy instead of Cloud Run deploy

## Solution Applied

### 1. Updated Dockerfile
**Changes:**
- Changed EXPOSE from 3000 → 8080
- Changed ENV PORT default from 3000 → 8080
- Updated CMD to use shell expansion: `CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]`
  - This allows PORT environment variable to override default
  - Falls back to 8080 if PORT not set
- Updated HEALTHCHECK to use dynamic port from environment variable

**Before:**
```dockerfile
EXPOSE 3000
ENV PORT=3000 NODE_ENV=production
CMD ["serve", "-s", "dist", "-l", "3000"]
HEALTHCHECK ... CMD node -e "require('http').get('http://localhost:3000', ...)
```

**After:**
```dockerfile
EXPOSE 8080
ENV PORT=8080 NODE_ENV=production
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
HEALTHCHECK ... CMD node -e "const port = process.env.PORT || 8080; require('http').get('http://localhost:' + port, ...)
```

### 2. Updated cloudbuild.yaml
**Changes:**
- Replaced GKE deploy (gke-deploy) with Cloud Run deploy (cloud-builders/run)
- Updated image registry to use Artifact Registry format: `${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/${_SERVICE_NAME}`
- Added Cloud Run specific flags:
  - `--port 8080`: Tells Cloud Run to listen on 8080
  - `--memory 512Mi`: Memory allocation
  - `--cpu 1`: CPU allocation
  - `--allow-unauthenticated`: Public access
  - `--timeout 3600`: 1-hour timeout for requests
- Added substitution variables for flexibility

**Before:**
```yaml
- name: 'gcr.io/cloud-builders/gke-deploy'
  args:
    - 'run'
    - '--filename=.'
    - '--image=gcr.io/$PROJECT_ID/$_SERVICE_NAME:$SHORT_SHA'
    - '--location=${_REGION}'
```

**After:**
```yaml
- name: 'gcr.io/cloud-builders/run'
  args:
    - 'deploy'
    - '${_SERVICE_NAME}'
    - '--image'
    - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/${_SERVICE_NAME}:${SHORT_SHA}'
    - '--region'
    - '${_REGION}'
    - '--platform'
    - 'managed'
    - '--port'
    - '8080'
    - '--memory'
    - '512Mi'
    - '--cpu'
    - '1'
    - '--allow-unauthenticated'
```

### 3. Updated compose.prod.yaml
**Changes:**
- Updated port mapping from 3000:3000 → 8080:8080
- Updated PORT environment variable from 3000 → 8080
- Updated health check to use dynamic port from environment variable

### 4. Dockerfile.dev
**No changes needed** - already uses port 5173 for Vite dev server

## Testing

### Local Development (Still Works)
```bash
# Dev with hot reload (port 5173)
docker compose up

# Or production image locally (port 8080)
docker run -d -p 8080:8080 optics-master:latest
```

### Cloud Run Deployment
```bash
# Trigger new build with fixed configuration
git add .
git commit -m "Fix Cloud Run deployment - use PORT 8080"
git push origin main

# Or manually trigger with gcloud
gcloud builds submit --config=cloudbuild.yaml
```

## Port Configuration

| Environment | Port | How Set |
|-------------|------|---------|
| Local dev (Vite) | 5173 | Vite default |
| Local prod (compose) | 8080 | compose.prod.yaml |
| Local prod (docker run) | 8080 | ENV PORT=8080 |
| Cloud Run | 8080 | Cloud Run default + --port 8080 |
| MacBook (custom) | Custom | docker run -p <custom>:8080 |

## Environment Variables

The container now properly respects:
- `PORT=8080` (default, used by Cloud Run)
- Can be overridden: `docker run -e PORT=3000 optics-master:latest`

## Health Check

The health check now:
1. Reads PORT from environment variable
2. Falls back to 8080 if not set
3. Makes HTTP request to localhost:PORT
4. Validates HTTP 200 response

## Next Deploy

When you push this code:
1. GitHub triggers cloudbuild.yaml
2. Build step: Creates Docker image with port 8080
3. Push step: Pushes to Artifact Registry
4. Deploy step: Deploys to Cloud Run with `--port 8080`
5. Cloud Run will set PORT=8080 in container
6. Container starts on port 8080
7. Health check validates on port 8080
8. Deployment succeeds ✓

## Verification

After deployment, verify:
```bash
# Cloud Run logs should show:
gcloud run services describe opticsmasteryreference --region=us-central1

# Should show port 8080 in the revision details
```

Access your application at the Cloud Run URL provided after deployment.
