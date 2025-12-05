# OmniPDF Docker Deployment Guide

## Overview

This guide explains how to deploy OmniPDF to your self-hosted Coolify instance using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Coolify instance running
- Appwrite instance (cloud or self-hosted)
- Email service configured (Zoho, Gmail, SendGrid, etc.)
- Domain configured (omnipdf.uiflexer.com)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/omnipdf.git
cd omnipdf/web
```

### 2. Configure Environment Variables

```bash
cp .env.docker .env.local
nano .env.local  # Edit with your values
```

### 3. Build Docker Image

```bash
docker build -t omnipdf:latest .
```

### 4. Run Container

```bash
docker-compose up -d
```

### 5. Access Application

Open browser to: `http://localhost:3000` (or your domain)

## Detailed Configuration

### Environment Variables

#### Appwrite Setup

1. Get your Appwrite credentials:

   - Endpoint: `https://your-appwrite-server/v1`
   - API Key: From Appwrite console → Settings → API Keys
   - Project ID: From project settings
   - Database ID: Create a database and get the ID
   - Blog Collection ID: Create a "blogs" collection

2. Set in `.env.local`:

```env
APPWRITE_ENDPOINT=https://appwrite.uiflexer.com/v1
APPWRITE_API_KEY=your_key_here
APPWRITE_PROJECT_ID=project_id
APPWRITE_DATABASE_ID=database_id
APPWRITE_BLOG_COLLECTION_ID=blogs_id
```

#### Email Configuration (Zoho Example)

1. Set up Zoho Mail account
2. Generate app-specific password
3. Configure:

```env
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=465
EMAIL_USER=your-email@zoho.com
EMAIL_PASSWORD=app_password
EMAIL_FROM=noreply@omnipdf.uiflexer.com
EMAIL_TO=contact@omnipdf.uiflexer.com
```

#### Gmail Setup (Alternative)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app_specific_password
EMAIL_FROM=noreply@omnipdf.uiflexer.com
```

### Coolify Integration

#### Method 1: Direct Docker Compose

1. Connect your Git repository to Coolify
2. Create a new "Docker Compose" service
3. Point to `docker-compose.yml`
4. Configure environment variables in Coolify UI
5. Deploy

#### Method 2: Dockerfile

1. Create a new "Dockerfile" service in Coolify
2. Point to the `Dockerfile`
3. Configure port mapping (3000:3000)
4. Set environment variables
5. Deploy

#### Method 3: Manual Deployment

```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone https://github.com/your-repo/omnipdf.git
cd omnipdf/web

# Create .env.local with your configuration
nano .env.local

# Build and run
docker-compose up -d
```

## Docker Image Details

### Image Specifications

- **Base Image**: `node:20-alpine` (lightweight)
- **Size**: ~250MB (optimized multi-stage build)
- **Security**: Runs as non-root user (nextjs)
- **Health Check**: Built-in
- **Restart Policy**: Unless stopped

### Multi-Stage Build Benefits

1. **Stage 1 (deps)**: Production dependencies only
2. **Stage 2 (builder)**: Compiles Next.js app
3. **Stage 3 (runner)**: Minimal runtime image

- Final image excludes build artifacts and dev dependencies
- Reduces image size by ~70%

## Health Checks

The Docker container includes built-in health checks:

```bash
# Check container health
docker ps  # Shows "healthy" status

# View health logs
docker logs omnipdf-app
```

## Resource Limits

Default allocation (adjust in docker-compose.yml):

```yaml
deploy:
  resources:
    limits:
      cpus: "2"
      memory: 1024M
    reservations:
      cpus: "1"
      memory: 512M
```

Adjust based on your server capacity.

## Production Checklist

- [ ] Environment variables configured
- [ ] Database collections created in Appwrite
- [ ] Email service tested
- [ ] Domain SSL certificate configured
- [ ] Coolify reverse proxy configured
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] Rate limiting configured
- [ ] Sitemaps accessible

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs omnipdf-app

# Verify environment variables
docker-compose config

# Rebuild image
docker-compose build --no-cache
```

### Health Check Failing

```bash
# Check connectivity
docker exec omnipdf-app wget -O- http://localhost:3000

# Verify port binding
docker port omnipdf-app
```

### High Memory Usage

```bash
# Check resource usage
docker stats omnipdf-app

# Adjust limits in docker-compose.yml
# Restart container
docker-compose restart
```

### Database Connection Issues

```bash
# Verify Appwrite is accessible
docker exec omnipdf-app curl $APPWRITE_ENDPOINT

# Check credentials
echo $APPWRITE_API_KEY
```

## Monitoring & Logging

### View Logs

```bash
# Live logs
docker logs -f omnipdf-app

# Last 100 lines
docker logs --tail 100 omnipdf-app

# With timestamps
docker logs -f --timestamps omnipdf-app
```

### Container Stats

```bash
# Real-time stats
docker stats omnipdf-app

# Detailed info
docker inspect omnipdf-app
```

## Backup & Restore

### Backup Application

```bash
# Backup environment variables
cp .env.local .env.backup

# Backup entire directory
tar -czf omnipdf-backup-$(date +%Y%m%d).tar.gz /path/to/omnipdf
```

### Restore Application

```bash
# Stop container
docker-compose down

# Restore from backup
tar -xzf omnipdf-backup-20231205.tar.gz -C /path/to

# Restart
docker-compose up -d
```

## Updates & Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild image
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Database Migrations

```bash
# Connect to Appwrite console
# Create new collections or update schema as needed
# Restart OmniPDF container
docker-compose restart omnipdf
```

## Performance Optimization

### Enable Caching

```yaml
# In docker-compose.yml
environment:
  NEXT_BUILD_ID: "optimized"
```

### Use CDN

Configure Coolify's reverse proxy or use Cloudflare

### Database Optimization

- Index frequently queried fields in Appwrite
- Enable caching in Appwrite

## Security Best Practices

1. **Never commit .env.local** - It's in .gitignore
2. **Use strong secrets** - Generate random API keys
3. **Enable HTTPS** - Configure SSL in Coolify
4. **Restrict API Keys** - Limit scopes in Appwrite
5. **Regular Updates** - Keep Node.js and dependencies updated
6. **Monitor Logs** - Check for suspicious activity
7. **Rate Limiting** - Configured in code
8. **CORS Protection** - Set proper CORS headers

## Support & Documentation

- **Docker Docs**: https://docs.docker.com
- **Coolify Docs**: https://coolify.io/docs
- **Appwrite Docs**: https://appwrite.io/docs
- **Next.js Docs**: https://nextjs.org/docs

## Useful Commands

```bash
# Build image
docker build -t omnipdf:latest .

# Push to registry
docker tag omnipdf:latest your-registry/omnipdf:latest
docker push your-registry/omnipdf:latest

# Run container
docker run -p 3000:3000 --env-file .env.local omnipdf:latest

# Stop container
docker-compose down

# Remove all images and containers
docker system prune -a

# View image layers
docker history omnipdf:latest

# Inspect image
docker inspect omnipdf:latest
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Appwrite collections created
- [ ] Email service tested
- [ ] SSL certificate ready
- [ ] Domain DNS configured
- [ ] Backup created

### Deployment

- [ ] Image built successfully
- [ ] Container health checks passing
- [ ] Domain accessible
- [ ] All pages loading correctly
- [ ] Contact form working
- [ ] Blog displaying

### Post-Deployment

- [ ] Sitemaps accessible
- [ ] SEO metadata correct
- [ ] Analytics configured
- [ ] Monitoring active
- [ ] Backups scheduled
- [ ] Documentation updated

---

**Last Updated**: December 5, 2025
**Version**: 1.0
**Status**: Production Ready
