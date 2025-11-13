# PDF Generation SaaS Platform

A complete SaaS platform for converting HTML to PDF using Puppeteer, with user authentication, subscription management, and usage tracking.

## 🚀 Features

### Core Features

- **User Authentication**: Registration, login, email verification, password reset
- **Subscription Management**: Multiple pricing tiers with usage limits
- **API Key Management**: Secure API keys for each user
- **Usage Tracking**: Monitor monthly API usage per user
- **Email Notifications**: Automated emails for verification, welcome, and password reset
- **Rate Limiting**: Protect your API from abuse
- **Landing Page**: Professional, SEO-optimized landing page with Font Awesome icons
- **Admin Panel**: Superadmin access with unlimited usage

### PDF Generation

- **HTML to PDF**: Convert HTML content to high-quality PDFs
- **URL to PDF**: Convert any website URL to PDF with enhanced loading strategies
- **Advanced Wait Strategies**: Ensures all images and resources are fully loaded before PDF generation
- **Customizable Options**: Page format, margins, background printing, and more

### AI-Powered Features ✨

- **AI Template Generator**: Generate professional HTML templates from text descriptions using Google Gemini AI
- **Smart Prompts**: Pre-built example prompts for common templates (invoices, resumes, certificates, catalogs)
- **One-Click PDF**: Generate PDFs directly from AI-generated templates
- **Plan-Based Access**: AI features available on Professional, Business, and SuperAdmin plans

### User Dashboard

- **Usage Statistics**: Real-time tracking of PDF conversions and limits
- **Upgrade Plans UI**: Beautiful plan comparison for trial users with feature highlights
- **API Key Management**: Generate, view, and manage API keys
- **Profile Management**: View and update user information

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL 5.7+ or MariaDB 10.3+
- XAMPP (for local development) or any MySQL server
- SMTP credentials (Zoho, Gmail, etc.)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd puppeteer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create Database

1. Start XAMPP and open phpMyAdmin
2. Create a new database named `pdf_saas`
3. Or use MySQL command line:

```sql
CREATE DATABASE pdf_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Run Schema

```bash
# Import the schema
mysql -u root -p pdf_saas < database/schema.sql
```

Or import via phpMyAdmin:

- Open phpMyAdmin
- Select `pdf_saas` database
- Click "Import" tab
- Choose `database/schema.sql`
- Click "Go"

### 4. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database - Update these for your MySQL setup
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pdf_saas

# JWT - CHANGE THIS IN PRODUCTION!
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Email - Already configured with your Zoho SMTP
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=465
EMAIL_USER=no-reply@uiflexer.com
EMAIL_PASSWORD=U99vM7jQVFT0
EMAIL_FROM=no-reply@uiflexer.com

# Google Gemini AI (Optional - for AI template generation)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7
```

**Note**: To enable AI template generation features:

1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file as `GEMINI_API_KEY`
3. Use `gemini-1.5-flash` (recommended) or `gemini-1.5-pro` for the model
4. AI features will be available to users on Professional, Business, and SuperAdmin plans

**Available Models:** `gemini-1.5-flash` (fast), `gemini-1.5-pro` (advanced), `gemini-2.0-flash-exp` (experimental)

### 5. Seed the Database

```bash
node database/seeder.js
```

This will create:

- 5 subscription plans:
  - **Trial**: 10 conversions/month, free
  - **Starter**: 100 conversions/month, $9.99/month
  - **Professional**: 1,000 conversions/month, $29.99/month + AI Template Generator
  - **Business**: 10,000 conversions/month, $99.99/month + AI Template Generator + Priority AI
  - **SuperAdmin**: Unlimited conversions + all features
- Superadmin user: `admin@uiflexer.com` / `SuperAdmin@123`
- Demo user: `demo@example.com` / `Demo@123`
- API keys for both users

**⚠️ IMPORTANT**: Save the API keys shown in the console!

### 6. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

#### Verify Email

```bash
GET /api/auth/verify-email?token=<verification_token>
```

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Profile

```bash
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### PDF Generation Endpoints

#### Generate PDF from HTML

```bash
POST /api/pdf/generate
X-API-Key: your_api_key
Content-Type: application/json

{
  "html": "<h1>Hello World</h1>",
  "options": {
    "format": "A4",
    "printBackground": true,
    "margin": {
      "top": "20px",
      "right": "20px",
      "bottom": "20px",
      "left": "20px"
    }
  }
}
```

#### Generate PDF from URL

```bash
POST /api/pdf/generate-from-url
X-API-Key: your_api_key
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    "format": "A4"
  }
}
```

### Subscription Endpoints

#### Get All Plans

```bash
GET /api/subscription/plans
```

#### Get Current Subscription

```bash
GET /api/subscription/current
Authorization: Bearer <jwt_token>
```

#### Change Plan

```bash
POST /api/subscription/change-plan
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "plan_slug": "professional"
}
```

## 🔧 Production Deployment

### 1. Update Environment Variables

```env
NODE_ENV=production
APP_URL=https://your-domain.com
DB_HOST=your-production-db-host
DB_PASSWORD=strong-production-password
JWT_SECRET=very-long-random-string-min-64-characters
CORS_ORIGIN=https://your-domain.com
```

### 2. Security Checklist

- [ ] Change all default passwords (superadmin, database)
- [ ] Generate new JWT_SECRET (use: `openssl rand -base64 64`)
- [ ] Update CORS_ORIGIN to your domain
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure rate limiting appropriately
- [ ] Set up database backups
- [ ] Review and update email templates

### 3. Docker Deployment

The existing Dockerfile is configured for the PDF service. Update it if needed:

```bash
docker build -t pdf-saas .
docker run -p 3000:3000 --env-file .env pdf-saas
```

### 4. Database Migration

For production, export your local database and import to production:

```bash
# Export
mysqldump -u root -p pdf_saas > pdf_saas_backup.sql

# Import on production
mysql -u production_user -p pdf_saas < pdf_saas_backup.sql
```

## 🎯 Testing the API

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345",
    "full_name": "Test User"
  }'
```

### 2. Check Email for Verification Link

Click the verification link in the email or use the token from the database.

### 3. Generate PDF

After verification, you'll receive an API key. Use it:

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "X-API-Key: sk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Test PDF</h1><p>This is a test.</p>"}' \
  --output test.pdf
```

## 📊 Database Schema

- **users**: User accounts and authentication
- **subscription_plans**: Available pricing plans
- **user_subscriptions**: User subscription status
- **api_keys**: API keys for authentication
- **api_usage**: Monthly usage tracking
- **activity_logs**: User activity logging
- **payment_transactions**: Payment history

## 🔐 Default Credentials

### Superadmin

- Email: `admin@uiflexer.com`
- Password: `SuperAdmin@123`
- **⚠️ CHANGE IN PRODUCTION!**

### Demo User

- Email: `demo@example.com`
- Password: `Demo@123`

## 🐛 Troubleshooting

### Database Connection Failed

- Check MySQL is running (XAMPP)
- Verify DB credentials in `.env`
- Ensure database `pdf_saas` exists

### Email Not Sending

- Verify SMTP credentials
- Check firewall/antivirus blocking port 465
- Test SMTP connection separately

### Puppeteer Issues

- Ensure Chromium is installed: `/usr/bin/chromium-browser`
- For local development on Windows, update `PUPPETEER_EXECUTABLE_PATH` in `.env`

### AI Template Generation Not Working

- Verify `GEMINI_API_KEY` is set in `.env`
- Ensure user is on Professional, Business, or SuperAdmin plan
- Check API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Review server logs for specific error messages

## 🆕 What's New

### Latest Updates

#### AI-Powered Template Generation

- Generate professional HTML templates from text descriptions
- Pre-built prompts for common use cases (invoices, resumes, certificates)
- One-click PDF generation from AI templates
- Available on Professional and Business plans

#### Enhanced PDF Generation

- Improved URL to PDF conversion with advanced wait strategies
- Ensures all images and resources are fully loaded
- Configurable timeout and delay options
- Better handling of dynamic content

#### Improved User Experience

- Replaced all emoji icons with professional Font Awesome icons
- Beautiful upgrade plan UI for trial users
- Plan comparison table showing feature differences
- Responsive design improvements

## 📝 License

MIT License - feel free to use for commercial projects.

## 🤝 Support

For issues or questions:

- Email: no-reply@uiflexer.com
- Create an issue in the repository

---

Built with ❤️ using Node.js, Express, MySQL, and Puppeteer
