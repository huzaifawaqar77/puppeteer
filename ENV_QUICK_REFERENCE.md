# Environment Variables - Quick Reference

## 🚀 Quick Start

### Local Development (5 seconds)

```bash
cd web
cp .env.example .env.local
npm run dev
```

That's it! All defaults work for local development.

## 📝 All Environment Variables

### Frontend (Browser - Use these in components)

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.uiflexer.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68c77b650020a2e5fa47
NEXT_PUBLIC_DATABASE_ID=pdf-flex-db
NEXT_PUBLIC_INPUT_BUCKET_ID=input-files
NEXT_PUBLIC_OUTPUT_BUCKET_ID=output-files
NEXT_PUBLIC_API_URL=http://localhost:3000  # Optional - auto-detected if not set
```

### Backend (Server-only - Use these in API routes)

```env
STIRLING_PDF_URL=http://localhost:8080
STIRLING_PDF_API_KEY=75e0b668-27be-423c-8016-5b1ccd1c19d9
```

## 🌍 Environment-Specific Configurations

### Local Development (.env.local)

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_local_project_id
STIRLING_PDF_URL=http://localhost:8080
STIRLING_PDF_API_KEY=your_local_api_key
```

### Staging

- Set in: Hosting platform dashboard (Vercel, Railway, etc.)
- Use: staging-specific Appwrite instance and Stirling PDF service
- Domain: `https://staging.yourdomain.com`

### Production

- Set in: Hosting platform dashboard (Vercel, Railway, etc.)
- Use: production Appwrite instance and Stirling PDF service
- Domain: `https://yourdomain.com`

## 🔐 Security Notes

- **Never commit `.env.local` to git** - It's in `.gitignore`
- **NEXT*PUBLIC*\* variables are exposed to browser** - Safe for non-sensitive config only
- **Private variables** (like `STIRLING_PDF_API_KEY`) should never be exposed
- **Rotate API keys** periodically for security

## 📁 Files to Know About

| File                         | Purpose                                         |
| ---------------------------- | ----------------------------------------------- |
| `.env.example`               | Template for all env variables                  |
| `.env.local`                 | Local development config (create this yourself) |
| `ENV_CONFIGURATION.md`       | Full documentation                              |
| `ENVIRONMENT_SETUP_GUIDE.md` | Setup guide for all environments                |

## ✅ Verification Checklist

- [ ] Created `.env.local` from `.env.example`
- [ ] Can run `npm run dev` without errors
- [ ] Can visit `http://localhost:3000` in browser
- [ ] API docs page shows correct base URL: `http://localhost:3000/api/premium`
- [ ] Can upload a file and process it

## 🆘 Troubleshooting

| Problem                        | Solution                                            |
| ------------------------------ | --------------------------------------------------- |
| "Cannot connect to Appwrite"   | Check `NEXT_PUBLIC_APPWRITE_ENDPOINT` is correct    |
| "API docs shows wrong URL"     | Check `NEXT_PUBLIC_API_URL` or restart dev server   |
| "Stirling PDF operations fail" | Check `STIRLING_PDF_URL` and `STIRLING_PDF_API_KEY` |
| "File upload fails"            | Check bucket IDs match Appwrite setup               |

## 💡 Usage in Code

### In Components (Frontend)

```typescript
import { appwriteConfig } from "@/lib/config";

// Use like this:
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);
```

### In API Routes (Backend)

```typescript
import { stirlingConfig } from "@/lib/config";

// Use like this:
const response = await fetch(`${stirlingConfig.url}/api/v1/...`, {
  headers: {
    "X-API-Key": stirlingConfig.apiKey,
  },
});
```

### For Dynamic API Base URL

```typescript
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

// Use like this:
const apiUrl = `${getBaseUrl()}/api/premium/merge-pdfs`;
```

## 📖 For More Info

- **Complete guide**: Read `ENV_CONFIGURATION.md`
- **Audit report**: Read `ENV_MIGRATION_AUDIT.md`
- **Setup instructions**: Read `ENVIRONMENT_SETUP_GUIDE.md`
