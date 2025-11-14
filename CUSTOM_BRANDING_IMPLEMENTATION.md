# 🎨 Custom Branding Implementation

**Date:** 2025-11-14  
**Feature:** Allow Business plan users to add custom branding to PDFs  
**Status:** ✅ IMPLEMENTED (Requires database migration + server restart)

---

## 📋 Overview

Business plan users can now customize their PDF branding with:

- **Company Logo** - Display logo in PDF headers
- **Company Name** - Show company name in headers/footers
- **Brand Colors** - Use custom primary/secondary colors
- **Automatic Application** - Branding applied automatically to all PDFs

| Plan             | Custom Branding | Access        |
| ---------------- | --------------- | ------------- |
| **Trial**        | ❌              | Not available |
| **Starter**      | ❌              | Not available |
| **Professional** | ❌              | Not available |
| **Business**     | ✅              | Full access   |
| **SuperAdmin**   | ✅              | Full access   |

---

## 🔧 What Was Implemented

### **1. Database Schema**

Added `branding_settings` JSON column to `users` table:

```sql
ALTER TABLE users
ADD COLUMN branding_settings JSON DEFAULT NULL;
```

**Branding Settings Structure:**

```json
{
  "logo_url": "https://example.com/logo.png",
  "company_name": "Acme Corporation",
  "primary_color": "#667eea",
  "secondary_color": "#764ba2",
  "updated_at": "2025-11-14T10:30:00Z"
}
```

### **2. Branding API Endpoints**

Created `/api/branding` routes:

- **GET `/api/branding/settings`** - Get current branding settings
- **POST `/api/branding/settings`** - Update branding (Business plan only)
- **DELETE `/api/branding/settings`** - Remove branding

### **3. Automatic PDF Branding**

Added `applyBranding()` function that:

1. Checks if user has Business/SuperAdmin plan
2. Fetches user's branding settings from database
3. Generates branded header/footer templates
4. Applies branding to PDF options automatically

### **4. Branded Header Template**

```html
<div style="width: 100%; text-align: center; padding: 10px;">
  <img src="[LOGO_URL]" height="30px" />
  <div style="color: [PRIMARY_COLOR]; font-weight: bold;">[COMPANY_NAME]</div>
</div>
```

### **5. Branded Footer Template**

```html
<div style="width: 100%; text-align: center; padding: 10px; font-size: 9px;">
  <div>© 2025 [COMPANY_NAME]</div>
  <div>
    Page <span class="pageNumber"></span> of <span class="totalPages"></span>
  </div>
</div>
```

---

## 📁 Files Created/Modified

### **Created:**

1. ✅ `database/migrations/add_branding_settings.sql` - Database migration
2. ✅ `routes/branding.js` - Branding API endpoints
3. ✅ `CUSTOM_BRANDING_IMPLEMENTATION.md` - This documentation

### **Modified:**

1. ✅ `controllers/pdfController.js` - Added `applyBranding()` function
2. ✅ `index.js` - Registered branding routes

---

## 🚀 Setup Instructions

### **Step 1: Run Database Migration**

**IMPORTANT:** You must run this SQL command before testing!

```bash
# Connect to your MySQL database
mysql -u your_username -p your_database_name

# Or if using remote database:
mysql -h your_host -u your_username -p your_database_name
```

Then run:

```sql
ALTER TABLE users
ADD COLUMN branding_settings JSON DEFAULT NULL
COMMENT 'Custom branding settings for Business plan users';
```

**Verify the column was added:**

```sql
DESCRIBE users;
```

You should see `branding_settings` in the column list.

### **Step 2: Restart Your Server**

```bash
# Stop your server (Ctrl+C)
# Then restart:
npm start
```

---

## 🧪 Testing Instructions

### **Test 1: Set Branding Settings (Business User)**

**Prerequisites:**

- Upgrade to Business plan in dashboard
- Get your auth token from localStorage

**Request:**

```bash
curl -X POST http://localhost:3000/api/branding/settings \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Acme Corporation",
    "logo_url": "https://via.placeholder.com/150x50/667eea/ffffff?text=ACME",
    "primary_color": "#667eea",
    "secondary_color": "#764ba2"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Branding settings updated successfully",
  "data": {
    "company_name": "Acme Corporation",
    "logo_url": "https://via.placeholder.com/150x50/667eea/ffffff?text=ACME",
    "primary_color": "#667eea",
    "secondary_color": "#764ba2",
    "updated_at": "2025-11-14T..."
  }
}
```

---

### **Test 2: Get Branding Settings**

**Request:**

```bash
curl -X GET http://localhost:3000/api/branding/settings \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "company_name": "Acme Corporation",
    "logo_url": "https://via.placeholder.com/150x50/667eea/ffffff?text=ACME",
    "primary_color": "#667eea",
    "secondary_color": "#764ba2",
    "updated_at": "2025-11-14T..."
  }
}
```

---

### **Test 3: Generate Branded PDF**

**Request:**

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "X-API-Key: YOUR_BUSINESS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Branded PDF Test</h1><p>This PDF should have Acme Corporation branding in the header and footer.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></body></html>"
  }' \
  --output branded_pdf.pdf
```

**Expected Result:**

- ✅ PDF generated successfully
- ✅ Header shows Acme logo (if logo_url provided)
- ✅ Header shows "Acme Corporation" in purple color
- ✅ Footer shows "© 2025 Acme Corporation"
- ✅ Footer shows page numbers
- ✅ Premium quality (120% scale - Business plan)

**Open the PDF and verify:**

1. Logo appears in header (centered)
2. Company name appears below logo in brand color
3. Footer has copyright with company name
4. Footer has page numbers

---

### **Test 4: Trial User Attempts to Set Branding (Should Fail)**

**Request:**

```bash
curl -X POST http://localhost:3000/api/branding/settings \
  -H "Authorization: Bearer TRIAL_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "My Company"
  }'
```

**Expected Response (403):**

```json
{
  "success": false,
  "message": "Custom branding is only available on Business plan. Please upgrade to access this feature.",
  "requiresUpgrade": true,
  "currentPlan": "trial",
  "availablePlans": ["business"]
}
```

---

## 🔍 Verification Checklist

- [ ] Database migration completed (`branding_settings` column exists)
- [ ] Server restarted
- [ ] Business user can set branding settings via API
- [ ] Trial/Starter users get 403 error when attempting to set branding
- [ ] Business user can retrieve branding settings
- [ ] Generated PDFs include logo in header (if logo_url provided)
- [ ] Generated PDFs include company name in header
- [ ] Generated PDFs include copyright in footer
- [ ] Generated PDFs include page numbers in footer
- [ ] Branding uses custom colors (primary_color)

---

## ✅ Summary

**What's Implemented:**

- ✅ Database schema for branding settings
- ✅ API endpoints to manage branding (GET, POST, DELETE)
- ✅ Automatic branding application in PDF generation
- ✅ Plan-based access control (Business plan only)
- ✅ Support for logo, company name, and brand colors
- ✅ Automatic header/footer generation with branding

**Benefits:**

- 🎨 Professional white-label PDFs
- 🏢 Consistent corporate branding
- 💼 Perfect for agencies and enterprises
- 🚀 Automatic application (no manual work)
- 🔒 Secure (Business plan only)

---

**Custom Branding is now live! 🎉**

**Next Steps:**

1. Run database migration (REQUIRED!)
2. Restart server
3. Test with Business plan user
4. Generate branded PDFs!
