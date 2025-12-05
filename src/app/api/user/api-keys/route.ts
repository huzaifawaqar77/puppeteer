import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "appwrite";
import { appwriteConfig } from "@/lib/config";
import { Query } from "appwrite";

/**
 * GET /api/user/api-keys
 * List all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // 2. Create an admin Appwrite client for server-side access
    const adminClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    // Use the API key for authentication
    adminClient.headers = {
      ...adminClient.headers,
      "X-Appwrite-Key": process.env.APPWRITE_API_KEY,
    };

    const databases = new Databases(adminClient);

    // 3. Get all keys for this user, ordered by newest first
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      [Query.equal("userId", userId), Query.orderDesc("createdAt")]
    );

    // 4. Format response (never include keyHash!)
    const keys = response.documents.map((key: any) => ({
      id: key.$id,
      keyPrefix: key.keyPrefix,
      name: key.name,
      description: key.description || "",
      tier: key.tier,
      status: key.status,
      requestCount: key.requestCount,
      lastUsedAt: key.lastUsedAt || null,
      dailyLimit: key.dailyLimit || null,
      monthlyLimit: key.monthlyLimit || null,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt || null,
    }));

    return NextResponse.json({
      keys,
      total: response.total,
    });
  } catch (error) {
    console.error("List API Keys Error:", error);
    return NextResponse.json(
      {
        error: "Failed to list API keys",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
