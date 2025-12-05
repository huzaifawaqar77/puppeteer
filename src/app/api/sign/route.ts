import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig, stirlingConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

export async function POST(req: NextRequest) {
  try {
    const { fileId, certFileId, jobId, password } = await req.json();

    if (!fileId || !certFileId || !jobId || !password) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Get files from Appwrite Storage
    const pdfUrl = storage.getFileDownload(appwriteConfig.buckets.input, fileId);
    const certUrl = storage.getFileDownload(appwriteConfig.buckets.input, certFileId);
    
    const [pdfResponse, certResponse] = await Promise.all([
      fetch(pdfUrl.toString()),
      fetch(certUrl.toString()),
    ]);

    const [pdfBuffer, certBuffer] = await Promise.all([
      pdfResponse.arrayBuffer(),
      certResponse.arrayBuffer(),
    ]);

    // 2. Create FormData for Stirling PDF
    const formData = new FormData();
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const certBlob = new Blob([certBuffer]);

    formData.append("fileInput", pdfBlob, "input.pdf");
    formData.append("p12File", certBlob, "cert.p12");
    formData.append("password", password);
    formData.append("certType", "PKCS12"); // Required: certificate type
    formData.append("showSignature", "true"); // Required: show signature visually
    formData.append("showLogo", "false"); // Required: don't show logo
    formData.append("pageNumber", "1"); // Page to show signature (required if showSignature=true)
    // Optional parameters for signature metadata
    formData.append("name", "Signed via OmniPDF");
    formData.append("location", "Digital");
    formData.append("reason", "Digital Signature");

    // 3. Call Stirling PDF API
    const stirlingUrl = stirlingConfig.url;
    const stirlingApiKey = stirlingConfig.apiKey;

    if (!stirlingUrl) {
      throw new Error("Stirling PDF URL not configured");
    }

    const response = await fetch(`${stirlingUrl}/api/v1/security/cert-sign`, {
      method: "POST",
      headers: {
        "X-API-Key": stirlingApiKey || "",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Stirling PDF Sign error:");
      console.error("  Status:", response.status, response.statusText);
      console.error("  Response:", errorText);
      console.error("  Sent parameters:");
      console.error("    - fileInput: ✓");
      console.error("    - p12File: ✓");
      console.error("    - password: ✓");
      console.error("    - certType: PKCS12");
      console.error("    - showSignature: true");
      console.error("    - showLogo: false");
      console.error("    - pageNumber: 1");
      throw new Error(`Stirling PDF API failed: ${response.status} - ${errorText}`);
    }

    // 4. Upload processed file to Appwrite
    const processedBuffer = await response.arrayBuffer();
    const processedFile = await storage.createFile(
      appwriteConfig.buckets.output,
      ID.unique(),
      InputFile.fromBuffer(Buffer.from(processedBuffer), "signed.pdf")
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
      filename: "signed.pdf",
    });
  } catch (error: any) {
    console.error("Sign PDF error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign PDF" },
      { status: 500 }
    );
  }
}
