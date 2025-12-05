import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  try {
    const { pdfId, imageId, jobId, x, y, everyPage } = await req.json();

    if (!pdfId || !imageId || !jobId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Get files from Appwrite Storage
    const pdfUrl = storage.getFileDownload(appwriteConfig.buckets.input, pdfId);
    const imageUrl = storage.getFileDownload(
      appwriteConfig.buckets.input,
      imageId
    );
    const [pdfFetch, imageFetch] = await Promise.all([
      fetch(pdfUrl.toString()),
      fetch(imageUrl.toString()),
    ]);
    const [pdfBuffer, imageBuffer] = await Promise.all([
      pdfFetch.arrayBuffer(),
      imageFetch.arrayBuffer(),
    ]);

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const imageBlob = new Blob([imageBuffer]);
    formData.append("fileInput", pdfBlob, "input.pdf");
    formData.append("imageFile", imageBlob, "image.png");
    formData.append("x", (x ?? 0).toString());
    formData.append("y", (y ?? 0).toString());
    formData.append("everyPage", everyPage ? "true" : "false");

    // 3. Call Stirling PDF API
    const stirlingUrl = stirlingConfig.url;
    const stirlingApiKey = stirlingConfig.apiKey;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/misc/add-image`, {
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
      InputFile.fromBuffer(Buffer.from(processedBuffer), "image_added.pdf")
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
      filename: "image_added.pdf",
    });
  } catch (error: any) {
    console.error("Add Image error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add image to PDF" },
      { status: 500 }
    );
  }
}
