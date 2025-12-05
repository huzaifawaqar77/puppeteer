import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileId = formData.get("fileId") as string;
    const jobId = formData.get("jobId") as string;
    const stampType = formData.get("stampType") as string; // 'text' or 'image'
    const stampText = formData.get("stampText") as string;
    const stampImage = formData.get("stampImage") as File;
    const position = formData.get("position") as string;
    const rotation = formData.get("rotation") as string;
    const opacity = formData.get("opacity") as string;
    const fontSize = formData.get("fontSize") as string;
    const customColor = formData.get("customColor") as string;

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
    const arrayBuffer = await response.arrayBuffer();

    // Prepare form data for Stirling PDF
    const stirlingFormData = new FormData();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    stirlingFormData.append("fileInput", blob, "document.pdf");

    stirlingFormData.append(
      "stampType",
      stampType === "image" ? "Image" : "Text"
    );
    stirlingFormData.append("pageNumbers", "all");
    stirlingFormData.append("position", position); // 1-9
    stirlingFormData.append("rotation", rotation);
    stirlingFormData.append("opacity", opacity);
    stirlingFormData.append("overrideX", "-1");
    stirlingFormData.append("overrideY", "-1");
    stirlingFormData.append("customMargin", "medium");

    if (stampType === "text") {
      stirlingFormData.append("stampText", stampText || "STAMP");
      stirlingFormData.append("fontSize", fontSize || "30");
      stirlingFormData.append("customColor", customColor || "#FF0000");
    } else if (stampType === "image" && stampImage) {
      stirlingFormData.append("stampImage", stampImage);
      stirlingFormData.append("fontSize", "0"); // Not used for image but required by API sometimes
    }

    // Call Stirling PDF API
    const stirlingResponse = await fetch(
      `${stirlingConfig.url}/api/v1/misc/add-stamp`,
      {
        method: "POST",
        headers: {
          "X-API-Key": stirlingConfig.apiKey,
        },
        body: stirlingFormData,
      }
    );

    if (!stirlingResponse.ok) {
      throw new Error(
        `Stirling PDF API failed: ${stirlingResponse.statusText}`
      );
    }

    const processedBlob = await stirlingResponse.blob();
    const processedFile = new File([processedBlob], "stamped.pdf", {
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
      filename: "stamped.pdf",
    });
  } catch (error: any) {
    console.error("Add Stamp error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add stamp" },
      { status: 500 }
    );
  }
}
