import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

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
    // Linearize parameters (using compress-pdf endpoint)
    formData.append("optimizeLevel", "0"); // No compression
    formData.append("expectedOutputSize", ""); // Keep original size
    formData.append("linearize", "true"); // Enable linearization (fast web view)
    formData.append("normalize", "false");
    formData.append("grayscale", "false");

    // 3. Call Stirling PDF API
    const stirlingUrl = stirlingConfig.url;
    const stirlingApiKey = stirlingConfig.apiKey;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/misc/compress-pdf`, {
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

    // 4. Upload processed file to Appwrite
    const processedBuffer = await response.arrayBuffer();
    const processedFile = await storage.createFile(
      appwriteConfig.buckets.output,
      ID.unique(),
      InputFile.fromBuffer(Buffer.from(processedBuffer), "linearized.pdf")
    );

    // 5. Update Job Status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      jobId,
      {
        status: "COMPLETED",
        outputFileId: processedFile.$id,
        completedAt: new Date().toISOString(),
      }
    );

    // 6. Get Download URL
    const downloadUrl = await storage.getFileDownload(
      appwriteConfig.buckets.output,
      processedFile.$id
    );

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      filename: "linearized.pdf",
    });
  } catch (error: any) {
    console.error("Linearize error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to linearize PDF" },
      { status: 500 }
    );
  }
}
