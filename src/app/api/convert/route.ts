import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";
import { ID } from "appwrite";

export async function POST(request: NextRequest) {
  try {
    const { fileId, jobId, targetFormat } = await request.json();

    if (!fileId || !targetFormat) {
      return NextResponse.json(
        { error: "File ID and target format required" },
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
    formData.append("imageFormat", targetFormat);
    formData.append("singleOrMultiple", "multiple"); // Get all pages
    formData.append("colorType", "rgb"); // RGB color
    formData.append("dpi", "300"); // High quality

    // Call Stirling PDF Convert API
    console.log(
      "📡 Calling Stirling PDF at:",
      `${stirlingConfig.url}/api/v1/convert/pdf-to-img`
    );
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/convert/pdf/img`,
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
        body: errorText,
      });
      throw new Error(
        `Stirling PDF conversion failed: ${stirlingResponse.status} - ${errorText}`
      );
    }

    // Get the result
    const resultBuffer = await stirlingResponse.arrayBuffer();
    const contentType =
      stirlingResponse.headers.get("content-type") || "application/zip";

    // Result is usually a ZIP file with multiple images
    const extension = contentType.includes("zip") ? "zip" : targetFormat;
    const mimeType = contentType.includes("zip")
      ? "application/zip"
      : `image/${targetFormat}`;

    const resultBlob = new Blob([resultBuffer], { type: mimeType });
    const outputFile = await storage.createFile(
      appwriteConfig.buckets.output,
      ID.unique(),
      new File([resultBlob], `converted_${Date.now()}.${extension}`, {
        type: mimeType,
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
      url: downloadUrl.toString(),
      filename: `converted_${Date.now()}.${extension}`,
    });
  } catch (error: any) {
    console.error("Convert error:", error);

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
      { error: error.message || "Failed to convert file" },
      { status: 500 }
    );
  }
}
