# API Documentation

Complete API reference for the PDF Generation SaaS platform.

## Base URL

```
Development: http://localhost:3000
Production: https://pdf.yourdomain.com
```

## Authentication

The API uses two authentication methods:

1. **JWT Tokens** - For user account management endpoints
2. **API Keys** - For PDF generation endpoints

### JWT Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Key Authentication

Include the API key in the X-API-Key header:

```
X-API-Key: <your_api_key>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Endpoints

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Validation:**
- Email must be valid and unique
- Password minimum 8 characters
- Full name is required

---

#### GET /api/auth/verify-email

Verify user email address.

**Query Parameters:**
- `token` (required) - Verification token from email

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! Check your email for your API key.",
  "data": {
    "email": "user@example.com"
  }
}
```

---

#### POST /api/auth/login

Login to get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "is_verified": true,
      "role": "user"
    }
  }
}
```

---

#### POST /api/auth/forgot-password

Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent."
}
```

---

#### POST /api/auth/reset-password

Reset password with token.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful! You can now login with your new password."
}
```

---

#### GET /api/auth/profile

Get current user profile and subscription info.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "subscription": {
      "id": 1,
      "plan_name": "Professional",
      "plan_slug": "professional",
      "monthly_conversions": 1000,
      "price": "29.99",
      "status": "active",
      "current_period_end": "2024-02-01T00:00:00.000Z"
    },
    "api_keys": [
      {
        "id": 1,
        "api_key": "sk_abc123...",
        "name": "Default API Key",
        "is_active": true,
        "last_used_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "usage": {
      "current_month": "2024-01",
      "conversions_used": 45,
      "conversions_limit": 1000
    }
  }
}
```

---

### PDF Generation

#### POST /api/pdf/generate

Generate PDF from HTML content.

**Headers:**
```
X-API-Key: <your_api_key>
Content-Type: application/json
```

**Request:**
```json
{
  "html": "<html><body><h1>Hello World</h1></body></html>",
  "options": {
    "format": "A4",
    "printBackground": true,
    "margin": {
      "top": "20px",
      "right": "20px",
      "bottom": "20px",
      "left": "20px"
    }
  }
}
```

**Options (all optional):**
- `format`: Paper format (A4, Letter, Legal, etc.)
- `printBackground`: Include background graphics (default: true)
- `margin`: Page margins
- `landscape`: Landscape orientation (default: false)
- `scale`: Scale of webpage rendering (default: 1)
- `displayHeaderFooter`: Display header/footer (default: false)
- `headerTemplate`: HTML template for header
- `footerTemplate`: HTML template for footer

**Response:**
Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=generated.pdf
```

**Error Response:**
```json
{
  "success": false,
  "message": "Monthly conversion limit reached (1000). Please upgrade your plan.",
  "usage": {
    "current": 1000,
    "limit": 1000
  }
}
```

---

#### POST /api/pdf/generate-from-url

Generate PDF from a URL.

**Headers:**
```
X-API-Key: <your_api_key>
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://example.com",
  "options": {
    "format": "A4",
    "printBackground": true
  }
}
```

**Response:**
Binary PDF file

---

### Subscriptions

#### GET /api/subscription/plans

Get all available subscription plans.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Trial",
      "slug": "trial",
      "description": "Free trial plan with limited conversions",
      "monthly_conversions": 10,
      "price": "0.00",
      "features": [
        "10 PDF conversions per month",
        "Basic support",
        "Standard quality"
      ]
    },
    {
      "id": 2,
      "name": "Starter",
      "slug": "starter",
      "description": "Perfect for individuals and small projects",
      "monthly_conversions": 100,
      "price": "9.99",
      "features": [
        "100 PDF conversions per month",
        "Email support",
        "High quality output",
        "API access"
      ]
    }
  ]
}
```

---

#### GET /api/subscription/current

Get current user's subscription.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "plan_name": "Professional",
      "plan_slug": "professional",
      "monthly_conversions": 1000,
      "price": "29.99",
      "status": "active",
      "payment_status": "paid",
      "current_period_start": "2024-01-01T00:00:00.000Z",
      "current_period_end": "2024-02-01T00:00:00.000Z"
    },
    "usage": {
      "current_month": "2024-01",
      "conversions_used": 45,
      "conversions_limit": 1000,
      "percentage_used": 5
    }
  }
}
```

---

#### POST /api/subscription/change-plan

Change subscription plan.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "plan_slug": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully upgraded to Professional plan!",
  "data": {
    "subscription_id": 2,
    "plan": {
      "id": 3,
      "name": "Professional",
      "slug": "professional",
      "monthly_conversions": 1000,
      "price": "29.99"
    },
    "payment_required": true
  }
}
```

---

#### GET /api/subscription/usage-stats

Get usage statistics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `months` (optional) - Number of months to retrieve (default: 6)

**Response:**
```json
{
  "success": true,
  "data": {
    "monthly_usage": [
      {
        "usage_month": "2024-01",
        "usage_count": 45,
        "endpoint": "/api/pdf/generate"
      },
      {
        "usage_month": "2023-12",
        "usage_count": 89,
        "endpoint": "/api/pdf/generate"
      }
    ],
    "total_conversions": 134
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions or quota exceeded |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Configurable** via environment variables

When rate limited:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Code Examples

### cURL

```bash
# Generate PDF
curl -X POST https://pdf.yourdomain.com/api/pdf/generate \
  -H "X-API-Key: sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Hello</h1>"}' \
  --output output.pdf
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');
const fs = require('fs');

async function generatePDF() {
  const response = await axios.post(
    'https://pdf.yourdomain.com/api/pdf/generate',
    {
      html: '<h1>Hello World</h1>',
      options: { format: 'A4' }
    },
    {
      headers: {
        'X-API-Key': 'sk_your_api_key',
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    }
  );
  
  fs.writeFileSync('output.pdf', response.data);
}
```

### Python

```python
import requests

response = requests.post(
    'https://pdf.yourdomain.com/api/pdf/generate',
    headers={'X-API-Key': 'sk_your_api_key'},
    json={
        'html': '<h1>Hello World</h1>',
        'options': {'format': 'A4'}
    }
)

with open('output.pdf', 'wb') as f:
    f.write(response.content)
```

---

For support, contact: no-reply@uiflexer.com

