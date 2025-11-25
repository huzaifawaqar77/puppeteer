import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  try {
    const { fileId, jobId, watermarkText } = await req.json();

    if (!fileId || !jobId || !watermarkText) {
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
    formData.append("watermarkType", "text"); // Required: text or image
    formData.append("watermarkText", watermarkText); // Correct parameter name
    formData.append("alphabet", "roman");
    formData.append("fontSize", "30");
    formData.append("rotation", "0");
    formData.append("opacity", "0.5");
    formData.append("widthSpacer", "50");
    formData.append("heightSpacer", "50");
    formData.append("customColor", "#000000"); // Required: hex color for watermark
    formData.append("convertPDFToImage", "false"); // Required parameter

    // 3. Call Stirling PDF API (correct endpoint: /security/add-watermark)
    const stirlingUrl = process.env.STIRLING_PDF_URL;
    const stirlingApiKey = process.env.STIRLING_PDF_API_KEY;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/security/add-watermark`, {
      method: "POST",
      headers: {
        "X-API-Key": stirlingApiKey || "",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Stirling PDF watermark error:");
      console.error("  Status:", response.status, response.statusText);
      console.error("  Response:", errorText);
      throw new Error(`Stirling PDF API failed: ${response.status} - ${errorText}`);
    }

    // 4. Upload processed file to Appwrite
    const processedBuffer = await response.arrayBuffer();
    const processedFile = await storage.createFile(
      appwriteConfig.buckets.output,
      ID.unique(),
      InputFile.fromBuffer(Buffer.from(processedBuffer), "watermarked.pdf")
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
      filename: "watermarked.pdf",
    });

  } catch (error: any) {
    console.error("Watermark error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add watermark" },
      { status: 500 }
    );
  }
}
