# Quick Start Guide

Get your PDF SaaS platform up and running in 5 minutes!

## Prerequisites Checklist

- [ ] XAMPP installed and running (MySQL)
- [ ] Node.js 18+ installed
- [ ] Git installed (optional)

## Step-by-Step Setup

### 1. Install Dependencies (1 minute)

```bash
npm install
```

### 2. Create Database (1 minute)

**Option A: Using phpMyAdmin**
1. Open http://localhost/phpmyadmin
2. Click "New" to create database
3. Name it: `pdf_saas`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Option B: Using MySQL Command Line**
```bash
mysql -u root -p
CREATE DATABASE pdf_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 3. Import Database Schema (1 minute)

**Option A: Using phpMyAdmin**
1. Select `pdf_saas` database
2. Click "Import" tab
3. Choose file: `database/schema.sql`
4. Click "Go"

**Option B: Using Command Line**
```bash
mysql -u root -p pdf_saas < database/schema.sql
```

### 4. Configure Environment (1 minute)

The `.env` file is already created. Just update your MySQL password if needed:

```bash
# Open .env file and update this line if you have a MySQL password:
DB_PASSWORD=your_mysql_password_here
```

If you don't have a MySQL password (default XAMPP), leave it empty:
```
DB_PASSWORD=
```

### 5. Seed Database (1 minute)

```bash
npm run seed
```

**IMPORTANT**: Copy and save the API keys shown in the console!

You'll see output like:
```
✓ Superadmin user created
  Email: admin@uiflexer.com
  Password: SuperAdmin@123
  API Key: sk_abc123...

✓ Demo user created
  Email: demo@example.com
  Password: Demo@123
  API Key: sk_xyz789...
```

### 6. Start the Server (30 seconds)

```bash
npm start
```

You should see:
```
✅ PDF Generation SaaS API listening on port 3000
🌐 Access the landing page at: http://localhost:3000
```

## Test Your Setup

### 1. Open Landing Page

Open your browser and go to: http://localhost:3000

You should see a beautiful landing page!

### 2. Test Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 3. Generate Your First PDF

Use the superadmin API key from step 5:

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "X-API-Key: sk_YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"html\": \"<h1>My First PDF!</h1><p>This is amazing!</p>\"}" \
  --output my-first-pdf.pdf
```

Open `my-first-pdf.pdf` - you should see your generated PDF!

### 4. Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"password\": \"Test@12345\",
    \"full_name\": \"Test User\"
  }"
```

Check the console logs to see the verification email (in development, emails are logged to console).

## What's Next?

### For Development

1. **Register a new account**: Go to http://localhost:3000 and click "Get Started"
2. **Verify your email**: Check console logs for verification link
3. **Get your API key**: Check your email after verification
4. **Start generating PDFs**: Use the API documentation

### For Production

1. Read `DEPLOYMENT.md` for production deployment guide
2. Change all default passwords
3. Update environment variables for production
4. Set up SSL/HTTPS
5. Configure your domain

## Common Issues

### "Database connection failed"

**Solution**: 
- Make sure XAMPP MySQL is running
- Check DB credentials in `.env`
- Verify database `pdf_saas` exists

### "Email not sending"

**Solution**:
- In development, emails are logged to console
- Check the terminal/console output
- For production, verify SMTP credentials

### "Port 3000 already in use"

**Solution**:
```bash
# Change port in .env
PORT=3001
```

### "Puppeteer/Chromium not found"

**Solution**:
- This is normal on Windows during development
- The Docker container has Chromium installed
- For local testing on Windows, install Chrome and update `.env`:
```
PUPPETEER_EXECUTABLE_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
```

## Default Login Credentials

### Superadmin (Unlimited Access)
- Email: `admin@uiflexer.com`
- Password: `SuperAdmin@123`
- **⚠️ CHANGE IN PRODUCTION!**

### Demo User (Trial Plan)
- Email: `demo@example.com`
- Password: `Demo@123`

## API Endpoints Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | None | Health check |
| `/api/auth/register` | POST | None | Register new user |
| `/api/auth/login` | POST | None | Login |
| `/api/auth/profile` | GET | JWT | Get user profile |
| `/api/pdf/generate` | POST | API Key | Generate PDF from HTML |
| `/api/pdf/generate-from-url` | POST | API Key | Generate PDF from URL |
| `/api/subscription/plans` | GET | None | Get all plans |
| `/api/subscription/current` | GET | JWT | Get current subscription |

## Documentation

- **Full API Documentation**: See `API_DOCUMENTATION.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Main README**: See `README.md`

## Support

If you encounter any issues:

1. Check the console/terminal for error messages
2. Review the documentation files
3. Check database connection
4. Verify environment variables

## Success Checklist

- [ ] Landing page loads at http://localhost:3000
- [ ] Health check returns success
- [ ] Database has tables (check phpMyAdmin)
- [ ] Can generate PDF with superadmin API key
- [ ] Can register new user
- [ ] Emails appear in console logs

If all checkboxes are checked, you're ready to go! 🎉

---

**Next Steps**: Read `API_DOCUMENTATION.md` to learn about all available endpoints and features.

