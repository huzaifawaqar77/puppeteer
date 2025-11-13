# Production Deployment Guide

This guide covers deploying your PDF Generation SaaS to production.

## 🚀 Pre-Deployment Checklist

### Security
- [ ] Change superadmin password
- [ ] Generate new JWT_SECRET (min 64 characters)
- [ ] Update database passwords
- [ ] Configure CORS for your domain only
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Review rate limiting settings
- [ ] Disable debug/development features

### Configuration
- [ ] Update APP_URL to production domain
- [ ] Configure production database
- [ ] Set NODE_ENV=production
- [ ] Update email templates with production URLs
- [ ] Configure backup strategy
- [ ] Set up monitoring/logging

### Testing
- [ ] Test all API endpoints
- [ ] Verify email delivery
- [ ] Test PDF generation
- [ ] Check subscription flows
- [ ] Verify payment integration (if added)

## 🔧 Environment Variables for Production

Create a `.env.production` file:

```env
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://pdf.yourdomain.com
APP_NAME=PDF Generation SaaS

# Database
DB_HOST=your-production-db-host.com
DB_PORT=3306
DB_USER=pdf_saas_user
DB_PASSWORD=STRONG_RANDOM_PASSWORD_HERE
DB_NAME=pdf_saas

# JWT - Generate with: openssl rand -base64 64
JWT_SECRET=VERY_LONG_RANDOM_STRING_MIN_64_CHARACTERS_CHANGE_THIS
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=no-reply@yourdomain.com
EMAIL_PASSWORD=YOUR_EMAIL_PASSWORD
EMAIL_FROM=no-reply@yourdomain.com
EMAIL_FROM_NAME=Your Company Name
ADMIN_EMAIL=admin@yourdomain.com

# Puppeteer Configuration
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage

# Trial Configuration
TRIAL_DAYS=14
TRIAL_CONVERSIONS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS - Your production domain
CORS_ORIGIN=https://yourdomain.com

# Security
BCRYPT_ROUNDS=12
```

## 🐳 Docker Deployment

### 1. Update Dockerfile

The existing Dockerfile should work, but verify:

```dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# Install Chromium and dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    gcompat

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy application
COPY . .

EXPOSE 3000

USER node

CMD ["node", "index.js"]
```

### 2. Build and Run

```bash
# Build image
docker build -t pdf-saas:latest .

# Run container
docker run -d \
  --name pdf-saas \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  pdf-saas:latest
```

### 3. Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./logs:/usr/src/app/logs

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: pdf_saas
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

volumes:
  mysql_data:
```

Run with:
```bash
docker-compose up -d
```

## ☁️ Cloud Deployment Options

### Option 1: DigitalOcean App Platform

1. Create new app from GitHub repo
2. Set environment variables in dashboard
3. Configure build command: `npm install`
4. Configure run command: `node index.js`
5. Add MySQL database component
6. Deploy

### Option 2: AWS EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt-get install mysql-server

# Clone repository
git clone <your-repo>
cd puppeteer

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env.production
nano .env.production  # Edit with production values

# Set up database
mysql -u root -p < database/schema.sql
node database/seeder.js

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start index.js --name pdf-saas
pm2 save
pm2 startup
```

### Option 3: Coolify (Your Current Setup)

1. Push code to Git repository
2. In Coolify dashboard:
   - Create new application
   - Connect to your repository
   - Set environment variables
   - Configure build pack: Node.js
   - Deploy

Environment variables to set in Coolify:
- All variables from `.env.production`
- Ensure `PUPPETEER_EXECUTABLE_PATH` matches container path

## 🔒 SSL/HTTPS Setup

### Using Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name pdf.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pdf.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/pdf.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pdf.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Get SSL certificate:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d pdf.yourdomain.com
```

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs pdf-saas

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Application Logging

Add to your application (optional):

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔄 Database Backups

### Automated Daily Backups

Create backup script `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
mkdir -p $BACKUP_DIR

mysqldump -u root -p$DB_PASSWORD pdf_saas > $BACKUP_DIR/pdf_saas_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "pdf_saas_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## 🚨 Post-Deployment

### 1. Change Default Credentials

```sql
-- Change superadmin password
UPDATE users 
SET password = '$2a$12$NEW_HASHED_PASSWORD' 
WHERE email = 'admin@uiflexer.com';
```

Or use the password reset flow.

### 2. Test All Endpoints

```bash
# Health check
curl https://pdf.yourdomain.com/health

# Register test user
curl -X POST https://pdf.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","full_name":"Test User"}'

# Generate PDF
curl -X POST https://pdf.yourdomain.com/api/pdf/generate \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Test</h1>"}' \
  --output test.pdf
```

### 3. Monitor Performance

- Check server resources (CPU, RAM, Disk)
- Monitor API response times
- Track error rates
- Review logs regularly

## 📈 Scaling Considerations

### Horizontal Scaling

- Use load balancer (Nginx, HAProxy)
- Deploy multiple app instances
- Use Redis for session management
- Implement queue system for PDF generation

### Database Optimization

- Add indexes for frequently queried fields
- Set up read replicas
- Implement connection pooling
- Regular maintenance and optimization

## 🆘 Troubleshooting

### Application Won't Start
- Check logs: `pm2 logs`
- Verify environment variables
- Check database connection
- Ensure port 3000 is available

### PDF Generation Fails
- Verify Chromium installation
- Check memory limits
- Review Puppeteer args
- Check file permissions

### Email Not Sending
- Verify SMTP credentials
- Check firewall rules
- Test SMTP connection
- Review email logs

---

For additional support, contact: no-reply@uiflexer.com

