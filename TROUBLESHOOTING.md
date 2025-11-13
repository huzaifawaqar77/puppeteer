# Troubleshooting Guide

## Common Issues and Solutions

### 1. Express Rate Limiter Error (X-Forwarded-For)

**Error:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Cause:**
Your application is behind a reverse proxy (Nginx, Coolify, etc.) but Express doesn't know to trust the proxy headers.

**Solution:**
✅ **FIXED** - Added `app.set('trust proxy', 1)` to `index.js`

This tells Express to trust the first proxy in front of it, which is necessary when deploying behind:
- Coolify
- Nginx
- Apache
- Cloudflare
- Any reverse proxy

**Verification:**
```bash
# Check if the line exists in index.js
grep "trust proxy" index.js
```

---

### 2. AI Template Generation - JSON Parse Error

**Error:**
```
Error checking AI access: SyntaxError: Unexpected token 'U', "Unlimited "... is not valid JSON
```

**Cause:**
The `features` column in the `subscription_plans` table contains invalid JSON data.

**Solution:**

**Option 1: Run the fix script (Recommended)**
```bash
node database/fix-features.js
```

This script will:
- Check all subscription plans
- Identify invalid JSON in features column
- Fix them with proper JSON arrays

**Option 2: Re-seed the database**
```bash
node database/seeder.js
```

This will clear all data and re-create everything with proper JSON.

**Option 3: Manual SQL fix**
```sql
-- Check current features
SELECT id, slug, features FROM subscription_plans;

-- Update Professional plan
UPDATE subscription_plans 
SET features = '["1,000 PDF conversions per month","Priority support","High quality output","API access","Custom headers/footers","AI Template Generator"]'
WHERE slug = 'professional';

-- Update Business plan
UPDATE subscription_plans 
SET features = '["10,000 PDF conversions per month","Priority support","Premium quality","API access","Custom branding","SLA guarantee","AI Template Generator","Priority AI access"]'
WHERE slug = 'business';

-- Update SuperAdmin plan
UPDATE subscription_plans 
SET features = '["Unlimited PDF conversions","Full admin access","All features included","AI Template Generator"]'
WHERE slug = 'superadmin';
```

**Verification:**
```bash
# Test AI access
curl -X POST http://localhost:3000/api/ai/generate-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"description": "Create a simple invoice template"}'
```

---

### 3. AI Template Generation - Access Denied

**Error:**
```json
{
  "success": false,
  "message": "AI Template Generator is only available on Professional, Business, and SuperAdmin plans."
}
```

**Cause:**
User is on Trial or Starter plan which don't include AI features.

**Solution:**
1. Upgrade user to Professional or Business plan
2. Or test with SuperAdmin account: `admin@uiflexer.com` / `SuperAdmin@123`

**Manual upgrade via SQL:**
```sql
-- Check user's current plan
SELECT u.email, sp.name as plan_name, sp.slug
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE u.email = 'your-email@example.com';

-- Upgrade to Professional plan
UPDATE user_subscriptions us
JOIN users u ON us.user_id = u.id
JOIN subscription_plans sp ON sp.slug = 'professional'
SET us.plan_id = sp.id
WHERE u.email = 'your-email@example.com';
```

---

### 4. AI Template Generation - API Key Not Configured

**Error:**
```json
{
  "success": false,
  "message": "AI service is not configured. Please contact support."
}
```

**Cause:**
`GEMINI_API_KEY` is not set in `.env` file.

**Solution:**
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your-key-here
   GEMINI_MODEL=gemini-pro
   GEMINI_MAX_TOKENS=2048
   GEMINI_TEMPERATURE=0.7
   ```
3. Restart the server:
   ```bash
   npm start
   ```

**Verification:**
```bash
# Check if env var is set
echo $GEMINI_API_KEY  # Linux/Mac
echo %GEMINI_API_KEY%  # Windows CMD
$env:GEMINI_API_KEY    # Windows PowerShell
```

---

### 5. Database Connection Issues

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
1. Verify MySQL is running
2. Check `.env` database credentials:
   ```env
   DB_HOST=141.147.45.160  # Your remote server
   DB_PORT=3006            # Your custom port
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=pdf_saas
   ```
3. Test connection:
   ```bash
   mysql -h 141.147.45.160 -P 3006 -u root -p pdf_saas
   ```

---

### 6. Puppeteer/Chromium Issues

**Error:**
```
Error: Failed to launch the browser process
```

**Solution for Docker/Coolify:**
```dockerfile
# Dockerfile already includes:
RUN apk add chromium chromium-chromedriver
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

**Solution for local development:**
Update `.env`:
```env
# Windows
PUPPETEER_EXECUTABLE_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe

# Mac
PUPPETEER_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome

# Linux
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

---

### 7. Email Not Sending

**Error:**
```
Error: Invalid login
```

**Solution:**
1. Verify Zoho SMTP credentials in `.env`
2. Check if email account is active
3. Test SMTP connection:
   ```bash
   telnet smtp.zoho.com 465
   ```

---

### 8. JWT Token Errors

**Error:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Solution:**
1. Check `JWT_SECRET` is set in `.env` (min 32 characters)
2. Token might be expired (default: 7 days)
3. Login again to get new token

---

## Quick Diagnostic Commands

### Check Application Status
```bash
# Check if server is running
curl http://localhost:3000/health

# Expected response:
# {"success":true,"status":"ok","timestamp":"..."}
```

### Check Database
```bash
# Connect to database
mysql -h 141.147.45.160 -P 3006 -u root -p pdf_saas

# Check tables
SHOW TABLES;

# Check subscription plans
SELECT id, slug, name, price FROM subscription_plans;

# Check users
SELECT id, email, is_verified, role FROM users;
```

### Check Environment Variables
```bash
# View all env vars (be careful with sensitive data)
cat .env

# Check specific vars
grep GEMINI_API_KEY .env
grep DB_HOST .env
```

### Check Logs
```bash
# If using PM2
pm2 logs

# If using Docker
docker logs <container-name>

# If running directly
# Logs will be in terminal
```

---

## Getting Help

If you're still experiencing issues:

1. **Check server logs** for detailed error messages
2. **Run diagnostic commands** above
3. **Check this guide** for similar issues
4. **Contact support** with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment (local/Docker/Coolify)
   - Relevant logs

---

**Last Updated:** 2024

