# Changelog

All notable changes to this project.

## [2.0.0] - 2024-01-15

### 🎉 Major Release - SaaS Platform Transformation

Transformed simple PDF API into a complete SaaS platform with authentication, subscriptions, and billing.

### ✨ Added

#### Authentication & User Management
- User registration with email verification
- Secure login with JWT tokens
- Password reset functionality
- Email verification flow
- User profile management
- Activity logging system

#### Subscription System
- 5 pricing tiers (Trial, Starter, Professional, Business, SuperAdmin)
- Monthly usage tracking per user
- Automatic usage limit enforcement
- Plan upgrade/downgrade capability
- Trial period management (14 days, 10 conversions)
- Payment transaction tracking (ready for payment gateway)

#### API Key Management
- Secure API key generation (sk_xxx format)
- Per-user API key management
- API key authentication middleware
- Usage tracking per API key
- Last used timestamp tracking

#### PDF Generation Enhancements
- URL to PDF conversion (new feature)
- Customizable PDF options (format, margins, headers, footers)
- Usage tracking and limit enforcement
- Enhanced error handling
- Secure API key authentication

#### Email System
- Welcome emails with API keys
- Email verification emails
- Password reset emails
- Professional HTML email templates
- Zoho SMTP integration

#### Landing Page
- Professional, modern design
- SEO optimized with meta tags
- Responsive mobile-friendly layout
- Pricing section with all plans
- Features showcase
- Call-to-action sections
- Social proof elements

#### Security Features
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Password hashing with bcrypt
- JWT token authentication
- API key authentication
- SQL injection protection
- Input validation with express-validator

#### Database
- Complete MySQL schema with 7 tables
- Database seeder script
- Connection pooling
- Proper indexes for performance
- Foreign key constraints

#### Documentation
- Comprehensive README.md
- Quick Start Guide (QUICK_START.md)
- API Documentation (API_DOCUMENTATION.md)
- Deployment Guide (DEPLOYMENT.md)
- Production Checklist (PRODUCTION_CHECKLIST.md)
- Project Summary (PROJECT_SUMMARY.md)

### 🔧 Changed

#### Application Structure
- Reorganized into MVC pattern
- Separated routes, controllers, and middleware
- Added config directory for database
- Added utils directory for helpers
- Created public directory for static files

#### Main Application (index.js)
- Complete rewrite with new architecture
- Added security middleware
- Added rate limiting
- Added CORS support
- Added static file serving
- Added comprehensive error handling
- Added route organization

#### Package Configuration
- Updated package.json with new dependencies
- Added npm scripts (dev, prod, seed)
- Added project metadata
- Added engine requirements

### 📦 Dependencies Added

- `mysql2` - MySQL database client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `nodemailer` - Email sending
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `uuid` - Unique ID generation

### 🗄️ Database Schema

Created 7 tables:
1. `users` - User accounts and authentication
2. `subscription_plans` - Available pricing plans
3. `user_subscriptions` - User subscription status
4. `api_keys` - API keys for authentication
5. `api_usage` - Monthly usage tracking
6. `activity_logs` - User activity logging
7. `payment_transactions` - Payment history

### 🔐 Security Improvements

- Implemented bcrypt password hashing
- Added JWT token authentication
- Added API key authentication
- Implemented rate limiting
- Added CORS protection
- Added Helmet security headers
- Implemented SQL injection protection
- Added input validation
- Added activity logging

### 📝 API Endpoints

#### New Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile

#### New PDF Endpoints
- `POST /api/pdf/generate` - Generate PDF from HTML (enhanced)
- `POST /api/pdf/generate-from-url` - Generate PDF from URL (new)

#### New Subscription Endpoints
- `GET /api/subscription/plans` - Get all plans
- `GET /api/subscription/current` - Get current subscription
- `POST /api/subscription/change-plan` - Change plan
- `GET /api/subscription/usage-stats` - Get usage statistics

### 🎨 Frontend

- Created professional landing page
- SEO optimized with meta tags
- Responsive design
- Modern gradient design
- Pricing cards
- Feature showcase
- Call-to-action sections

### 📧 Email Templates

- Welcome email with API key
- Email verification email
- Password reset email
- Professional HTML design
- Responsive email templates

### 🔄 Migration from v1.0.0

#### Breaking Changes
- Old API endpoint `/api/v1/generate` replaced with `/api/pdf/generate`
- Authentication changed from simple API key to user-based API keys
- Environment variable `API_SECRET_KEY` no longer used
- New environment variables required (see .env.example)

#### Migration Steps
1. Create database and import schema
2. Run seeder to create plans and admin user
3. Update environment variables
4. Users need to register and get new API keys
5. Update API endpoint in client applications

### 🐛 Bug Fixes

- Improved error handling in PDF generation
- Better validation of input data
- Fixed memory leaks in Puppeteer
- Improved database connection handling

### ⚡ Performance Improvements

- Added database connection pooling
- Optimized database queries with indexes
- Implemented rate limiting to prevent abuse
- Added caching headers for static files

### 📚 Documentation

- Created comprehensive README
- Added Quick Start Guide
- Created API Documentation
- Added Deployment Guide
- Created Production Checklist
- Added Project Summary

---

## [1.0.0] - Previous Version

### Features
- Basic PDF generation from HTML
- Simple API key authentication
- Single endpoint: `/api/v1/generate`
- Docker support
- Puppeteer integration

---

## Upgrade Guide (v1.0.0 → v2.0.0)

### For Existing Users

1. **Backup your data** (if any)
2. **Create database**: `CREATE DATABASE pdf_saas;`
3. **Import schema**: `mysql -u root -p pdf_saas < database/schema.sql`
4. **Update .env**: Copy from `.env.example` and configure
5. **Run seeder**: `npm run seed`
6. **Register account**: Use the registration API or web interface
7. **Get new API key**: Check email after verification
8. **Update client code**: Change endpoint from `/api/v1/generate` to `/api/pdf/generate`
9. **Update authentication**: Use new API key format (sk_xxx)

### For New Users

Follow the Quick Start Guide in `QUICK_START.md`

---

## Future Roadmap

### Planned Features
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] User dashboard UI
- [ ] Admin panel UI
- [ ] Webhook support
- [ ] Batch PDF generation
- [ ] PDF templates
- [ ] Custom branding per user
- [ ] Analytics dashboard
- [ ] API usage graphs
- [ ] Email notifications for usage limits
- [ ] Two-factor authentication
- [ ] OAuth integration
- [ ] API versioning
- [ ] GraphQL API

### Under Consideration
- PDF editing capabilities
- PDF merging
- PDF splitting
- Watermarking
- Digital signatures
- OCR support
- Multi-language support
- White-label solution

---

For questions or support, contact: no-reply@uiflexer.com

