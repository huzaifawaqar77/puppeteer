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

    // Call Stirling PDF API
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/misc/show-javascript`,
      {
        method: "POST",
        headers: {
          "X-API-Key": stirlingConfig.apiKey,
        },
        body: formData,
      }
    );

    if (!stirlingResponse.ok) {
      throw new Error(
        `Stirling PDF API failed: ${stirlingResponse.statusText}`
      );
    }

    // The response is likely a JS file or text
    const processedBlob = await stirlingResponse.blob();
    const textContent = await processedBlob.text(); // Get text content for preview

    const processedFile = new File([processedBlob], "extracted_script.js", {
      type: "application/javascript",
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
      filename: "extracted_script.js",
      textContent: textContent, // Return text content for UI display
    });
  } catch (error: any) {
    console.error("Show JavaScript error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract JavaScript" },
      { status: 500 }
    );
  }
}
