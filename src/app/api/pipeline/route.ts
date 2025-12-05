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
    const pipelineName = formData.get("pipelineName") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Files are required" }, { status: 400 });
    }

    if (!jsonString) {
      return NextResponse.json({ error: "Pipeline configuration (JSON) is required" }, { status: 400 });
    }

    // Parse the pipeline steps from frontend
    let pipelineSteps;
    try {
      pipelineSteps = JSON.parse(jsonString);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON format in pipeline configuration" }, { status: 400 });
    }

    if (!Array.isArray(pipelineSteps) || pipelineSteps.length === 0) {
      return NextResponse.json({ error: "Pipeline must contain at least one operation" }, { status: 400 });
    }

    // Create a job record
    const job = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      ID.unique(),
      {
        userId: userId || "anonymous",
        operationType: "PIPELINE",
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

    // ✅ CONSTRUCT CORRECT JSON FORMAT FOR STIRLING
    // Stirling expects: { name, pipeline: [...], outputDir, outputFileName }
    const stirlingPipelineConfig = {
      name: pipelineName || "Custom Pipeline",
      pipeline: pipelineSteps,  // Array of { operation, parameters }
      outputDir: "{outputFolder}",
      outputFileName: "{filename}-processed"
    };

    // Prepare FormData for Stirling PDF
    const stirlingFormData = new FormData();
    files.forEach((file) => {
      stirlingFormData.append("fileInput", file);
    });
    // ✅ Send the correctly formatted JSON
    stirlingFormData.append("json", JSON.stringify(stirlingPipelineConfig));

    console.log("📡 Calling Stirling Pipeline with config:", stirlingPipelineConfig);
    console.log("   Files:", files.length, "Operations:", pipelineSteps.length);

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
      console.error("❌ Stirling Pipeline Error:", stirlingResponse.status, errorText);
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

    console.log("✅ Pipeline completed successfully");

    return NextResponse.json({
      url: downloadUrl.toString(),
      filename: `pipeline_result.${extension}`,
    });

  } catch (error: any) {
    console.error("❌ Pipeline error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute pipeline" },
      { status: 500 }
    );
  }
}
