# Gemini API Fix - Direct API Calls

## 🔧 Problem Solved

The Google Generative AI SDK was having compatibility issues with the latest Gemini models. The SDK was using an outdated API format that doesn't work with newer models like `gemini-1.5-flash` and `gemini-2.0-flash-exp`.

## ✅ Solution Applied

**Switched from SDK to Direct API Calls**

Instead of using the `@google/generative-ai` SDK, we now make direct HTTP requests to the Gemini API using the native `fetch` API. This gives us:

1. ✅ **Full control** over the API request format
2. ✅ **Compatibility** with all current and future models
3. ✅ **Better error handling** with detailed error messages
4. ✅ **No SDK version dependencies** - works with any model Google releases

## 📝 What Changed

### Before (Using SDK):
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
});

const result = await model.generateContent(prompt);
const response = await result.response;
let htmlContent = response.text();
```

### After (Direct API Call):
```javascript
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

const requestBody = {
  contents: [
    {
      parts: [{ text: prompt }],
    },
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
};

const apiResponse = await fetch(apiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  },
  body: JSON.stringify(requestBody),
});

const data = await apiResponse.json();
let htmlContent = data.candidates[0].content.parts[0].text;
```

## 🚀 How to Use

### Step 1: Update Your `.env` File

Use the latest model recommended by Google:

```env
GEMINI_MODEL=gemini-2.0-flash-exp
```

**Other options:**
- `gemini-1.5-flash` - Stable, fast
- `gemini-1.5-pro` - More capable
- `gemini-2.0-flash-exp` - Latest (recommended)

### Step 2: Restart Your Application

**Local:**
```bash
npm start
```

**Coolify:**
1. Update environment variable `GEMINI_MODEL=gemini-2.0-flash-exp`
2. Redeploy

### Step 3: Test

```bash
curl -X POST http://your-domain.com/api/ai/generate-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Create a professional invoice template"
  }'
```

## 📊 Supported Models

All current Gemini models are now supported:

| Model | Status | Speed | Quality | Best For |
|-------|--------|-------|---------|----------|
| `gemini-2.0-flash-exp` | ✅ Latest | ⚡⚡⚡ | ⭐⭐⭐⭐ | **Production (Recommended)** |
| `gemini-1.5-flash` | ✅ Stable | ⚡⚡⚡ | ⭐⭐⭐ | Production |
| `gemini-1.5-pro` | ✅ Stable | ⚡⚡ | ⭐⭐⭐⭐ | Complex tasks |
| `gemini-pro` | ❌ Deprecated | - | - | Not available |

## 🔍 API Request Format

The direct API call uses Google's official REST API format:

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

**Response format:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Generated HTML content here"
          }
        ]
      }
    }
  ]
}
```

## ⚙️ Configuration

All settings are controlled via environment variables:

```env
# Required
GEMINI_API_KEY=AIzaSy...your-key-here

# Optional (with defaults)
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7
```

## 🎯 Benefits

1. **No more SDK compatibility issues** - Direct API calls work with any model
2. **Future-proof** - Will work with new models as Google releases them
3. **Better error messages** - Full API error details in logs
4. **More control** - Can customize any API parameter
5. **Lighter dependency** - Still uses SDK package but doesn't rely on it

## 📚 References

- [Gemini API Documentation](https://ai.google.dev/docs)
- [REST API Reference](https://ai.google.dev/api/rest)
- [Available Models](https://ai.google.dev/models/gemini)
- [Get API Key](https://makersuite.google.com/app/apikey)

## ✅ Verification

After updating, you should see:

**Success Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html><html>...</html>",
  "message": "Template generated successfully!"
}
```

**In Server Logs:**
```
AI template generated for user: 1
Description: Create a professional invoice template
```

**No Errors:**
- ❌ No "404 Not Found" errors
- ❌ No "model not supported" errors
- ❌ No SDK compatibility warnings

---

**Last Updated:** January 2025

**Note:** This fix makes the application compatible with all current and future Gemini models without requiring SDK updates.

