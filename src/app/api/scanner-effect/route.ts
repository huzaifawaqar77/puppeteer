import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const { fileId, jobId, quality = "2", noise = "0.5", blur = "0.5", rotation = "0" } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    // Update job status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      jobId,
      { status: "PROCESSING" }
    );

    // Download file from Appwrite Storage
    const fileResponse = storage.getFileDownload(
      appwriteConfig.buckets.input,
      fileId
    );
    
    // Fetch the file
    const response = await fetch(fileResponse.toString());
    const arrayBuffer = await response.arrayBuffer();

    // Prepare form data for Stirling PDF
    const formData = new FormData();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    formData.append("fileInput", blob, "document.pdf");
    
    // Append scanner effect parameters
    // Note: Stirling PDF API expects strings for these parameters
    formData.append("quality", String(quality)); // 0=Low, 1=Medium, 2=High
    formData.append("noise", String(noise));
    formData.append("blur", String(blur));
    formData.append("rotation", String(rotation));
    
    // Add defaults for other required parameters if needed
    // Based on Swagger: rotation, quality are required. 
    // We are sending them.

    // Call Stirling PDF API
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/misc/scanner-effect`,
      {
        method: "POST",
        headers: {
          "X-API-Key": stirlingConfig.apiKey,
        },
        body: formData,
      }
    );

    if (!stirlingResponse.ok) {
      throw new Error(`Stirling PDF API failed: ${stirlingResponse.statusText}`);
    }

    const processedBlob = await stirlingResponse.blob();
    const processedFile = new File([processedBlob], "scanned_effect.pdf", {
      type: "application/pdf",
    });

    // Upload processed file to Appwrite
    const uploadResponse = await storage.createFile(
      appwriteConfig.buckets.output,
      "unique()",
      processedFile
    );

    // Get download URL
    const downloadUrl = storage.getFileDownload(
      appwriteConfig.buckets.output,
      uploadResponse.$id
    );

    // Update job status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      jobId,
      {
        status: "COMPLETED",
        outputFileId: uploadResponse.$id,
        completedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      url: downloadUrl.toString(),
      filename: "scanned_effect.pdf",
    });
  } catch (error: any) {
    console.error("Scanner Effect error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to apply scanner effect" },
      { status: 500 }
    );
  }
}
