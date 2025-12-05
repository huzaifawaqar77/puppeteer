import crypto from "crypto";

// Re-export appwrite config for server-side functions
export { appwriteConfig } from "@/lib/config";

/**
 * Generate a new random API key
 * Format: pk_[32 random uppercase alphanumeric chars]
 */
export function generateApiKey(): string {
  const prefix = process.env.NEXT_PUBLIC_API_KEY_PREFIX || "pk_";
  const random = crypto.randomBytes(24).toString("hex").toUpperCase();
  return `${prefix}${random}`;
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Extract first 8 characters as key prefix for display
 */
export function getKeyPrefix(key: string): string {
  return key.substring(0, 8);
}

/**
 * Mask API key for display (show only prefix and last 4 chars)
 * Example: pk_a1b2c3d4...x9y0z1a2
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return key;
  const prefix = key.substring(0, 8);
  const suffix = key.substring(key.length - 4);
  return `${prefix}...${suffix}`;
}

/**
 * Validate API key format
 * Must start with prefix and contain 32 hex uppercase characters
 */
export function isValidApiKeyFormat(key: string): boolean {
  const prefix = process.env.NEXT_PUBLIC_API_KEY_PREFIX || "pk_";
  const regex = new RegExp(`^${prefix}[A-F0-9]{48}$`);
  return regex.test(key);
}

/**
 * Check if an API key has expired
 */
export function isKeyExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

/**
 * Check if daily limit exceeded
 */
export function isDailyLimitExceeded(
  requestCount: number,
  dailyLimit: number | null | undefined
): boolean {
  if (!dailyLimit) return false;
  return requestCount >= dailyLimit;
}

/**
 * Calculate requests remaining today
 */
export function getRequestsRemaining(
  requestCount: number,
  dailyLimit: number | null | undefined
): number | null {
  if (!dailyLimit) return null;
  return Math.max(0, dailyLimit - requestCount);
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format date to readable format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Check if tier has access to endpoint
 * Premium users can access all endpoints
 * Free users can only access non-premium endpoints
 */
export function canAccessEndpoint(
  tier: "free" | "premium",
  endpoint: string
): boolean {
  if (tier === "premium") return true;

  // Free tier cannot access these premium endpoints
  const premiumEndpoints = [
    "/api/premium/",
    "/api/paid/",
    "/url-to-pdf",
    "/html-to-pdf",
    "/office-conversion",
  ];

  return !premiumEndpoints.some((prefix) => endpoint.startsWith(prefix));
}

/**
 * Calculate expiration date based on days from now
 */
export function calculateExpirationDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Validate API key metadata
 */
export function validateKeyMetadata(data: {
  name?: string;
  description?: string;
  dailyLimit?: number;
  expiresAt?: string;
}): string | null {
  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    return "API key name is required and must be non-empty";
  }

  if (data.name.length > 100) {
    return "API key name must be less than 100 characters";
  }

  if (data.description && data.description.length > 500) {
    return "API key description must be less than 500 characters";
  }

  if (data.dailyLimit !== undefined && data.dailyLimit !== null) {
    if (typeof data.dailyLimit !== "number" || data.dailyLimit < 1) {
      return "Daily limit must be a positive number";
    }
  }

  if (data.expiresAt) {
    const expDate = new Date(data.expiresAt);
    if (isNaN(expDate.getTime())) {
      return "Invalid expiration date format";
    }
    if (expDate <= new Date()) {
      return "Expiration date must be in the future";
    }
  }

  return null;
}

/**
 * Get client IP from request
 */
export function getClientIp(
  request: Request | { headers: Map<string, string> }
): string {
  // Try to get from common headers
  let headers: any;

  if (
    request instanceof Request ||
    (request && typeof request === "object" && "headers" in request)
  ) {
    headers = request.headers;
  } else {
    return "unknown";
  }

  const forwarded = headers.get?.("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get?.("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Validate API key against database
 * Returns key metadata if valid, null otherwise
 */
export async function validateApiKey(plainKey: string): Promise<any> {
  try {
    // Hash the provided key
    const keyHash = hashApiKey(plainKey);

    // Import Appwrite client here to avoid circular dependency
    const { Client, Databases } = await import("node-appwrite");
    const { appwriteConfig } = await import("@/lib/config");

    // Create admin client
    const client = new Client()
      .setEndpoint(
        process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
          "https://appwrite.uiflexer.com/v1"
      )
      .setProject(
        process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68c77b650020a2e5fa47"
      )
      .setKey(process.env.APPWRITE_API_KEY || "");

    if (!process.env.APPWRITE_API_KEY) {
      console.error("APPWRITE_API_KEY not configured");
      return null;
    }

    const databases = new Databases(client);

    // Query for the key hash
    const { Query } = await import("node-appwrite");
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      [Query.equal("keyHash", keyHash)]
    );

    if (!response.documents || response.documents.length === 0) {
      return null;
    }

    const keyDoc = response.documents[0];

    // Parse allowedEndpoints if it's a JSON string
    let allowedEndpoints: string[] = [];
    if (keyDoc.allowedEndpoints) {
      try {
        allowedEndpoints = JSON.parse(keyDoc.allowedEndpoints);
      } catch (e) {
        allowedEndpoints = [];
      }
    }

    return {
      valid: true,
      keyId: keyDoc.$id,
      userId: keyDoc.userId,
      tier: keyDoc.tier,
      status: keyDoc.status,
      expiresAt: keyDoc.expiresAt,
      dailyLimit: keyDoc.dailyLimit,
      monthlyLimit: keyDoc.monthlyLimit,
      allowedEndpoints,
      requestCountToday: keyDoc.requestCountToday || 0,
      message: null,
    };
  } catch (error) {
    console.error("Error validating API key:", error);
    return null;
  }
}

/**
 * Get user's premium API key by user ID
 * Used for frontend app authentication
 */
export async function getUserPremiumApiKey(userId: string): Promise<any> {
  try {
    const { Client, Databases, Query } = await import("node-appwrite");
    const { appwriteConfig } = await import("@/lib/config");

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.uiflexer.com/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68c77b650020a2e5fa47")
      .setKey(process.env.APPWRITE_API_KEY || "");

    if (!process.env.APPWRITE_API_KEY) {
      console.error("APPWRITE_API_KEY not configured");
      return { valid: false };
    }

    const databases = new Databases(client);

    // Query for user's premium API keys that are active
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      [
        Query.equal("userId", userId),
        Query.equal("tier", "premium"),
        Query.equal("status", "active"),
      ]
    );

    if (!response.documents || response.documents.length === 0) {
      return { valid: false };
    }

    const keyDoc = response.documents[0];

    // Parse allowedEndpoints if it's a JSON string
    let allowedEndpoints: string[] = [];
    if (keyDoc.allowedEndpoints) {
      try {
        allowedEndpoints = JSON.parse(keyDoc.allowedEndpoints);
      } catch (e) {
        allowedEndpoints = [];
      }
    }

    return {
      valid: true,
      keyId: keyDoc.$id,
      userId: keyDoc.userId,
      tier: keyDoc.tier,
      status: keyDoc.status,
      expiresAt: keyDoc.expiresAt,
      dailyLimit: keyDoc.dailyLimit,
      monthlyLimit: keyDoc.monthlyLimit,
      allowedEndpoints,
      requestCountToday: keyDoc.requestCountToday || 0,
      message: null,
    };
  } catch (error) {
    console.error("Error getting user premium API key:", error);
    return { valid: false };
  }
}
