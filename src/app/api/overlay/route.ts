import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  try {
    const { file1Id, file2Id, jobId } = await req.json();

    if (!file1Id || !file2Id || !jobId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Get files from Appwrite Storage
    const [file1Response, file2Response] = await Promise.all([
      storage.getFileDownload(appwriteConfig.buckets.input, file1Id),
      storage.getFileDownload(appwriteConfig.buckets.input, file2Id),
    ]);

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    const blob1 = new Blob([file1Response]);
    const blob2 = new Blob([file2Response]);
    formData.append("fileInput", blob1, "base.pdf");
    formData.append("overlayFile", blob2, "overlay.pdf");
    formData.append("overlayPosition", "0"); // 0 = Foreground, 1 = Background

    // 3. Call Stirling PDF API
    const stirlingUrl = process.env.STIRLING_PDF_URL;
    const stirlingApiKey = process.env.STIRLING_PDF_API_KEY;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/misc/overlay-pdf`, {
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
      InputFile.fromBuffer(Buffer.from(processedBuffer), "overlay_result.pdf")
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
      filename: "overlay_result.pdf",
    });

  } catch (error: any) {
    console.error("Overlay PDF error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to overlay PDFs" },
      { status: 500 }
    );
  }
}
