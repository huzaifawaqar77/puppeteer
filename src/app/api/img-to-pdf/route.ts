import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  try {
    const { fileIds, jobId, fitOption } = await req.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0 || !jobId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Get files from Appwrite Storage
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

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    fileBuffers.forEach((buffer, index) => {
      const blob = new Blob([buffer]);
      // Stirling PDF expects multiple 'fileInput' fields
      formData.append("fileInput", blob, `image${index}.jpg`);
    });
    formData.append("fitOption", fitOption || "fillPage");
    formData.append("colorType", "color"); // Required parameter
    formData.append("autoRotate", "true");

    // 3. Call Stirling PDF API (correct endpoint: /img/pdf not /img-to-pdf)
    const stirlingUrl = process.env.STIRLING_PDF_URL;
    const stirlingApiKey = process.env.STIRLING_PDF_API_KEY;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/convert/img/pdf`, {
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
      InputFile.fromBuffer(Buffer.from(processedBuffer), "images_converted.pdf")
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
      filename: "images_converted.pdf",
    });

  } catch (error: any) {
    console.error("Image to PDF error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert images to PDF" },
      { status: 500 }
    );
  }
}
