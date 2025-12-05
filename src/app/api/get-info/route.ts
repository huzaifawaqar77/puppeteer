import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";
import { ID } from "appwrite";

export async function POST(req: NextRequest) {
  try {
    const { fileId, jobId } = await req.json();

    if (!fileId || !jobId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Get file from Appwrite Storage
    const fileUrl = storage.getFileDownload(
      appwriteConfig.buckets.input,
      fileId
    );
    
    const fileDownloadResponse = await fetch(fileUrl.toString());
    const arrayBuffer = await fileDownloadResponse.arrayBuffer();

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    formData.append("fileInput", blob, "input.pdf");

    // 3. Call Stirling PDF API
    const stirlingUrl = stirlingConfig.url;
    const stirlingApiKey = stirlingConfig.apiKey;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/security/get-info-on-pdf`, {
      method: "POST",
      headers: {
        "X-API-Key": stirlingApiKey || "",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stirling PDF Error:", errorText);
      throw new Error(`Stirling PDF API failed: ${response.statusText}`);
    }

    // 4. Parse Response
    const info = await response.json();

    // 5. Update Job Status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      jobId,
      {
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
        // We don't have an output file for this tool, it just returns data
      }
    );

    return NextResponse.json({
      success: true,
      info: info,
    });
  } catch (error: any) {
    console.error("Get Info error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get PDF info" },
      { status: 500 }
    );
  }
}
