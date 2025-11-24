import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  try {
    const { fileId, jobId, angle } = await req.json();

    if (!fileId || !jobId || !angle) {
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
    
    // Fetch the actual file content from the URL
    const fileDownloadResponse = await fetch(fileUrl.toString());
    const arrayBuffer = await fileDownloadResponse.arrayBuffer();

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    formData.append("fileInput", blob, "input.pdf");
    formData.append("angle", angle.toString());

    // 3. Call Stirling PDF API
    const stirlingUrl = process.env.STIRLING_PDF_URL;
    const stirlingApiKey = process.env.STIRLING_PDF_API_KEY;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    console.log("Calling Stirling PDF API:");
    console.log("  URL:", `${stirlingUrl}/api/v1/general/rotate-pdf`);
    console.log("  File size:", blob.size, "bytes");
    console.log("  Angle:", angle);
    console.log("  API Key present:", !!stirlingApiKey);

    const response = await fetch(`${stirlingUrl}/api/v1/general/rotate-pdf`, {
      method: "POST",
      headers: {
        "X-API-Key": stirlingApiKey || "",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stirling PDF Error Details:");
      console.error("  Status:", response.status, response.statusText);
      console.error("  URL:", `${stirlingUrl}/api/v1/general/rotate-pdf`);
      console.error("  Response:", errorText);
      throw new Error(`Stirling PDF API failed: ${response.statusText} - ${errorText}`);
    }

    // 4. Upload processed file to Appwrite
    const processedBuffer = await response.arrayBuffer();
    const processedFile = await storage.createFile(
      appwriteConfig.buckets.output,
      ID.unique(),
      InputFile.fromBuffer(Buffer.from(processedBuffer), "rotated.pdf")
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
    const downloadUrl = storage.getFileDownload(
      appwriteConfig.buckets.output,
      processedFile.$id
    );

    return NextResponse.json({
      success: true,
      url: downloadUrl.toString(),
      filename: "rotated.pdf",
    });

  } catch (error: any) {
    console.error("Rotate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rotate PDF" },
      { status: 500 }
    );
  }
}
