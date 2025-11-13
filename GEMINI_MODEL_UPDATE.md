# Gemini Model Update Guide

## 🚨 Important: Update Required

Google has deprecated the `gemini-pro` model. You need to update your `.env` file to use a newer model.

---

## ⚡ Quick Fix

### Step 1: Update Your `.env` File

Open your `.env` file and change:

**OLD (Deprecated):**

```env
GEMINI_MODEL=gemini-pro
```

**NEW (Recommended):**

```env
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Step 2: Restart Your Application

**If running locally:**

```bash
npm start
```

**If deployed on Coolify:**

1. Go to your Coolify dashboard
2. Navigate to your application
3. Go to "Environment Variables"
4. Update `GEMINI_MODEL` to `gemini-2.0-flash-exp`
5. Click "Save" and redeploy

---

## 📋 Available Models

Choose one of these models based on your needs:

### Recommended: gemini-1.5-flash

```env
GEMINI_MODEL=gemini-1.5-flash
```

- ✅ **Fast** - Quick response times
- ✅ **Efficient** - Lower cost
- ✅ **Reliable** - Stable and production-ready
- ✅ **Good quality** - Excellent for HTML template generation
- 💰 **Free tier**: 15 requests per minute

**Best for:** Most use cases, production environments

---

### Advanced: gemini-1.5-pro

```env
GEMINI_MODEL=gemini-1.5-pro
```

- ✅ **More capable** - Better reasoning
- ✅ **Higher quality** - More detailed outputs
- ⚠️ **Slower** - Takes longer to respond
- ⚠️ **Higher cost** - More expensive
- 💰 **Free tier**: 2 requests per minute

**Best for:** Complex templates requiring advanced reasoning

---

### Experimental: gemini-2.0-flash-exp

```env
GEMINI_MODEL=gemini-2.0-flash-exp
```

- ✅ **Latest features** - Cutting edge capabilities
- ⚠️ **Experimental** - May have bugs or changes
- ⚠️ **Not recommended for production**

**Best for:** Testing new features, development only

---

## 🔍 How to Verify

After updating, test the AI template generation:

### Via Dashboard

1. Login to your account (Professional, Business, or SuperAdmin plan)
2. Go to **Dashboard** → **Generate PDF** → **AI Template**
3. Enter a description: "Create a simple invoice template"
4. Click **Generate Template with AI**
5. You should see the generated HTML within 5-10 seconds

### Via API

```bash
curl -X POST http://your-domain.com/api/ai/generate-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Create a professional invoice template"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "html": "<!DOCTYPE html><html>...</html>",
  "message": "Template generated successfully!"
}
```

---

## ❌ Common Errors

### Error: Model Not Found (404)

```
models/gemini-pro is not found for API version v1beta
```

**Solution:** You're still using `gemini-pro`. Update to `gemini-1.5-flash` as shown above.

---

### Error: Invalid API Key

```
API key not valid. Please pass a valid API key.
```

**Solution:**

1. Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Make sure `GEMINI_API_KEY` is set correctly in `.env`
3. Restart your server

---

### Error: Rate Limit Exceeded

```
Resource has been exhausted (e.g. check quota).
```

**Solution:**

- You've exceeded the free tier limits
- Wait a minute and try again
- Or upgrade to a paid plan at [Google AI Studio](https://ai.google.dev/pricing)

**Free Tier Limits:**

- `gemini-1.5-flash`: 15 requests/minute, 1,500 requests/day
- `gemini-1.5-pro`: 2 requests/minute, 50 requests/day

---

## 📊 Model Comparison

| Feature          | gemini-1.5-flash | gemini-1.5-pro     | gemini-2.0-flash-exp |
| ---------------- | ---------------- | ------------------ | -------------------- |
| Speed            | ⚡⚡⚡ Fast      | ⚡⚡ Moderate      | ⚡⚡⚡ Fast          |
| Quality          | ⭐⭐⭐ Good      | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Excellent   |
| Cost             | 💰 Low           | 💰💰 Higher        | 💰 Low               |
| Free RPM         | 15               | 2                  | 15                   |
| Production Ready | ✅ Yes           | ✅ Yes             | ⚠️ Experimental      |
| **Recommended**  | ✅ **YES**       | For complex tasks  | For testing only     |

---

## 🎯 Recommendation

**For most users:** Use `gemini-1.5-flash`

It provides the best balance of:

- Speed (fast responses)
- Quality (good enough for HTML templates)
- Cost (free tier is generous)
- Reliability (production-ready)

---

## 📚 Additional Resources

- [Google AI Studio](https://makersuite.google.com/app/apikey) - Get API keys
- [Gemini API Documentation](https://ai.google.dev/docs) - Official docs
- [Model Pricing](https://ai.google.dev/pricing) - Pricing details
- [Model Comparison](https://ai.google.dev/models/gemini) - Detailed comparison

---

## ✅ Checklist

- [ ] Updated `GEMINI_MODEL` in `.env` to `gemini-1.5-flash`
- [ ] Restarted application (or redeployed on Coolify)
- [ ] Tested AI template generation via dashboard
- [ ] Verified no errors in server logs
- [ ] Confirmed templates are generating successfully

---

**Last Updated:** January 2025

**Note:** Google regularly updates their models. Check the [official documentation](https://ai.google.dev/models/gemini) for the latest available models.
