# Frontend User Guide

## 📱 Complete User Interface

Your PDF SaaS platform now includes a full-featured frontend application with the following pages:

### 🏠 Landing Page (`/index.html`)
- **Beautiful gradient-themed design** with professional icons
- **Feature showcase** with 6 key features (Lightning Fast, Pixel Perfect, Secure & Reliable, Usage Analytics, URL to PDF, Customizable)
- **Pricing tiers** display with all 5 plans
- **SEO optimized** with meta tags and structured content
- **Call-to-action buttons** linking to registration
- **Navigation** with Login and Get Started buttons

### 📝 Registration Page (`/register.html`)
- Clean, modern registration form
- **Password validation** with requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Email verification flow** - Users receive verification email after registration
- Links to login page and home

### 🔐 Login Page (`/login.html`)
- Secure login with email and password
- **Edge case handling**:
  - ⚠️ Unverified accounts blocked with helpful message
  - ❌ Invalid credentials with clear error
  - Session management with JWT tokens
- Forgot password link
- Links to registration and home

### ✉️ Email Verification Page (`/verify-email.html`)
- Automatic verification when user clicks email link
- **Loading state** with spinner during verification
- **Success/Error states** with appropriate icons and messages
- Redirects to login after successful verification

### 🔑 Forgot Password Page (`/forgot-password.html`)
- Password reset request form
- Sends reset link to user's email
- Security-conscious messaging (doesn't reveal if email exists)

### 📊 Dashboard (`/dashboard.html`)
The main application interface with 4 tabs:

#### 1. Overview Tab
- **Stats Cards** showing:
  - Current usage count
  - Monthly limit
  - Current plan name
  - Number of API keys
- **Usage Progress Bar** with color-coded warnings:
  - Green: Normal usage
  - Orange: 80%+ usage (warning)
  - Red: 100% usage (limit exceeded)
- **Subscription Details** with renewal date
- **Quick Actions** buttons for common tasks

#### 2. Generate PDF Tab
Two sub-tabs for PDF generation:
- **HTML to PDF**: Paste HTML content and generate PDF
- **URL to PDF**: Enter URL and generate PDF
- **Options**:
  - Page format (A4, Letter, Legal, A3)
  - Print background graphics toggle
- **Real-time feedback** with success/error alerts
- **Automatic download** of generated PDF
- **Usage tracking** updates after each generation

#### 3. API Keys Tab
- Display all API keys with details:
  - API key (with copy-to-clipboard button)
  - Name
  - Status (Active/Inactive)
  - Last used timestamp
  - Created date
- **Copy functionality** for easy integration

#### 4. Profile Tab
- User information display:
  - Full name
  - Email address
  - Account role
  - Verification status
  - Member since date

### 📱 Mobile Responsive
- **Mobile menu** with hamburger button
- **Responsive layouts** for all screen sizes
- **Touch-friendly** buttons and forms
- **Optimized typography** for mobile reading

## 🎨 Design Features

### Color Scheme
- **Primary Gradient**: Purple to Blue (#667eea → #764ba2)
- **Feature Icons**: Each with unique gradient background
  - Lightning Fast: Purple/Blue
  - Pixel Perfect: Pink/Red
  - Secure & Reliable: Blue/Cyan
  - Usage Analytics: Green/Teal
  - URL to PDF: Orange/Yellow
  - Customizable: Purple/Pink

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- Clean, modern, professional appearance

### UI Components
- **Gradient buttons** with hover effects
- **Card-based layouts** with shadows
- **Progress bars** with smooth animations
- **Alert messages** with color coding (success/error/warning)
- **Form inputs** with focus states
- **Tab navigation** with active states

## 🔒 Security Features

### Authentication Flow
1. User registers → Email sent
2. User verifies email → API key generated
3. User logs in → JWT token issued
4. Token stored in localStorage
5. Dashboard checks token on load
6. Expired/invalid tokens redirect to login

### Edge Cases Handled
- ✅ Unverified account login blocked
- ✅ Invalid credentials with clear messaging
- ✅ Expired sessions auto-redirect
- ✅ API limit exceeded with upgrade prompt
- ✅ No API key found error handling
- ✅ Network errors with retry suggestions

## 🚀 User Journey

### New User Flow
1. **Land on homepage** → See features and pricing
2. **Click "Get Started"** → Registration page
3. **Fill registration form** → Submit
4. **Check email** → Click verification link
5. **Verify email** → Success message
6. **Click "Go to Login"** → Login page
7. **Enter credentials** → Submit
8. **Redirected to dashboard** → See overview
9. **Generate first PDF** → Test the service
10. **View API keys** → Integrate into apps

### Returning User Flow
1. **Click "Login"** from homepage
2. **Enter credentials** → Submit
3. **Dashboard loads** → See current usage
4. **Generate PDFs** or **View API keys**
5. **Monitor usage** → Upgrade when needed

## 📝 Production Checklist

Before going live, update these in your HTML files:

### Landing Page (`public/index.html`)
- [ ] Update domain in code example: `https://pdf.uiflexer.com`
- [ ] Update company name if different from "PDF SaaS"
- [ ] Add Google Analytics tracking code
- [ ] Add favicon
- [ ] Update meta description for SEO

### All JavaScript Files
- [ ] Ensure `API_BASE_URL` uses `window.location.origin` (already done)
- [ ] Test all API endpoints in production
- [ ] Enable production error logging

### Email Templates
- [ ] Update email sender name in `.env`
- [ ] Customize email templates in `utils/email.js`
- [ ] Test email delivery in production

### Security
- [ ] Enable HTTPS (required for production)
- [ ] Update CORS settings to production domain
- [ ] Set secure cookie flags
- [ ] Enable rate limiting (already configured)

## 🎯 Next Steps

Your frontend is complete! Here's what you can do:

1. **Test the complete flow** from registration to PDF generation
2. **Customize branding** (colors, logo, company name)
3. **Add payment integration** (Stripe/PayPal) for plan upgrades
4. **Set up analytics** (Google Analytics, Mixpanel)
5. **Deploy to production** following DEPLOYMENT.md
6. **Monitor user behavior** and iterate on UX

## 💡 Tips

- The dashboard auto-refreshes usage after PDF generation
- Mobile menu closes automatically when navigating
- All forms have client-side validation
- Error messages are user-friendly and actionable
- Copy-to-clipboard works on all modern browsers

