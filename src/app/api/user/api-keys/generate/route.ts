import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "appwrite";
import { appwriteConfig } from "@/lib/config";
import { Query } from "appwrite";
import {
  generateApiKey,
  hashApiKey,
  getKeyPrefix,
  isValidApiKeyFormat,
  validateKeyMetadata,
} from "@/lib/api-keys";
import { getClientIp } from "@/middleware/validate-api-key";

interface GenerateKeyRequest {
  name: string;
  description?: string;
  dailyLimit?: number;
  expiresAt?: string;
  tier?: "free" | "premium";
}

/**
 * POST /api/user/api-keys/generate
 * Generate a new API key for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const userId = authHeader.replace("Bearer ", "").trim();

    if (!userId || userId.length === 0) {
      return NextResponse.json(
        { error: "Invalid user ID in Authorization header" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    let body: GenerateKeyRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate metadata
    const validationError = validateKeyMetadata(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 4. Determine user tier (from request body or default to free)
    const userTier = body.tier || "free";

    // Check if API key is configured
    if (!process.env.APPWRITE_API_KEY) {
      console.error("APPWRITE_API_KEY environment variable not set");
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Missing APPWRITE_API_KEY",
        },
        { status: 500 }
      );
    }

    // 5. Check if user already has max keys for their tier
    const maxKeys =
      userTier === "premium"
        ? parseInt(process.env.PREMIUM_TIER_KEY_LIMIT || "5")
        : parseInt(process.env.FREE_TIER_KEY_LIMIT || "1");

    // Create admin client for server-side access
    const adminClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    // Use the API key for authentication
    adminClient.headers = {
      ...adminClient.headers,
      "X-Appwrite-Key": process.env.APPWRITE_API_KEY,
    };

    const databases = new Databases(adminClient);

    const existingKeys = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      [
        Query.equal("userId", userId),
        Query.notEqual("status", "revoked"),
        Query.notEqual("status", "expired"),
      ]
    );

    if (existingKeys.documents.length >= maxKeys) {
      return NextResponse.json(
        {
          error: `Maximum ${maxKeys} API key(s) allowed for your tier`,
          tier: userTier,
          maxKeys,
          currentKeys: existingKeys.documents.length,
        },
        { status: 429 }
      );
    }

    // 6. Generate new API key
    const plainKey = generateApiKey();
    const keyHash = hashApiKey(plainKey);
    const keyPrefix = getKeyPrefix(plainKey);

    // Validate format
    if (!isValidApiKeyFormat(plainKey)) {
      console.error("Failed to generate valid API key format");
      return NextResponse.json(
        { error: "Failed to generate valid API key" },
        { status: 500 }
      );
    }

    // 7. Create document in database
    const now = new Date().toISOString();
    let expiresAt = null;

    if (process.env.ENABLE_API_KEY_EXPIRATION === "true") {
      const expirationDays = parseInt(
        process.env.API_KEY_EXPIRATION_DAYS || "365"
      );
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);
      expiresAt = expirationDate.toISOString();
    }

    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      "unique()",
      {
        userId,
        keyHash,
        keyPrefix,
        name: body.name,
        description: body.description || "",
        tier: userTier,
        status: "active",
        requestCount: 0,
        dailyLimit: body.dailyLimit || null,
        monthlyLimit: null,
        allowedEndpoints: JSON.stringify([]),
        allowedOrigins: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
        createdFromIP: getClientIp(request),
        expiresAt: body.expiresAt || expiresAt,
      }
    );

    // 8. Return response (full key shown ONLY once!)
    return NextResponse.json(
      {
        id: response.$id,
        key: plainKey,
        keyPrefix: keyPrefix,
        name: body.name,
        tier: userTier,
        createdAt: response.createdAt,
        expiresAt: response.expiresAt || null,
        message:
          "Save this key somewhere safe. You won't be able to see it again!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Key Generation Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate API key",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
