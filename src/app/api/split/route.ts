import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";
import { ID } from "appwrite";

export async function POST(request: NextRequest) {
  try {
    const { fileId, jobId, splitMode, pageRange } = await request.json();

    if (!fileId || !pageRange) {
      return NextResponse.json({ error: "File ID and page range required" }, { status: 400 });
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
    formData.append("pageNumbers", pageRange); // Stirling PDF uses "pageNumbers" parameter

    // Call Stirling PDF Split API
    console.log("📡 Calling Stirling PDF at:", `${stirlingConfig.url}/api/v1/general/split-pages`);
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/general/split-pages`,
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
      throw new Error(`Stirling PDF split failed: ${stirlingResponse.status} - ${errorText}`);
    }

    // Get the result - could be a single file or ZIP
    const resultBuffer = await stirlingResponse.arrayBuffer();
    const contentType = stirlingResponse.headers.get("content-type") || "application/pdf";
    const contentDisposition = stirlingResponse.headers.get("content-disposition") || "";
    
    console.log("📦 Stirling PDF Response:");
    console.log("  Content-Type:", contentType);
    console.log("  Content-Disposition:", contentDisposition);
    console.log("  Buffer size:", resultBuffer.byteLength, "bytes");
    console.log("  Split mode:", splitMode);
    console.log("  Page range:", pageRange);
    
    // Check if it's a ZIP file by magic bytes (PK = 0x50 0x4B)
    const uint8Array = new Uint8Array(resultBuffer);
    const isZipFile = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B;
    
    console.log("  Is ZIP (magic bytes):", isZipFile);
    console.log("  First 4 bytes:", Array.from(uint8Array.slice(0, 4)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    const files: { url: string; filename: string }[] = [];

    if (isZipFile) {
      // It's a ZIP file with multiple PDFs
      const zipBlob = new Blob([resultBuffer], { type: "application/zip" });
      const outputFile = await storage.createFile(
        appwriteConfig.buckets.output,
        ID.unique(),
        new File([zipBlob], `split_${Date.now()}.zip`, { type: "application/zip" })
      );

      const downloadUrl = storage.getFileDownload(
        appwriteConfig.buckets.output,
        outputFile.$id
      );

      files.push({
        url: downloadUrl.toString(),
        filename: `split_${Date.now()}.zip`
      });
    } else {
      // Single PDF file
      const pdfBlob = new Blob([resultBuffer], { type: "application/pdf" });
      const outputFile = await storage.createFile(
        appwriteConfig.buckets.output,
        ID.unique(),
        new File([pdfBlob], `split_${Date.now()}.pdf`, { type: "application/pdf" })
      );

      const downloadUrl = storage.getFileDownload(
        appwriteConfig.buckets.output,
        outputFile.$id
      );

      files.push({
        url: downloadUrl.toString(),
        filename: `split_${Date.now()}.pdf`
      });
    }

    // Update job as completed
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      jobId,
      {
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error: any) {
    console.error("Split error:", error);

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
      { error: error.message || "Failed to split PDF" },
      { status: 500 }
    );
  }
}
