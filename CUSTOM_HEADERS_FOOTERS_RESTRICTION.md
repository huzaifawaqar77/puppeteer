# 🔒 Custom Headers/Footers Restriction Implementation

**Date:** 2025-11-14  
**Feature:** Restrict custom headers and footers to Professional and Business plans  
**Status:** ✅ IMPLEMENTED (Requires server restart)

---

## 📋 Overview

Custom headers and footers in PDFs are now restricted to premium plans:

| Plan | Custom Headers/Footers | Access |
|------|------------------------|--------|
| **Trial** | ❌ Not allowed | Returns 403 error |
| **Starter** | ❌ Not allowed | Returns 403 error |
| **Professional** | ✅ Allowed | Full access |
| **Business** | ✅ Allowed | Full access |
| **SuperAdmin** | ✅ Allowed | Full access |

---

## 🔧 What Was Implemented

### **Access Control Check**

Added validation in both PDF generation functions that checks if the user is trying to use custom headers/footers:

```javascript
// Check if user is trying to use custom headers/footers
if (
  (options.displayHeaderFooter ||
    options.headerTemplate ||
    options.footerTemplate) &&
  !["professional", "business", "superadmin"].includes(
    req.subscription.plan_slug
  )
) {
  return res.status(403).json({
    success: false,
    message:
      "Custom headers and footers are only available on Professional and Business plans. Please upgrade your plan to access this feature.",
    requiresUpgrade: true,
    availablePlans: ["professional", "business"],
    currentPlan: req.subscription.plan_slug,
  });
}
```

### **Applied to Both Functions:**

1. ✅ `generatePdf()` - HTML to PDF conversion (line 97-113)
2. ✅ `generatePdfFromUrl()` - URL to PDF conversion (line 209-225)

---

## 📁 Files Modified

1. ✅ **`controllers/pdfController.js`**
   - Added header/footer restriction check to `generatePdf()` (lines 97-113)
   - Added header/footer restriction check to `generatePdfFromUrl()` (lines 209-225)

---

## 🎯 How It Works

### **Request Flow:**

```
User sends PDF generation request with custom headers/footers
    ↓
Middleware verifies API key & subscription
    ↓
Controller checks if options include:
  - displayHeaderFooter: true
  - headerTemplate: "..."
  - footerTemplate: "..."
    ↓
If plan is trial/starter → Return 403 error
If plan is professional/business → Allow request
    ↓
Generate PDF with custom headers/footers
```

### **Checked Options:**

The restriction checks for any of these options:
- `displayHeaderFooter` - Enable header/footer display
- `headerTemplate` - Custom HTML template for header
- `footerTemplate` - Custom HTML template for footer

---

## 🧪 Testing Instructions

### **Prerequisites:**
1. Restart your server: `npm start`
2. Have API keys for different plan types

---

### **Test 1: Trial User Attempts Custom Headers (Should Fail)**

**Request:**
```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "X-API-Key: YOUR_TRIAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Test PDF</h1></body></html>",
    "options": {
      "displayHeaderFooter": true,
      "headerTemplate": "<div style=\"text-align: center; font-size: 10px;\">My Custom Header</div>",
      "footerTemplate": "<div style=\"text-align: center; font-size: 10px;\">Page <span class=\"pageNumber\"></span></div>"
    }
  }'
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Custom headers and footers are only available on Professional and Business plans. Please upgrade your plan to access this feature.",
  "requiresUpgrade": true,
  "availablePlans": ["professional", "business"],
  "currentPlan": "trial"
}
```

✅ **Result:** Request blocked, user informed to upgrade

---

### **Test 2: Starter User Attempts Custom Headers (Should Fail)**

**Request:**
```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "X-API-Key: YOUR_STARTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Test PDF</h1></body></html>",
    "options": {
      "displayHeaderFooter": true,
      "headerTemplate": "<div>Header</div>"
    }
  }'
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Custom headers and footers are only available on Professional and Business plans. Please upgrade your plan to access this feature.",
  "requiresUpgrade": true,
  "availablePlans": ["professional", "business"],
  "currentPlan": "starter"
}
```

✅ **Result:** Request blocked, user informed to upgrade

---

### **Test 3: Professional User Uses Custom Headers (Should Succeed)**

**Request:**
```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "X-API-Key: YOUR_PROFESSIONAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Professional PDF</h1><p>This PDF has custom headers and footers.</p></body></html>",
    "options": {
      "displayHeaderFooter": true,
      "headerTemplate": "<div style=\"text-align: center; font-size: 10px; width: 100%; padding: 5px;\">Professional Plan - Custom Header</div>",
      "footerTemplate": "<div style=\"text-align: center; font-size: 10px; width: 100%; padding: 5px;\">Page <span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></div>",
      "margin": {
        "top": "50px",
        "bottom": "50px",
        "left": "20px",
        "right": "20px"
      }
    }
  }' \
  --output professional_with_headers.pdf
```

**Expected Response:**
- ✅ PDF file generated successfully
- ✅ Custom header appears at top of each page
- ✅ Custom footer with page numbers appears at bottom

---

### **Test 4: Business User Uses Custom Headers (Should Succeed)**

**Request:**
```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "X-API-Key: YOUR_BUSINESS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Business PDF</h1><p>Premium quality with custom branding.</p></body></html>",
    "options": {
      "displayHeaderFooter": true,
      "headerTemplate": "<div style=\"text-align: center; font-size: 12px; width: 100%; padding: 10px; border-bottom: 2px solid #667eea;\">Business Plan - Premium PDF</div>",
      "footerTemplate": "<div style=\"text-align: center; font-size: 10px; width: 100%; padding: 10px; color: #666;\">© 2025 Your Company | Page <span class=\"pageNumber\"></span></div>",
      "margin": {
        "top": "60px",
        "bottom": "60px",
        "left": "20px",
        "right": "20px"
      }
    }
  }' \
  --output business_with_headers.pdf
```

**Expected Response:**
- ✅ PDF file generated successfully (120% scale - premium quality)
- ✅ Custom header with border appears at top
- ✅ Custom footer with copyright appears at bottom

---

## 📊 Feature Comparison

| Feature | Trial | Starter | Professional | Business |
|---------|-------|---------|--------------|----------|
| **Basic PDF Generation** | ✅ | ✅ | ✅ | ✅ |
| **Quality** | Standard (80%) | High (100%) | High (100%) | Premium (120%) |
| **Custom Headers** | ❌ | ❌ | ✅ | ✅ |
| **Custom Footers** | ❌ | ❌ | ✅ | ✅ |
| **Page Numbers** | ❌ | ❌ | ✅ | ✅ |
| **Custom Branding** | ❌ | ❌ | ❌ | ✅ (future) |

---

## 💡 Header/Footer Template Examples

### **Simple Header:**
```html
<div style="text-align: center; font-size: 10px; width: 100%;">
  My Company Name
</div>
```

### **Header with Logo:**
```html
<div style="text-align: center; width: 100%; padding: 10px;">
  <img src="https://example.com/logo.png" height="30px" />
</div>
```

### **Footer with Page Numbers:**
```html
<div style="text-align: center; font-size: 10px; width: 100%;">
  Page <span class="pageNumber"></span> of <span class="totalPages"></span>
</div>
```

### **Footer with Date:**
```html
<div style="text-align: center; font-size: 10px; width: 100%;">
  Generated on <span class="date"></span>
</div>
```

---

## 🔍 Verification Checklist

- [ ] Server restarted after code changes
- [ ] Trial user with headers → Gets 403 error
- [ ] Starter user with headers → Gets 403 error
- [ ] Professional user with headers → PDF generated successfully
- [ ] Business user with headers → PDF generated successfully
- [ ] Error message includes upgrade information
- [ ] Error response includes `requiresUpgrade: true`
- [ ] Error response includes `availablePlans` array

---

## ✅ Summary

**What's Implemented:**
- ✅ Access control for custom headers/footers
- ✅ Applied to both HTML and URL PDF generation
- ✅ Clear error messages with upgrade prompts
- ✅ Professional and Business users have full access

**Benefits:**
- 🎯 Clear feature differentiation between plans
- 💰 Incentive for users to upgrade to Professional/Business
- 🔒 Enforced server-side (secure)
- 📊 Better monetization of premium features

---

**Implementation Complete! 🎉**

Restart your server and test with different plan types to verify the restriction works correctly!

