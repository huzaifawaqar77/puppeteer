# 🚀 Stirling PDF Integration - Setup Guide

## ✅ Phase 1 Implementation Complete!

All 6 Phase 1 features have been implemented:

1. **Merge PDFs** - Combine multiple PDF files
2. **Compress PDF** - Reduce file size with 3 compression levels
3. **PDF to Word** - Convert PDF to editable DOCX
4. **PDF to Image** - Extract pages as PNG/JPG/GIF (ZIP file)
5. **Add Watermark** - Apply text watermarks with custom opacity
6. **Add Password** - Encrypt PDFs with password protection

---

## 📋 Setup Instructions

### Step 1: Run Database Migration

You need to create the `stirling_operations` table to track usage.

**Using phpMyAdmin:**

1. Go to your Hostinger control panel
2. Open **phpMyAdmin**
3. Select database: `u127753084_pdf_saas`
4. Click **SQL** tab
5. Copy and paste the contents of `database/migrations/add_stirling_operations.sql`
6. Click **Go**

**The migration will:**
- Create `stirling_operations` table for usage tracking
- Update subscription plans with Stirling PDF feature limits

---

### Step 2: Add Environment Variables

Add these two lines to your `.env` file:

```env
STIRLING_PDF_URL=https://pdf.uiflexer.com
STIRLING_API_KEY=your_api_key_here
```

**Replace `your_api_key_here` with your actual Stirling PDF API key.**

---

### Step 3: Restart Your Server

After adding the environment variables, restart your Node.js server:

```bash
# If running locally
npm start

# If running with Docker/Coolify
# Redeploy your application through Coolify dashboard
```

---

### Step 4: Test the Features

1. **Login** to your application
2. Go to **Dashboard**
3. Click **PDF Tools** in the navigation (visible for Starter+ users)
4. Test each feature:
   - Upload PDFs
   - Process them
   - Download the results

---

## 🎯 Plan-Based Access Control

The features are restricted based on subscription plans:

| Feature | Trial | Starter | Professional | Business |
|---------|-------|---------|--------------|----------|
| **Merge PDFs** | ❌ 0/month | ✅ 10/month | ✅ 100/month | ✅ Unlimited |
| **Compress PDF** | ❌ 0/month | ✅ 10/month | ✅ 100/month | ✅ Unlimited |
| **PDF to Word** | ❌ 0/month | ✅ 10/month | ✅ 100/month | ✅ Unlimited |
| **PDF to Image** | ❌ 0/month | ✅ 10/month | ✅ 100/month | ✅ Unlimited |
| **Add Watermark** | ❌ 0/month | ❌ 0/month | ✅ 20/month | ✅ Unlimited |
| **Add Password** | ❌ 0/month | ❌ 0/month | ✅ 20/month | ✅ Unlimited |

**Note:** Trial users cannot access PDF Tools. They must upgrade to Starter or higher.

---

## 📁 Files Created/Modified

### New Files:
- `services/stirlingPdf.js` - Stirling PDF API wrapper service
- `controllers/stirlingController.js` - Controller for all 6 features
- `routes/stirling.js` - Express routes with file upload
- `database/migrations/add_stirling_operations.sql` - Database schema
- `public/pdf-tools.html` - Beautiful responsive UI
- `public/js/pdf-tools.js` - Frontend JavaScript for all features
- `STIRLING_SETUP_GUIDE.md` - This file

### Modified Files:
- `index.js` - Added Stirling routes
- `public/dashboard.html` - Added PDF Tools navigation link
- `public/js/dashboard.js` - Show PDF Tools link for Starter+ users

---

## 🎨 Features Overview

### 1. Merge PDFs
- Upload 2-10 PDF files
- Combines them into a single PDF
- Drag-and-drop support
- File size display

### 2. Compress PDF
- 3 compression levels (Low, Medium, High)
- Reduces file size while maintaining quality
- Single file upload

### 3. PDF to Word
- Converts PDF to editable DOCX format
- Preserves formatting
- Downloads as `.docx` file

### 4. PDF to Image
- Converts PDF pages to images
- Supports PNG, JPG, GIF formats
- Downloads as ZIP file with all pages

### 5. Add Watermark
- Custom watermark text
- Adjustable opacity (10-100%)
- Applied to all pages

### 6. Add Password
- Password protection
- Configurable permissions (print, modify)
- AES encryption

---

## 🔧 Troubleshooting

### Issue: "PDF Tools" link not showing in dashboard
**Solution:** Make sure you're logged in with a Starter, Professional, or Business plan.

### Issue: "Failed to connect to Stirling PDF"
**Solution:** 
1. Check that `STIRLING_PDF_URL` is correct in `.env`
2. Verify your Stirling PDF instance is running at `https://pdf.uiflexer.com`
3. Test the URL in your browser

### Issue: "Invalid API key"
**Solution:**
1. Check that `STIRLING_API_KEY` is set correctly in `.env`
2. Verify the API key is valid in your Stirling PDF settings
3. Restart your server after changing `.env`

### Issue: "Usage limit exceeded"
**Solution:** This is expected behavior. Users must upgrade their plan to get more operations.

---

## 🚀 Next Steps

After Phase 1 is working, you can implement:

**Phase 2 (Week 3-4):** 10 more features
- Split PDF, Rotate Pages, Extract Pages, Remove Pages
- PDF to Excel, PDF to PowerPoint, Image to PDF
- Flatten PDF, OCR, Sign PDF

**Phase 3 (Week 5-6):** 11 more features
- Unlock PDF, Repair PDF, Sanitize PDF, Compare PDFs
- Add Page Numbers, Rearrange Pages, Scale Pages
- Crop PDF, Auto-Split, Overlay PDF, Multi-Tool

**Phase 4 (Week 7-8):** 13 advanced features
- Extract Images, Change Metadata, Change Permissions
- Add Blank Pages, Presentation Mode, PDF/A Conversion
- Extract Text, Show JavaScript, Repair, File to PDF, Markdown to PDF

---

## 📊 Expected Impact

- **10x increase in feature set** (from 1 to 50+ features)
- **Competitive with Smallpdf, iLovePDF, Adobe**
- **Higher conversion rates** (more features = more value)
- **Better retention** (users stay for the tools)
- **Upsell opportunities** (Trial → Starter → Professional → Business)

---

## ✅ Checklist

- [ ] Run database migration (`add_stirling_operations.sql`)
- [ ] Add `STIRLING_PDF_URL` to `.env`
- [ ] Add `STIRLING_API_KEY` to `.env`
- [ ] Restart server
- [ ] Test all 6 features
- [ ] Verify plan-based access control
- [ ] Check usage limits tracking

---

**Need help?** Check the server console for detailed error messages and debug logs.

