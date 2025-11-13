# Testing Guide

## 🧪 Complete Testing Checklist

Follow this guide to test all features of your PDF SaaS platform.

## Prerequisites

1. ✅ Database created and seeded (you mentioned this is done)
2. ✅ `.env` file configured with correct values
3. ✅ Dependencies installed (`npm install`)
4. ✅ Server running (`node index.js`)

## 🚀 Start the Server

```bash
cd /path/to/your/project
node index.js
```

You should see:
```
Server running on port 3000
Database connected successfully
```

## 📋 Test Scenarios

### 1. Landing Page Test
**URL**: `http://localhost:3000/`

- [ ] Page loads with gradient background
- [ ] All 6 feature icons display with colored gradients
- [ ] "Get Started" button links to `/register.html`
- [ ] "Login" link in navigation works
- [ ] Pricing section shows all 5 plans
- [ ] All navigation links work

### 2. Registration Flow Test
**URL**: `http://localhost:3000/register.html`

**Test Case 1: Successful Registration**
- [ ] Fill in all fields:
  - Full Name: `Test User`
  - Email: `test@example.com`
  - Password: `Test1234` (meets all requirements)
  - Confirm Password: `Test1234`
- [ ] Click "Create Account"
- [ ] Success message appears
- [ ] Check your email inbox (configured in `.env`)
- [ ] Verification email received

**Test Case 2: Password Validation**
- [ ] Try password `test` → Error: "at least 8 characters"
- [ ] Try password `testtest` → Error: "uppercase letter"
- [ ] Try password `TESTTEST` → Error: "lowercase letter"
- [ ] Try password `TestTest` → Error: "number"
- [ ] Try password `Test1234` → Success ✅

**Test Case 3: Duplicate Email**
- [ ] Try registering with same email again
- [ ] Error: "Email already registered"

### 3. Email Verification Test
**URL**: Check your email

- [ ] Open verification email
- [ ] Click verification link
- [ ] Redirected to `/verify-email.html?token=...`
- [ ] Loading spinner appears
- [ ] Success message: "Email Verified!"
- [ ] "Go to Login" button appears
- [ ] Check email again for welcome email with API key

### 4. Login Flow Test
**URL**: `http://localhost:3000/login.html`

**Test Case 1: Unverified Account (if you have one)**
- [ ] Try logging in before verifying email
- [ ] Error: "⚠️ Please verify your email address..."
- [ ] Status code: 403

**Test Case 2: Invalid Credentials**
- [ ] Enter wrong password
- [ ] Error: "❌ Invalid email or password"
- [ ] Status code: 401

**Test Case 3: Successful Login**
- [ ] Enter correct email and password
- [ ] Success message appears
- [ ] Redirected to `/dashboard.html`
- [ ] Dashboard loads with user data

### 5. Dashboard Test
**URL**: `http://localhost:3000/dashboard.html`

**Overview Tab**
- [ ] Stats cards show correct data:
  - Usage Count: 0 (for new user)
  - Monthly Limit: 10 (trial plan)
  - Plan: Trial
  - API Keys: 1
- [ ] Progress bar shows 0%
- [ ] Subscription details show trial end date
- [ ] Quick action buttons present

**Generate PDF Tab - HTML to PDF**
- [ ] Switch to "Generate PDF" tab
- [ ] Select "HTML to PDF" sub-tab
- [ ] Paste this HTML:
  ```html
  <h1>Test PDF</h1>
  <p>This is a test PDF generated from HTML.</p>
  ```
- [ ] Select format: A4
- [ ] Check "Print Background"
- [ ] Click "Generate PDF"
- [ ] Button shows "Generating PDF..."
- [ ] PDF downloads automatically
- [ ] Success message appears
- [ ] Usage count updates to 1
- [ ] Progress bar updates to 10%

**Generate PDF Tab - URL to PDF**
- [ ] Switch to "URL to PDF" sub-tab
- [ ] Enter URL: `https://example.com`
- [ ] Select format: Letter
- [ ] Click "Generate PDF"
- [ ] PDF downloads
- [ ] Usage count updates to 2
- [ ] Progress bar updates to 20%

**API Keys Tab**
- [ ] Switch to "API Keys" tab
- [ ] API key displays (starts with `sk_`)
- [ ] Click "Copy" button
- [ ] Success message: "Copied!"
- [ ] Paste somewhere to verify it copied
- [ ] Check "Last Used" timestamp (should be recent)

**Profile Tab**
- [ ] Switch to "Profile" tab
- [ ] Full name displays correctly
- [ ] Email displays correctly
- [ ] Role shows "user"
- [ ] Verification status: "Verified ✅"
- [ ] Member since date shows registration date

**Mobile Menu Test**
- [ ] Resize browser to mobile width (< 768px)
- [ ] Hamburger menu (☰) appears
- [ ] Click hamburger menu
- [ ] Menu slides in from left
- [ ] Click a tab
- [ ] Menu closes automatically
- [ ] Tab switches correctly

**Logout Test**
- [ ] Click "Logout" button
- [ ] Redirected to `/login.html`
- [ ] Try accessing `/dashboard.html` directly
- [ ] Redirected back to `/login.html` (auth check works)

### 6. Forgot Password Test
**URL**: `http://localhost:3000/forgot-password.html`

- [ ] Enter your email address
- [ ] Click "Send Reset Link"
- [ ] Success message appears (even if email doesn't exist - security)
- [ ] Check email for password reset link (if implemented)

### 7. Edge Cases Test

**Test Case 1: Usage Limit Warning (80%)**
- [ ] Generate PDFs until usage reaches 8/10 (80%)
- [ ] Orange warning appears: "You've used 80% of your monthly limit"

**Test Case 2: Usage Limit Exceeded (100%)**
- [ ] Generate PDFs until usage reaches 10/10 (100%)
- [ ] Red error appears: "Monthly limit reached!"
- [ ] Try generating another PDF
- [ ] Error: "Monthly conversion limit reached"
- [ ] Status code: 429

**Test Case 3: Expired Session**
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Delete the `token` key
- [ ] Refresh dashboard
- [ ] Redirected to login page

**Test Case 4: Invalid Token**
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Change `token` value to `invalid_token`
- [ ] Refresh dashboard
- [ ] Redirected to login page

### 8. API Endpoint Test (Direct API Call)

**Test with cURL** (use your actual API key from dashboard):

```bash
# HTML to PDF
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_actual_api_key_here" \
  -d '{
    "html": "<h1>Test</h1><p>API Test</p>",
    "options": {
      "format": "A4",
      "printBackground": true
    }
  }' \
  --output test.pdf

# URL to PDF
curl -X POST http://localhost:3000/api/pdf/generate-from-url \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_actual_api_key_here" \
  -d '{
    "url": "https://example.com",
    "options": {
      "format": "A4"
    }
  }' \
  --output test2.pdf
```

Expected results:
- [ ] PDF files created successfully
- [ ] Usage count increments in database
- [ ] Dashboard shows updated usage

## 🐛 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: Check `.env` file has correct MySQL credentials

### Issue: "Email not sending"
**Solution**: Verify Zoho SMTP settings in `.env`:
- `EMAIL_HOST=smtp.zoho.com`
- `EMAIL_PORT=465`
- `EMAIL_SECURE=true`
- Correct username and password

### Issue: "PDF generation fails"
**Solution**: Ensure Puppeteer is installed correctly for ARM Linux:
```bash
npm install puppeteer-core
```

### Issue: "Cannot access dashboard"
**Solution**: Clear localStorage and login again

### Issue: "API key not working"
**Solution**: 
1. Check if email is verified
2. Check if subscription is active
3. Verify API key is active in database

## ✅ Success Criteria

All tests passing means:
- ✅ Complete user registration and verification flow works
- ✅ Login with proper error handling works
- ✅ Dashboard displays all user data correctly
- ✅ PDF generation from HTML and URL works
- ✅ Usage tracking and limits work
- ✅ API keys display and copy functionality works
- ✅ Mobile responsive design works
- ✅ Edge cases handled gracefully
- ✅ Direct API calls work with API key

## 🎉 Ready for Production!

Once all tests pass, you're ready to deploy! See `DEPLOYMENT.md` for production deployment instructions.

