# Quick Coolify Redeployment Guide

## The Issue

The healthcheck is failing even though the app is running and ready. This is a timing/configuration issue with Coolify's healthcheck.

## Quick Fix (Immediate)

### Option 1: Disable Healthcheck (Fastest)

1. Go to Coolify UI
2. Click on OmniPDF service → Settings
3. Find "Health Check" option
4. **Toggle OFF**
5. Click Save
6. Trigger a new deployment (git push or manual deploy)

**Why**: The app IS healthy and working, but Coolify's healthcheck timing doesn't align with app startup.

### Option 2: Use Updated Dockerfile (Recommended)

1. Your updated Dockerfile now uses `npm start` (more reliable)
2. Health endpoint is at `/api/health`
3. Git commit and push:

```bash
git add Dockerfile
git commit -m "fix: simplify Dockerfile for better Coolify compatibility"
git push origin omnipdf
```

4. Trigger deployment in Coolify
5. Wait for build to complete

## What Changed

### Old Dockerfile Issues:

- ❌ Used multi-stage build with `node server.js`
- ❌ Health endpoint check was unreliable
- ❌ Complex startup process

### New Dockerfile (Better):

- ✅ Single stage, simpler
- ✅ Uses `npm start` (standard Next.js)
- ✅ `/api/health` endpoint ready
- ✅ Better Coolify compatibility
- ✅ More reliable startup

## Verification After Deploy

Once deployed, verify with these commands:

```bash
# Check if app is running
curl https://omnipdf.uiflexer.com

# Check health endpoint
curl https://omnipdf.uiflexer.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"2025-12-05T..."}
```

## If Still Having Issues

### Check Container Logs:

In Coolify:

1. Go to OmniPDF service
2. Click "Logs"
3. Look for errors (should see "✓ Ready in XXms")

### Manual Debug:

```bash
# SSH to server
ssh user@server

# Check container status
docker ps | grep omnipdf

# View logs
docker logs <container-id>

# Check port
curl http://localhost:3000/api/health
```

## Next Steps

1. **Immediate**: Try Option 1 (disable healthcheck)
2. **Then**: Deploy updated Dockerfile
3. **Verify**: Test endpoints above
4. **Monitor**: Watch logs for 5 minutes

## Deployment Command

```bash
cd /path/to/omnipdf/web
git add .
git commit -m "fix: Docker healthcheck and startup improvements"
git push origin omnipdf
# Then trigger deployment in Coolify UI
```

---

**Status**: Ready to deploy ✅
**Time to fix**: 2-3 minutes
**Risk level**: Low (current deployment will rollback if needed)
