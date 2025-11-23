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
    const fileResponse = await storage.getFileDownload(
      appwriteConfig.buckets.input,
      fileId
    );

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    const blob = new Blob([fileResponse]);
    formData.append("fileInput", blob, "input.pdf");
    formData.append("text", watermarkText);
    formData.append("alphabet", "roman"); // Default
    formData.append("fontSize", "30"); // Default
    formData.append("rotation", "0"); // Default
    formData.append("opacity", "0.5"); // Default
    formData.append("widthSpacer", "50"); // Default
    formData.append("heightSpacer", "50"); // Default

    // 3. Call Stirling PDF API
    const stirlingUrl = process.env.STIRLING_PDF_URL;
    const stirlingApiKey = process.env.STIRLING_PDF_API_KEY;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/general/add-watermark`, {
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
