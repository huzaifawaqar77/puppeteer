# Environment Configuration Guide

This document outlines all environment variables used in the PDF Conversion application and how to configure them for different environments.

## Overview

The application uses environment variables to configure connections to external services and customize behavior for different deployment environments. Environment variables are loaded from `.env.local` (local development) or system environment variables (production).

## Required Environment Variables

### Appwrite Configuration

These variables configure the connection to your Appwrite backend service.

| Variable                          | Type   | Description               | Default                            | Required |
| --------------------------------- | ------ | ------------------------- | ---------------------------------- | -------- |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT`   | String | Appwrite API endpoint URL | `https://appwrite.uiflexer.com/v1` | Yes      |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | String | Appwrite project ID       | `68c77b650020a2e5fa47`             | Yes      |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should not contain sensitive credentials.

### Database Configuration

These variables configure the Appwrite database and storage buckets.

| Variable                       | Type   | Description                | Default        | Required |
| ------------------------------ | ------ | -------------------------- | -------------- | -------- |
| `NEXT_PUBLIC_DATABASE_ID`      | String | Appwrite database ID       | `pdf-flex-db`  | Yes      |
| `NEXT_PUBLIC_INPUT_BUCKET_ID`  | String | Bucket ID for input files  | `input-files`  | Yes      |
| `NEXT_PUBLIC_OUTPUT_BUCKET_ID` | String | Bucket ID for output files | `output-files` | Yes      |

### API URL Configuration

| Variable              | Type   | Description                                   | Default                                     | Required |
| --------------------- | ------ | --------------------------------------------- | ------------------------------------------- | -------- |
| `NEXT_PUBLIC_API_URL` | String | Base URL for API endpoints (used in API docs) | Auto-detected from `window.location.origin` | No       |

When not set, the application will automatically use `window.location.origin` as the API base URL. This ensures API documentation always points to the correct endpoint regardless of deployment environment.

### Stirling PDF Configuration

These variables configure the connection to your self-hosted Stirling PDF service.

| Variable               | Type   | Description                      | Default                                | Required |
| ---------------------- | ------ | -------------------------------- | -------------------------------------- | -------- |
| `STIRLING_PDF_URL`     | String | URL of the Stirling PDF service  | `http://localhost:8080`                | Yes      |
| `STIRLING_PDF_API_KEY` | String | API key for Stirling PDF service | `75e0b668-27be-423c-8016-5b1ccd1c19d9` | Yes      |

**Note**: The Stirling PDF URL and API key are server-side only (not prefixed with `NEXT_PUBLIC_`).

### Gotenberg Configuration

These variables configure the connection to your self-hosted Gotenberg service with authentication.

| Variable             | Type   | Description                           | Default                            | Required |
| -------------------- | ------ | ------------------------------------- | ---------------------------------- | -------- |
| `GOTENBERG_URL`      | String | URL of the Gotenberg service          | `https://gotenberg.uiflexer.com`   | Yes      |
| `GOTENBERG_USERNAME` | String | Username for Gotenberg authentication | `Znlz6EqYM09GmcJB`                 | Yes      |
| `GOTENBERG_PASSWORD` | String | Password for Gotenberg authentication | `l1neT52mJSFRbiopVzEZLz6K0HrB6uqG` | Yes      |

**Note**: Gotenberg credentials are server-side only (not prefixed with `NEXT_PUBLIC_`). These are required for all Gotenberg API operations.

## Configuration by Environment

### Local Development (.env.local)

For local development, create a `.env.local` file in the `web/` directory:

```bash
# Local Appwrite instance (or point to staging)
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id

NEXT_PUBLIC_DATABASE_ID=pdf-flex-db
NEXT_PUBLIC_INPUT_BUCKET_ID=input-files
NEXT_PUBLIC_OUTPUT_BUCKET_ID=output-files

# Local development URL (optional - auto-detected)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Local Stirling PDF instance
STIRLING_PDF_URL=http://localhost:8080
STIRLING_PDF_API_KEY=your_api_key

# Local Gotenberg instance
GOTENBERG_URL=https://gotenberg.uiflexer.com
GOTENBERG_USERNAME=Znlz6EqYM09GmcJB
GOTENBERG_PASSWORD=l1neT52mJSFRbiopVzEZLz6K0HrB6uqG
```

### Staging Environment

For staging, set environment variables in your deployment platform:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://staging-appwrite.youromain.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=staging_project_id

NEXT_PUBLIC_DATABASE_ID=pdf-flex-db-staging
NEXT_PUBLIC_INPUT_BUCKET_ID=input-files-staging
NEXT_PUBLIC_OUTPUT_BUCKET_ID=output-files-staging

NEXT_PUBLIC_API_URL=https://staging.yourdomain.com

STIRLING_PDF_URL=https://stirling-staging.yourdomain.com
STIRLING_PDF_API_KEY=staging_api_key

GOTENBERG_URL=https://gotenberg-staging.yourdomain.com
GOTENBERG_USERNAME=staging_username
GOTENBERG_PASSWORD=staging_password
```

### Production Environment

For production, set environment variables in your hosting platform's dashboard:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.yourdomain.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=prod_project_id

NEXT_PUBLIC_DATABASE_ID=pdf-flex-db-prod
NEXT_PUBLIC_INPUT_BUCKET_ID=input-files-prod
NEXT_PUBLIC_OUTPUT_BUCKET_ID=output-files-prod

NEXT_PUBLIC_API_URL=https://api.yourdomain.com

STIRLING_PDF_URL=https://stirling.yourdomain.com
STIRLING_PDF_API_KEY=prod_api_key

GOTENBERG_URL=https://gotenberg.yourdomain.com
GOTENBERG_USERNAME=prod_username
GOTENBERG_PASSWORD=prod_password
```

## How to Set Environment Variables

### Local Development (Next.js)

1. Create a `.env.local` file in the `web/` directory (same level as `package.json`)
2. Add your environment variables following the format above
3. Restart your development server (`npm run dev`)

```bash
cd web
cp .env.example .env.local
# Edit .env.local with your actual values
npm run dev
```

### Vercel Deployment

1. Go to your project settings in Vercel dashboard
2. Navigate to "Environment Variables"
3. Add each variable with the appropriate values
4. Variables will be automatically loaded when you deploy

### Docker Deployment

1. Create a `.env` file with your environment variables
2. Pass it to Docker during build:

```bash
docker build --build-arg NEXT_PUBLIC_APPWRITE_ENDPOINT=... .
```

Or use environment variables directly when running the container:

```bash
docker run -e NEXT_PUBLIC_APPWRITE_ENDPOINT=... your-image
```

### Traditional Server Deployment

1. Set environment variables in your shell or system configuration
2. For systemd services, add to the service file
3. For PM2, add to `ecosystem.config.js`

## Security Considerations

### Public vs Private Variables

- **`NEXT_PUBLIC_*`**: Exposed to the browser - safe for non-sensitive configuration
- **Non-prefixed variables**: Server-side only - use for sensitive data like API keys

### Sensitive Data

Never commit `.env.local` or `.env` files to version control. Use `.env.example` as a template.

```bash
# Add to .gitignore if not already present
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
```

### API Keys

- Stirling PDF API keys should be treated as secrets
- Rotate keys periodically
- Use environment-specific keys when possible
- Never expose private API keys in client-side code

## Verification

To verify your environment variables are correctly configured:

1. **Development**: Check that pages load without errors in browser console
2. **API Documentation**: Visit `/api-docs` - the base URL should match your `NEXT_PUBLIC_API_URL`
3. **File Operations**: Try uploading and processing a file
4. **API Keys**: Verify API key generation works on the API documentation page

## Troubleshooting

### "Cannot connect to Appwrite"

- Verify `NEXT_PUBLIC_APPWRITE_ENDPOINT` is correct
- Check that Appwrite service is running and accessible
- Verify network connectivity

### "API Documentation shows wrong base URL"

- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- If not set, it should auto-detect from current domain
- Check browser console for errors

### "Stirling PDF operations failing"

- Verify `STIRLING_PDF_URL` is correct
- Confirm `STIRLING_PDF_API_KEY` is valid
- Check that Stirling service is running

### "File upload failing"

- Verify bucket IDs match your Appwrite setup
- Check Appwrite storage permissions
- Verify file size limits are not exceeded

## Examples

### Using getBaseUrl() in Frontend Code

The application provides a `getBaseUrl()` function for dynamically getting the API base URL:

```typescript
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

// Usage in components
const apiUrl = `${getBaseUrl()}/api/premium/url-to-pdf`;
```

### Accessing Config in API Routes

```typescript
import { appwriteConfig, stirlingConfig } from "@/lib/config";

export async function POST(request: Request) {
  // Use appwriteConfig
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  // Use stirlingConfig
  const response = await fetch(`${stirlingConfig.url}/api/v1/...`, {
    headers: {
      "X-API-Key": stirlingConfig.apiKey,
    },
  });
}
```

## References

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Stirling PDF API Documentation](http://localhost:8080/swagger-ui.html)
- [Gotenberg Documentation](https://gotenberg.dev/)
