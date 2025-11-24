import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const { fileId, jobId, useFirstTextAsFallback = false } = await request.json();

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
    formData.append("useFirstTextAsFallback", String(useFirstTextAsFallback));

    // Call Stirling PDF API
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/misc/auto-rename`,
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

    // The response is a PDF file, but the key part is the filename in the Content-Disposition header
    // However, Stirling PDF returns the file content. We need to check if it returns the new filename in headers.
    // Based on Swagger: "Extract header from PDF file... Input:PDF Output:PDF"
    // It seems it returns the PDF, possibly with metadata updated? Or maybe the filename is in the header.
    
    const contentDisposition = stirlingResponse.headers.get("Content-Disposition");
    let newFilename = "renamed.pdf";
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        newFilename = filenameMatch[1];
      }
    }

    const processedBlob = await stirlingResponse.blob();
    const processedFile = new File([processedBlob], newFilename, {
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
      filename: newFilename,
    });
  } catch (error: any) {
    console.error("Auto Rename error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to auto-rename PDF" },
      { status: 500 }
    );
  }
}
