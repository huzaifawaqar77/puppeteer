import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const { fileId, jobId } = await request.json();

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
    const fileUrl = storage.getFileDownload(
      appwriteConfig.buckets.input,
      fileId
    );
    
    // Get file metadata to preserve original filename and extension
    const fileMetadata = await storage.getFile(
      appwriteConfig.buckets.input,
      fileId
    );
    
    // Fetch the file
    const response = await fetch(fileUrl.toString());
    const arrayBuffer = await response.arrayBuffer();

    // Prepare form data for Stirling PDF
    const formData = new FormData();
    // IMPORTANT: Preserve original filename with extension so Stirling knows the file type
    const blob = new Blob([arrayBuffer]);
    formData.append("fileInput", blob, fileMetadata.name); 

    // Call Stirling PDF API
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/convert/file/pdf`,
      {
        method: "POST",
        headers: {
          "X-API-Key": stirlingConfig.apiKey,
        },
        body: formData,
      }
    );

    if (!stirlingResponse.ok) {
      const errorText = await stirlingResponse.text();
      console.error("❌ Stirling PDF file-to-pdf error:");
      console.error("  Status:", stirlingResponse.status, stirlingResponse.statusText);
      console.error("  Response:", errorText);
      throw new Error(`Stirling PDF API failed: ${stirlingResponse.status} - ${errorText}`);
    }

    const processedBlob = await stirlingResponse.blob();
    const processedFile = new File([processedBlob], "converted.pdf", {
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
      filename: "converted.pdf",
    });
  } catch (error: any) {
    console.error("File to PDF error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert file to PDF" },
      { status: 500 }
    );
  }
}
