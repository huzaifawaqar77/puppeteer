import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const { fileId, jobId, compressionLevel = 1 } = await request.json();

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
    formData.append("optimizeLevel", String(compressionLevel));

    // Call Stirling PDF Compress API
    console.log("📡 Calling Stirling PDF at:", `${stirlingConfig.url}/api/v1/misc/compress-pdf`);
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/misc/compress-pdf`,
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
      console.error("❌ Stirling PDF error:", {
        status: stirlingResponse.status,
        statusText: stirlingResponse.statusText,
        body: errorText
      });
      throw new Error(`Stirling PDF compression failed: ${stirlingResponse.status} - ${errorText}`);
    }

    // Get the compressed PDF
    const compressedPdfBuffer = await stirlingResponse.arrayBuffer();
    const compressedBlob = new Blob([compressedPdfBuffer], {
      type: "application/pdf",
    });

    // Upload result to Appwrite Storage
    const outputFile = await storage.createFile(
      appwriteConfig.buckets.output,
      "unique()",
      new File([compressedBlob], `compressed_${Date.now()}.pdf`, {
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
      filename: `compressed_${Date.now()}.pdf`,
      size: compressedBlob.size,
    });
  } catch (error: any) {
    console.error("Compress error:", error);

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
      { error: error.message || "Failed to compress PDF" },
      { status: 500 }
    );
  }
}
