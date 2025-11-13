# 🚀 Coolify Deployment Guide

## ✅ Your Dockerfile is Ready!

Your existing Dockerfile is **100% compatible** with all the new features and will work perfectly with Coolify!

## 📋 Pre-Deployment Checklist

### 1. Database Setup (Already Done ✅)
- [x] Remote database configured: `141.147.45.160:3006`
- [ ] Database `pdf_saas` created
- [ ] Tables created (run `database/schema.sql`)
- [ ] Subscription plans seeded (run `database/seed.sql`)
- [ ] Firewall allows connections from Coolify server IP

### 2. Generate Production Secrets

**Generate a new JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output - you'll need it for Coolify environment variables.

## 🔧 Coolify Configuration

### Step 1: Push Code to Git

```bash
git add .
git commit -m "Add complete PDF SaaS frontend and backend"
git push origin main
```

### Step 2: Create Application in Coolify

1. Login to your Coolify instance
2. Click **"+ New Resource"**
3. Select **"Application"**
4. Choose your Git source (GitHub/GitLab/Gitea)
5. Select your repository
6. Choose branch: `main` (or your default branch)

### Step 3: Configure Build Settings

- **Build Pack**: Dockerfile
- **Dockerfile Location**: `./Dockerfile` (default)
- **Port**: `3000`
- **Health Check Path**: `/health` (optional but recommended)

### Step 4: Set Environment Variables

In Coolify, add these environment variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

# Database Configuration (Your Remote DB)
DB_HOST=141.147.45.160
DB_PORT=3006
DB_USER=root
DB_PASSWORD=Mardan12@345
DB_NAME=pdf_saas

# JWT Configuration (GENERATE NEW SECRET!)
JWT_SECRET=paste_your_generated_secret_here
JWT_EXPIRES_IN=7d

# Email Configuration (Zoho SMTP)
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=no-reply@uiflexer.com
EMAIL_PASS=your_zoho_app_password
EMAIL_FROM_ADDRESS=no-reply@uiflexer.com
EMAIL_FROM_NAME=UIFlexer
ADMIN_EMAIL=no-reply@uiflexer.com

# Security Settings
BCRYPT_ROUNDS=12
TRIAL_DAYS=14

# CORS (Update to your actual domain)
CORS_ORIGIN=https://your-domain.com

# Rate Limiting (Optional - defaults are fine)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 5: Configure Domain

1. In Coolify, go to **Domains** section
2. Add your domain: `pdf.uiflexer.com` (or your preferred domain)
3. Enable **SSL/HTTPS** (Coolify handles this automatically with Let's Encrypt)
4. Update `APP_URL` and `CORS_ORIGIN` environment variables to match your domain

### Step 6: Deploy!

1. Click **"Deploy"** button
2. Watch the build logs
3. Wait for deployment to complete
4. Access your application at your configured domain

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-domain.com/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Landing Page
Visit: `https://your-domain.com`
- Should see landing page with gradient icons

### 3. Registration Flow
1. Click "Get Started"
2. Register a new account
3. Check email for verification link
4. Verify email
5. Login to dashboard

### 4. PDF Generation
1. Login to dashboard
2. Go to "Generate PDF" tab
3. Test HTML to PDF
4. Test URL to PDF
5. Verify usage count increments

## 🔒 Security Checklist

- [ ] **HTTPS enabled** (Coolify does this automatically)
- [ ] **New JWT_SECRET generated** (don't use default)
- [ ] **CORS_ORIGIN set to your domain** (not `*`)
- [ ] **Database password is strong**
- [ ] **Email password is app-specific** (not main password)
- [ ] **Environment variables not committed to Git**
- [ ] **Rate limiting enabled** (already configured)

## 🐛 Troubleshooting

### Build Fails

**Check Dockerfile syntax:**
```bash
docker build -t pdf-saas .
```

**Check logs in Coolify:**
- Go to deployment logs
- Look for error messages
- Common issues: missing dependencies, wrong Node version

### Database Connection Fails

**Test connection from Coolify server:**
```bash
mysql -h 141.147.45.160 -P 3006 -u root -p
```

**Check firewall:**
- Ensure Coolify server IP is whitelisted
- Port 3006 is open
- Database user has remote access permissions

### Email Not Sending

**Verify Zoho SMTP:**
- Use app-specific password (not main password)
- Enable "Less Secure Apps" if needed
- Check Zoho account is active

**Test email manually:**
```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","full_name":"Test User"}'
```

### Application Not Accessible

**Check Coolify logs:**
- Container running?
- Port 3000 exposed?
- Domain configured correctly?

**Check health endpoint:**
```bash
curl https://your-domain.com/health
```

## 📊 Monitoring

### Coolify Built-in Monitoring
- CPU usage
- Memory usage
- Container logs
- Deployment history

### Application Logs
View logs in Coolify dashboard or via CLI:
```bash
docker logs <container-name> -f
```

### Database Monitoring
Monitor your MySQL database:
- Connection count
- Query performance
- Storage usage

## 🔄 Updates & Redeployment

### To Deploy Updates:

1. **Make changes locally**
2. **Test locally:**
   ```bash
   node index.js
   ```
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
4. **Coolify auto-deploys** (if auto-deploy enabled)
   - Or click "Redeploy" in Coolify dashboard

### Zero-Downtime Deployment
Coolify supports zero-downtime deployments:
- Enable in application settings
- New container starts before old one stops

## 🎯 Production Optimizations

### 1. Database Connection Pooling
Already configured in `config/database.js`:
- Connection limit: 10
- Queue limit: 0 (unlimited)

### 2. Rate Limiting
Already configured:
- 100 requests per 15 minutes per IP
- Adjust in environment variables if needed

### 3. Caching (Future Enhancement)
Consider adding Redis for:
- Session storage
- API response caching
- Rate limit storage

### 4. CDN (Future Enhancement)
Serve static files via CDN:
- Faster load times
- Reduced server load
- Better global performance

## 📈 Scaling

### Horizontal Scaling
Coolify supports multiple instances:
1. Increase replica count in Coolify
2. Use load balancer (Coolify handles this)
3. Ensure database can handle connections

### Vertical Scaling
Increase container resources:
- More CPU
- More RAM
- Adjust in Coolify settings

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Health check returns 200 OK
- ✅ Landing page loads with HTTPS
- ✅ Registration sends verification email
- ✅ Email verification works
- ✅ Login redirects to dashboard
- ✅ PDF generation works
- ✅ Usage tracking increments
- ✅ No errors in logs

## 🎉 You're Live!

Once deployed, your PDF SaaS platform is ready to:
- Accept user registrations
- Generate PDFs via API
- Track usage and billing
- Manage subscriptions
- Scale with demand

**Congratulations on your deployment! 🚀**

