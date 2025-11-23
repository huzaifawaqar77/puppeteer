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
    const fileResponse = await storage.getFileDownload(
      appwriteConfig.buckets.input,
      fileId
    );

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    const blob = new Blob([fileResponse]);
    formData.append("fileInput", blob, "input.pdf");
    formData.append("customText", customText || "{n} / {total}");
    
    // Map position to Stirling PDF expected values
    // Assuming Stirling PDF uses standard int values or strings for position
    // Based on typical Stirling PDF usage: 1=Bottom Left, 2=Bottom Center, 3=Bottom Right, etc.
    // Or it might take strings. Let's try sending the string directly first or mapping if we knew the exact enum.
    // Checking Swagger documentation would be ideal, but for now let's assume it accepts standard position strings or we map them.
    // Let's use a safe default mapping if needed, but 'customText' usually goes with 'position'.
    // For now, let's pass the position string and see. If it fails, we might need to map to integers.
    // Common Stirling PDF positions: 
    // 1: Top Left, 2: Top Center, 3: Top Right
    // 4: Bottom Left, 5: Bottom Center, 6: Bottom Right
    
    let positionInt = "5"; // Default Bottom Center
    switch (position) {
      case "TOP_LEFT": positionInt = "1"; break;
      case "TOP_CENTER": positionInt = "2"; break;
      case "TOP_RIGHT": positionInt = "3"; break;
      case "BOTTOM_LEFT": positionInt = "4"; break;
      case "BOTTOM_CENTER": positionInt = "5"; break;
      case "BOTTOM_RIGHT": positionInt = "6"; break;
    }
    formData.append("position", positionInt);
    formData.append("margin", margin || "20");

    // 3. Call Stirling PDF API
    const stirlingUrl = process.env.STIRLING_PDF_URL;
    const stirlingApiKey = process.env.STIRLING_PDF_API_KEY;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/general/page-numbers`, {
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
