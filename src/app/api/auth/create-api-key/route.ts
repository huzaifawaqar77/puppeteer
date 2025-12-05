import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, ID } from "node-appwrite";

/**
 * POST /api/auth/create-api-key
 * Creates an API key for a newly registered user in FREE tier
 * This endpoint is called after successful registration
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Initialize Appwrite client with admin API key
    const client = new Client()
      .setEndpoint(
        process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
          "https://appwrite.uiflexer.com/v1"
      )
      .setProject(
        process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68c77b650020a2e5fa47"
      )
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID || "pdf-flex-db";

    // Generate a unique API key
    const apiKey = `pk_live_${generateRandomString(32)}`;

    // Create project document with the API key
    const projectDoc = await databases.createDocument(
      databaseId,
      "projects",
      ID.unique(),
      {
        ownerId: userId,
        name: "Default Project",
        apiKey: apiKey,
        whitelistedDomains: JSON.stringify([]),
        createdAt: new Date().toISOString(),
      }
    );

    // Also create a user document if it doesn't exist
    try {
      await databases.getDocument(databaseId, "users", userId);
    } catch (error: any) {
      if (error.code === 404) {
        // User document doesn't exist, create it
        await databases.createDocument(databaseId, "users", userId, {
          userId: userId,
          planTier: "FREE",
          usageCount: 0,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Log activity
    await databases.createDocument(databaseId, "activityLogs", ID.unique(), {
      userId: userId,
      action: "User registered and API key created",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        apiKey: apiKey,
        message: "API key created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ API Key Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create API key" },
      { status: 500 }
    );
  }
}

/**
 * Generate a random string of specified length
 */
function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
