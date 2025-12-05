/**
 * API Key Allowed Endpoints Configuration
 * Defines which endpoints are available for each tier
 */

// Free tier endpoints - basic PDF operations
const FREE_ENDPOINTS = [
  // File conversion
  "/api/convert",
  "/api/file-to-pdf",
  "/api/img-to-pdf",
  "/api/html-to-pdf",
  "/api/markdown-to-pdf",

  // PDF manipulation
  "/api/merge",
  "/api/split",
  "/api/remove-pages",
  "/api/rotate",
  "/api/crop",
  "/api/flatten",
  "/api/compress",
  "/api/remove-blanks",

  // PDF inspection
  "/api/get-info",
  "/api/metadata",
  "/api/detect-blank-pages",
  "/api/extract-images",

  // Text & OCR
  "/api/pdf-to-text",
  "/api/ocr",

  // PDF security
  "/api/protect",
  "/api/unlock",
  "/api/sanitize",

  // Other basic operations
  "/api/add-text",
  "/api/add-image",
  "/api/add-stamp",
  "/api/watermark",
  "/api/page-numbers",
  "/api/auto-rename",
  "/api/auto-split",
  "/api/contrast",
  "/api/linearize",
  "/api/repair",
  "/api/scanner-effect",
  "/api/show-javascript",
  "/api/sign",
  "/api/multi-page-layout",
  "/api/overlay",
  "/api/url-to-pdf",

  // Format conversion
  "/api/pdf-to-html",
  "/api/pdf-to-markdown",
  "/api/pdf-to-text",
  "/api/pdf-to-csv",
  "/api/pdf-to-xml",
  "/api/pdf-to-word",
];

export const ENDPOINT_CONFIG = {
  free: FREE_ENDPOINTS,

  // Premium tier endpoints - advanced operations (all free + premium-only)
  premium: [
    ...FREE_ENDPOINTS,

    // Premium only operations
    "/api/premium/url-to-pdf",
    "/api/premium/html-to-pdf",
    "/api/premium/markdown-to-pdf",
    "/api/premium/office-to-pdf",
    "/api/premium/encrypt-pdf",
    "/api/premium/flatten-pdf",
    "/api/premium/merge-pdfs",
    "/api/premium/split-pdf",
    "/api/premium/split-pdfs",
    "/api/premium/pdf-to-pdfa",
    "/api/premium/pdf-metadata",
    "/api/premium/screenshots",
  ],
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  free: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 500,
    monthlyLimit: 10000, // 10k requests per month
  },
  premium: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    monthlyLimit: 500000, // 500k requests per month
  },
};

/**
 * Default API key configuration
 */
export const DEFAULT_API_KEY_CONFIG = {
  free: {
    name: "Free Tier API Key",
    dailyLimit: 500,
    allowedEndpoints: ENDPOINT_CONFIG.free,
    maxKeys: 1,
  },
  premium: {
    name: "Premium Tier API Key",
    dailyLimit: 10000,
    allowedEndpoints: ENDPOINT_CONFIG.premium,
    maxKeys: 5,
  },
};
