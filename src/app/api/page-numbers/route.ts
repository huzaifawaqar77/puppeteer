import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  try {
    const { fileId, jobId, customText, position, margin } = await req.json();

    if (!fileId || !jobId) {
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
    formData.append("pageNumbers", "all"); // Required
    formData.append("customMargin", margin || "medium"); // Optional
    formData.append("fontSize", "12"); // Required
    formData.append("fontType", "HELVETICA"); // Required
    formData.append("customText", customText || "{n}"); // Optional
    
    // Map position (1-9 grid)
    let positionInt = "8"; // Default bottom-center
    switch (position) {
      case "TOP_LEFT": positionInt = "1"; break;
      case "TOP_CENTER": positionInt = "2"; break;
      case "TOP_RIGHT": positionInt = "3"; break;
      case "MIDDLE_LEFT": positionInt = "4"; break;
      case "MIDDLE_CENTER": positionInt = "5"; break;
      case "MIDDLE_RIGHT": positionInt = "6"; break;
      case "BOTTOM_LEFT": positionInt = "7"; break;
      case "BOTTOM_CENTER": positionInt = "8"; break;
      case "BOTTOM_RIGHT": positionInt = "9"; break;
    }
    formData.append("position", positionInt); // Required
    formData.append("startingNumber", "1"); // Required

    // 3. Call Stirling PDF API (correct endpoint: /misc/add-page-numbers)
    const stirlingUrl = process.env.STIRLING_PDF_URL;
    const stirlingApiKey = process.env.STIRLING_PDF_API_KEY;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/misc/add-page-numbers`, {
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
      InputFile.fromBuffer(Buffer.from(processedBuffer), "numbered.pdf")
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
      filename: "numbered.pdf",
    });

  } catch (error: any) {
    console.error("Page Numbers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add page numbers" },
      { status: 500 }
    );
  }
}
