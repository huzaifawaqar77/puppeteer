import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "appwrite";
import { appwriteConfig } from "@/lib/config";

/**
 * DELETE /api/user/api-keys/:keyId
 * Revoke/delete an API key (soft delete by setting status to 'revoked')
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
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

    const { keyId } = params;

    if (!keyId || keyId.length === 0) {
      return NextResponse.json({ error: "Invalid key ID" }, { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.APPWRITE_API_KEY) {
      console.error("APPWRITE_API_KEY environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error", details: "Missing APPWRITE_API_KEY" },
        { status: 500 }
      );
    }

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

    // 2. Verify user owns this key
    const key = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      keyId
    );

    if (key.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this key" },
        { status: 403 }
      );
    }

    // 3. Revoke the key (soft delete by changing status)
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      keyId,
      {
        status: "revoked",
        updatedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      message: "API key revoked successfully",
      id: keyId,
    });
  } catch (error) {
    console.error("Delete API Key Error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete API key",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
