import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const {
      fileId,
      jobId,
      quality = "2",
      noise = "0.5",
      blur = "0.5",
      rotation = "0",
    } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    // Update job status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.processingJobs,
      jobId,
      { status: "PROCESSING" }
    );

    // Download file from Appwrite Storage
    const fileResponse = storage.getFileDownload(
      appwriteConfig.buckets.input,
      fileId
    );

    // Fetch the file
    const response = await fetch(fileResponse.toString());
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    // Prepare form data for Stirling PDF
    const formData = new FormData();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    formData.append("fileInput", blob, "input.pdf");

    // Append scanner effect parameters
    // Note: Stirling PDF API expects lowercase string values for quality and rotation presets

    // Map quality (0-2)
    // 0=Low, 1=Medium, 2=High
    const qualityMap: Record<string, string> = {
      "0": "low",
      "1": "medium",
      "2": "high",
    };
    const qualityVal = qualityMap[String(quality)] || "high";

    formData.append("quality", qualityVal);

    // Map rotation preset
    // 0=None, 1=Slight, 2=Moderate, 3=Severe
    const rotationMap: Record<string, string> = {
      "0": "none",
      "1": "slight",
      "2": "moderate",
      "3": "severe",
    };
    const rotationVal = rotationMap[String(rotation)] || "none";

    formData.append("rotation", rotationVal);

    // Map colorspace
    // 0=Color, 1=Grayscale, 2=Monochrome
    const colorspaceMap: Record<string, string> = {
      "0": "color",
      "1": "grayscale",
      "2": "monochrome",
    };
    const colorspaceVal = colorspaceMap["0"] || "color";

    formData.append("colorspace", colorspaceVal);

    // Numerical parameters
    formData.append("border", "20");
    formData.append("rotate", "0");
    formData.append("rotateVariance", "2");

    // Convert client-side values (0-1 range) to Stirling API values
    // Client sends noise and blur as 0-1, scale them appropriately
    const blurScaled = (parseFloat(String(blur)) * 10).toString(); // 0-1 -> 0-10
    const noiseScaled = (parseFloat(String(noise)) * 10).toString(); // 0-1 -> 0-10

    formData.append("brightness", "1.0");
    formData.append("contrast", "1.0");
    formData.append("blur", blurScaled);
    formData.append("noise", noiseScaled);
    formData.append("yellowish", "false");
    formData.append("resolution", "300");
    formData.append("advancedEnabled", "true");

    // Call Stirling PDF API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 120 second timeout

    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/misc/scanner-effect`,
      {
        method: "POST",
        headers: {
          "X-API-Key": stirlingConfig.apiKey,
        },
        body: formData,
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!stirlingResponse.ok) {
      const errorText = await stirlingResponse.text();
      console.error("❌ Stirling PDF Scanner Effect error:");
      console.error(
        "  Status:",
        stirlingResponse.status,
        stirlingResponse.statusText
      );
      console.error(
        "  URL:",
        `${stirlingConfig.url}/api/v1/misc/scanner-effect`
      );
      console.error("  Response:", errorText);
      throw new Error(
        `Stirling PDF API failed: ${stirlingResponse.status} - ${errorText}`
      );
    }

    const processedBlob = await stirlingResponse.blob();
    const processedFile = new File([processedBlob], "scanned_effect.pdf", {
      type: "application/pdf",
    });

    // Upload processed file to Appwrite
    const uploadResponse = await storage.createFile(
      appwriteConfig.buckets.output,
      "unique()",
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
      jobId,
      {
        status: "COMPLETED",
        outputFileId: uploadResponse.$id,
        completedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      url: downloadUrl.toString(),
      filename: "scanned_effect.pdf",
    });
  } catch (error: any) {
    console.error("❌ Scanner Effect error:", error);
    console.error("  Error message:", error.message);
    console.error("  Error name:", error.name);

    // Handle specific error types
    let errorMessage = error.message || "Failed to apply scanner effect";
    if (error.name === "AbortError") {
      errorMessage = "Request timeout - processing took too long";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
