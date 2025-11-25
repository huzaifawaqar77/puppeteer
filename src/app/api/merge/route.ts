import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const { fileIds, jobId } = await request.json();

    if (!fileIds || fileIds.length < 2) {
      return NextResponse.json(
        { error: "At least 2 files required" },
        { status: 400 }
      );
    }

    // Update job status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      jobId,
      { status: "PROCESSING" }
    );

    // Download files from Appwrite Storage
    const fileBuffers: ArrayBuffer[] = [];
    for (const fileId of fileIds) {
      const fileResponse = storage.getFileDownload(
        appwriteConfig.buckets.input,
        fileId
      );
      
      // Fetch the file
      const response = await fetch(fileResponse.toString());
      const arrayBuffer = await response.arrayBuffer();
      fileBuffers.push(arrayBuffer);
    }

    // Prepare multipart form data for Stirling PDF
    const formData = new FormData();
    fileBuffers.forEach((buffer, index) => {
      const blob = new Blob([buffer], { type: "application/pdf" });
      formData.append("fileInput", blob, `file${index}.pdf`);
    });
    
    // Add required parameters from Swagger
    formData.append("sortType", "orderProvided"); // Files in the order provided
    formData.append("removeCertSign", "false"); // Don't remove certification signatures
    formData.append("generateToc", "false"); // Don't generate table of contents

    console.log("📡 Calling Stirling PDF merge with", fileBuffers.length, "files");

    // Call Stirling PDF API (correct endpoint: /general/ not /misc/)
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/general/merge-pdfs`,
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
      console.error("❌ Stirling PDF merge error:");
      console.error("  Status:", stirlingResponse.status, stirlingResponse.statusText);
      console.error("  Response:", errorText);
      throw new Error(`Stirling PDF merge failed: ${stirlingResponse.status} - ${errorText}`);
    }

    // Get the merged PDF
    const mergedPdfBuffer = await stirlingResponse.arrayBuffer();
    const mergedBlob = new Blob([mergedPdfBuffer], {
      type: "application/pdf",
    });

    // Upload result to Appwrite Storage
    const outputFile = await storage.createFile(
      appwriteConfig.buckets.output,
      "unique()",
      new File([mergedBlob], `merged_${Date.now()}.pdf`, {
        type: "application/pdf",
      })
    );

    // Update job as completed
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      jobId,
      {
        status: "COMPLETED",
        outputFileId: outputFile.$id,
        completedAt: new Date().toISOString(),
      }
    );

    // Generate download URL
    const downloadUrl = storage.getFileDownload(
      appwriteConfig.buckets.output,
      outputFile.$id
    );

    return NextResponse.json({
      success: true,
      downloadUrl: downloadUrl.toString(),
      filename: `merged_${Date.now()}.pdf`,
    });
  } catch (error: any) {
    console.error("Merge error:", error);

    // Update job as failed if jobId exists
    const body = await request.json().catch(() => ({}));
    if (body.jobId) {
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.processingJobs,
          body.jobId,
          {
            status: "FAILED",
            errorLog: error.message,
            completedAt: new Date().toISOString(),
          }
        );
      } catch (e) {
        console.error("Failed to update job status:", e);
      }
    }

    return NextResponse.json(
      { error: error.message || "Failed to merge PDFs" },
      { status: 500 }
    );
  }
}
