import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  try {
    const { fileId, jobId, pages } = await req.json();

    if (!fileId || !jobId || !pages) {
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

    // Fetch the file
    const fileResponse = await fetch(fileUrl.toString());
    const arrayBuffer = await fileResponse.arrayBuffer();

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    const fileBlob = new Blob([arrayBuffer], { type: "application/pdf" });
    formData.append("fileInput", fileBlob, "input.pdf");
    formData.append("pageNumbers", pages);

    // 3. Call Stirling PDF API
    const stirlingUrl = stirlingConfig.url;
    const stirlingApiKey = stirlingConfig.apiKey;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const stirlingResponse = await fetch(
      `${stirlingUrl}/api/v1/general/remove-pages`,
      {
        method: "POST",
        headers: {
          "X-API-Key": stirlingApiKey || "",
        },
        body: formData,
      }
    );

    if (!stirlingResponse.ok) {
      const errorText = await stirlingResponse.text();
      console.error("Stirling PDF Error:", errorText);
      throw new Error(
        `Stirling PDF API failed: ${stirlingResponse.statusText}`
      );
    }

    // 4. Upload processed file to Appwrite
    const processedBuffer = await stirlingResponse.arrayBuffer();
    const processedFile = await storage.createFile(
      appwriteConfig.buckets.output,
      ID.unique(),
      InputFile.fromBuffer(Buffer.from(processedBuffer), "pages_removed.pdf")
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
      filename: "pages_removed.pdf",
    });
  } catch (error: any) {
    console.error("Remove pages error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove pages" },
      { status: 500 }
    );
  }
}
