# Docker Deployment Troubleshooting Guide

## Issue: Healthcheck Failed (ECONNREFUSED)

### Symptoms

```
Healthcheck status: "unhealthy"
AggregateError [ECONNREFUSED]: connect ECONNREFUSED
```

### Root Causes

1. Container not ready yet (startup time too short)
2. Healthcheck command not available in container
3. Server not listening on the configured port
4. Wrong port in healthcheck configuration

### Solutions

#### Solution 1: Use the Simplified Dockerfile (Recommended)

The original Dockerfile had issues with the standalone output. Use `Dockerfile.simple` instead:

1. **Update your Coolify deployment**:

   - Go to Coolify UI
   - Edit your OmniPDF service
   - Change Dockerfile from `Dockerfile` to `Dockerfile.simple`
   - Save and redeploy

2. **Why it works better**:
   - Uses `npm start` (Next.js default start command)
   - Simpler setup with better compatibility
   - Includes curl for healthcheck
   - Built-in `/api/health` endpoint

#### Solution 2: Increase Healthcheck Delays

If using the main `Dockerfile`, adjust healthcheck timings in `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  start_period: 30s # Increase from default
  retries: 5 # Allow more retries
```

#### Solution 3: Disable Healthcheck (Not Recommended)

If you need a quick fix while debugging:

In Coolify UI:

1. Go to service settings
2. Find "Health Check" option
3. Toggle it OFF
4. Redeploy

**Note**: This is temporary. Fix the underlying issue properly.

#### Solution 4: Check Application Startup

Verify the app is actually running:

```bash
# SSH into your server
ssh user@your-server

# View container logs
docker logs <container-id>

# Check if app is listening
docker exec <container-id> curl http://localhost:3000

# Check port binding
docker port <container-id>
```

## Common Deployment Issues

### Issue 1: Build Takes Too Long

**Symptom**: Deployment times out during build

**Solution**:

```yaml
# In Coolify, increase build timeout to 20-30 minutes
# Or optimize node_modules in .dockerignore
```

### Issue 2: Out of Memory

**Symptom**: Container stops or crashes after startup

**Solution**:

```yaml
# Increase memory in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2048M # Increase from 1024M
```

### Issue 3: Database Connection Fails

**Symptom**: App runs but contacts fail or blog doesn't load

**Solution**:

```bash
# Verify environment variables in Coolify
echo $APPWRITE_ENDPOINT
echo $APPWRITE_API_KEY

# Test connection from container
docker exec <container-id> curl $APPWRITE_ENDPOINT
```

### Issue 4: Email Not Sending

**Symptom**: Contact form works but no emails arrive

**Solution**:

1. Check email configuration in `.env.local`
2. Verify SMTP credentials
3. Test with telnet:

```bash
docker exec <container-id> \
  node -e "require('nodemailer').createTransport({host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT}).verify()"
```

### Issue 5: Images Not Loading

**Symptom**: og-images, favicons missing from website

**Solution**:

```bash
# Verify public folder is copied
docker exec <container-id> ls -la /app/public/

# Ensure images are in public/
# Check next.config.ts has correct image config
```

### Issue 6: High CPU Usage

**Symptom**: Server is slow, container using lots of CPU

**Solution**:

```bash
# Check running processes
docker exec <container-id> top

# Look for memory leaks or infinite loops
# Restart container
docker-compose restart omnipdf

# Consider increasing resources
```

## Deployment Workflow for Coolify

### Quick Start (Recommended)

1. **Clone repo to your server**:

```bash
git clone <your-repo> omnipdf
cd omnipdf/web
```

2. **Create environment file**:

```bash
cp .env.docker .env.local
nano .env.local
# Fill in all variables
```

3. **In Coolify UI**:

   - Create new "Dockerfile" service
   - Point to `Dockerfile.simple`
   - Set environment variables
   - Expose port 3000
   - Enable healthcheck: `/api/health`
   - Deploy

4. **Monitor deployment**:
   - Watch logs in real-time
   - Check healthcheck status
   - Wait for "healthy" status

### Manual Deployment (Alternative)

```bash
# Build image
docker build -t omnipdf:latest -f Dockerfile.simple .

# Run container
docker run -d \
  -p 3000:3000 \
  --name omnipdf \
  --env-file .env.local \
  omnipdf:latest

# Check health
docker logs omnipdf
docker exec omnipdf curl http://localhost:3000/api/health
```

## Testing the Deployment

### Test Endpoints

```bash
# Health check
curl https://omnipdf.uiflexer.com/api/health

# Home page
curl -I https://omnipdf.uiflexer.com/

# Sitemap
curl https://omnipdf.uiflexer.com/sitemap.xml

# Robots
curl https://omnipdf.uiflexer.com/robots.txt

# Manifest
curl https://omnipdf.uiflexer.com/manifest.json
```

### Verify Functionality

- [ ] Home page loads
- [ ] Navigation works
- [ ] Tools page loads
- [ ] Blog displays posts
- [ ] Contact form works
- [ ] API endpoints respond
- [ ] Images load correctly
- [ ] SEO metadata present

## Debug Checklist

Before contacting support, verify:

- [ ] Container is running: `docker ps`
- [ ] Logs show no errors: `docker logs <id>`
- [ ] Port 3000 is exposed: `docker port <id>`
- [ ] Health check passes: `curl http://localhost:3000/api/health`
- [ ] Environment variables set: `docker inspect <id>`
- [ ] Network connectivity: `docker network ls`
- [ ] Disk space available: `df -h`
- [ ] Memory available: `free -h`

## Useful Commands

```bash
# View all containers
docker ps -a

# View specific container logs
docker logs -f <container-id>

# Execute command in container
docker exec <container-id> <command>

# Stop container
docker stop <container-id>

# Restart container
docker restart <container-id>

# Remove container
docker rm <container-id>

# Inspect container
docker inspect <container-id>

# View container stats
docker stats <container-id>

# Check image layers
docker history omnipdf:latest

# Export logs to file
docker logs <container-id> > logs.txt 2>&1
```

## Rollback Procedure

If deployment fails:

1. **In Coolify**:

   - Go to service dashboard
   - Click "Rollback to previous version"
   - Or manually deploy previous working commit

2. **Manual rollback**:

```bash
# Stop current container
docker stop omnipdf

# Switch to old image
docker run -d -p 3000:3000 --name omnipdf-old omnipdf:old

# Verify
docker logs omnipdf-old
```

## Performance Optimization

### Reduce Startup Time

```yaml
# In docker-compose.yml
start_period: 15s # Reduce to 15s if startup is quick
```

### Reduce Container Size

```bash
# Check image size
docker images omnipdf

# Use multi-stage build (already in Dockerfile)
# Consider using distroless in future
```

### Improve Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 60s # Increase interval in production
  timeout: 5s
  start_period: 20s
  retries: 3
```

## Monitoring & Alerting

### View Container Logs

```bash
# Real-time logs
docker logs -f omnipdf

# Last 100 lines
docker logs --tail 100 omnipdf

# With timestamps
docker logs --timestamps omnipdf
```

### Set Up Coolify Alerts

1. Go to service settings
2. Enable notifications
3. Set alert threshold
4. Configure webhook/email

## Support Resources

- **Docker Docs**: https://docs.docker.com/
- **Coolify Docs**: https://coolify.io/docs
- **Next.js Docs**: https://nextjs.org/docs/deployment
- **OmniPDF Docs**: Check `/DOCKER_DEPLOYMENT_GUIDE.md`

## When to Use Each Dockerfile

### Use `Dockerfile.simple`:

- ✅ First deployment
- ✅ Easiest setup
- ✅ Best for Coolify
- ✅ Most compatible
- ✅ Starts faster

### Use `Dockerfile` (multi-stage):

- ✅ Production with size optimization
- ✅ When image size matters
- ✅ Long-running deployments
- ✅ Cost optimization (smaller images)
- ✅ When `npm start` isn't suitable

## Next Steps

1. **Choose Dockerfile**: Start with `Dockerfile.simple`
2. **Set Environment Variables**: Fill in `.env.local`
3. **Deploy**: Use Coolify UI
4. **Monitor**: Check logs for 5 minutes
5. **Test**: Verify endpoints work
6. **Celebrate**: Your app is live! 🎉

---

**Last Updated**: December 5, 2025
**Version**: 2.0
**Status**: Updated with Coolify fixes
