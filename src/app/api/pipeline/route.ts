import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";
import { ID } from "appwrite";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const jsonString = formData.get("json") as string;
    const userId = formData.get("userId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Files are required" }, { status: 400 });
    }

    if (!jsonString) {
      return NextResponse.json({ error: "Pipeline configuration (JSON) is required" }, { status: 400 });
    }

    // Create a job record
    const job = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      ID.unique(),
      {
        userId: userId || "anonymous",
        operationType: "MERGE",
        status: "PROCESSING",
        startedAt: new Date().toISOString(),
        inputFileIds: "[]",
      }
    );

    // Upload input files to Appwrite (optional, but good for history)
    const inputFileIds = [];
    for (const file of files) {
      const uploaded = await storage.createFile(
        appwriteConfig.buckets.input,
        ID.unique(),
        file
      );
      inputFileIds.push(uploaded.$id);
    }

    // Update job with input files
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      job.$id,
      {
        inputFileIds: JSON.stringify(inputFileIds),
      }
    );

    // Prepare FormData for Stirling PDF
    const stirlingFormData = new FormData();
    files.forEach((file) => {
      stirlingFormData.append("fileInput", file);
    });
    stirlingFormData.append("json", jsonString);

    // Call Stirling PDF API
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/pipeline/handleData`,
      {
        method: "POST",
        headers: {
          "X-API-Key": stirlingConfig.apiKey,
        },
        body: stirlingFormData,
      }
    );

    if (!stirlingResponse.ok) {
      const errorText = await stirlingResponse.text();
      throw new Error(`Stirling PDF API failed: ${stirlingResponse.status} - ${errorText}`);
    }

    // Handle Response
    const processedBlob = await stirlingResponse.blob();
    const contentType = stirlingResponse.headers.get("content-type") || "application/pdf";
    
    // Determine filename extension based on content type
    let extension = "pdf";
    if (contentType.includes("zip")) extension = "zip";
    
    const processedFile = new File([processedBlob], `pipeline_result.${extension}`, {
      type: contentType,
    });

    // Upload processed file to Appwrite
    const uploadResponse = await storage.createFile(
      appwriteConfig.buckets.output,
      ID.unique(),
      processedFile
    );

    // Get download URL
    const downloadUrl = storage.getFileDownload(
      appwriteConfig.buckets.output,
      uploadResponse.$id
    );

    // Update job status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      job.$id,
      {
        status: "COMPLETED",
        outputFileId: uploadResponse.$id,
        completedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      url: downloadUrl.toString(),
      filename: `pipeline_result.${extension}`,
    });

  } catch (error: any) {
    console.error("Pipeline error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute pipeline" },
      { status: 500 }
    );
  }
}
