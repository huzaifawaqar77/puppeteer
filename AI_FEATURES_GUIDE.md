# AI Template Generation - Quick Start Guide

## 🤖 Overview

The AI Template Generation feature uses Google's Gemini AI to create professional HTML templates from simple text descriptions. This feature is available on **Professional**, **Business**, and **SuperAdmin** plans.

---

## 🔑 Setup

### 1. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment

Add to your `.env` file:

```env
GEMINI_API_KEY=AIzaSy...your-actual-key-here
GEMINI_MODEL=gemini-pro
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7
```

### 3. Restart Server

```bash
npm start
```

---

## 📝 How to Use

### Via Dashboard UI

1. **Login** to your account (must be on Professional, Business, or SuperAdmin plan)
2. Navigate to **Generate PDF** tab
3. Click on **AI Template** sub-tab
4. Enter a description of your desired template, for example:
   ```
   Create a professional invoice template with company logo at the top,
   itemized list of products with quantities and prices, subtotal, tax,
   and total amount. Include payment terms at the bottom.
   ```
5. Click **Generate Template with AI**
6. Wait for the AI to generate your template (usually 5-10 seconds)
7. Use the generated template:
   - **Preview**: Opens template in new window
   - **Copy HTML**: Copies to clipboard
   - **Generate PDF**: Automatically creates PDF from template

### Via API

```bash
curl -X POST http://localhost:3000/api/ai/generate-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Create a modern resume template with sections for personal info, work experience, education, and skills."
  }'
```

**Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html><html>...</html>",
  "message": "Template generated successfully!"
}
```

---

## 💡 Example Prompts

### Invoice Template
```
Design a business invoice with company header, client details, itemized services table,
subtotal, tax, and total. Include payment terms and thank you message.
```

### Resume Template
```
Create a modern resume template with sections for personal info, work experience,
education, and skills. Use a clean, professional design with a sidebar for contact details.
```

### Certificate Template
```
Create a certificate of completion with decorative border, recipient name, course title,
completion date, and signature line. Use elegant fonts and professional styling.
```

### Product Catalog
```
Design a product catalog page with grid layout showing 6 products, each with image
placeholder, product name, description, and price. Include company branding at top.
```

### Event Ticket
```
Create an event ticket template with event name, date, time, venue, seat number,
barcode placeholder, and terms and conditions at the bottom.
```

### Report Template
```
Design a business report template with cover page, table of contents, executive summary
section, data tables, and charts placeholders. Use professional corporate styling.
```

---

## 🎯 Best Practices

### Writing Effective Prompts

1. **Be Specific**: Include details about layout, sections, and content
2. **Mention Styling**: Specify colors, fonts, or design preferences
3. **List Components**: Clearly state what elements you need
4. **Consider Purpose**: Mention if it's for print, web, or PDF

### Good Prompt Example ✅
```
Create a professional invoice template with:
- Company logo and details at the top
- Client information section
- Itemized table with columns: Item, Quantity, Price, Total
- Subtotal, Tax (10%), and Grand Total
- Payment terms and bank details at bottom
- Use blue and white color scheme
- Make it print-friendly
```

### Poor Prompt Example ❌
```
Make an invoice
```

---

## 🔒 Access Control

### Plan Requirements

| Plan | AI Access | Notes |
|------|-----------|-------|
| Trial | ❌ | Upgrade required |
| Starter | ❌ | Upgrade to Professional+ |
| Professional | ✅ | Full access |
| Business | ✅ | Priority access |
| SuperAdmin | ✅ | Full access |

### Error Messages

**If user doesn't have access:**
```json
{
  "success": false,
  "message": "AI Template Generator is only available on Professional, Business, and SuperAdmin plans.",
  "requiresUpgrade": true,
  "availablePlans": ["professional", "business"]
}
```

**If API key not configured:**
```json
{
  "success": false,
  "message": "AI service is not configured. Please contact support."
}
```

---

## 🛠️ Troubleshooting

### AI Generation Fails

**Problem**: "AI service is not configured"
- **Solution**: Verify `GEMINI_API_KEY` is set in `.env` and server is restarted

**Problem**: "Failed to generate template"
- **Solution**: Check your API key is valid at Google AI Studio
- **Solution**: Simplify your prompt and try again
- **Solution**: Check server logs for specific error messages

**Problem**: "AI Template Generator is only available on..."
- **Solution**: User needs to upgrade to Professional or Business plan
- **Solution**: Verify user's subscription status in database

### Generated Template Issues

**Problem**: Template doesn't look right
- **Solution**: Be more specific in your prompt
- **Solution**: Mention styling preferences explicitly
- **Solution**: Try regenerating with adjusted description

**Problem**: Template missing elements
- **Solution**: List all required components in prompt
- **Solution**: Use example prompts as reference

---

## 📊 Usage Tracking

AI template generation is logged in the `activity_logs` table:

```sql
SELECT * FROM activity_logs 
WHERE action = 'ai_template_generated' 
ORDER BY created_at DESC;
```

---

## 🚀 Advanced Usage

### Combining with PDF Generation

```javascript
// 1. Generate template
const templateResponse = await fetch('/api/ai/generate-template', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    description: 'Create an invoice template...'
  })
});

const { html } = await templateResponse.json();

// 2. Generate PDF from template
const pdfResponse = await fetch('/api/pdf/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    html: html,
    options: {
      format: 'A4',
      printBackground: true
    }
  })
});

const pdfBlob = await pdfResponse.blob();
```

---

## 💰 Cost Considerations

- Google Gemini API has a **free tier** with generous limits
- Free tier: 60 requests per minute
- Monitor usage at [Google AI Studio](https://makersuite.google.com/)
- Consider implementing rate limiting for production

---

**Happy template generating! 🎨**

