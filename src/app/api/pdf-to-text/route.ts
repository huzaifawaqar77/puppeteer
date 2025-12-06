import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { fileId, jobId, outputFormat, aiPrompt } = await req.json();

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
    const buffer = Buffer.from(arrayBuffer);

    let processedBuffer: Buffer;
    let extension = outputFormat === "html" ? "html" : "txt";

    if (aiPrompt) {
      // --- AI PROCESSING PATH ---
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      // Save to temp file
      const tempFilePath = join(tmpdir(), `input-${ID.unique()}.pdf`);
      await writeFile(tempFilePath, buffer);

      try {
        const scriptPath = join(
          process.cwd(),
          "scripts",
          "process_pdf_with_gemini.py"
        );

        // Escape quotes in prompt to avoid shell issues (basic sanitization)
        const safePrompt = aiPrompt.replace(/"/g, '\\"');

        // Execute Python script
        // Note: In Docker, python3 is used. Locally might be python.
        const pythonCommand =
          process.platform === "win32" ? "python" : "python3";
        const { stdout, stderr } = await execAsync(
          `${pythonCommand} "${scriptPath}" "${tempFilePath}" "${safePrompt}" "${geminiApiKey}"`
        );

        if (stderr && stderr.trim().length > 0) {
          console.warn("Python script stderr:", stderr);
        }

        processedBuffer = Buffer.from(stdout);
        extension = "json"; // AI output is usually JSON/Text
      } finally {
        // Cleanup temp file
        await unlink(tempFilePath).catch(() => {});
      }
    } else {
      // --- STANDARD STIRLING PDF PATH ---
      const formData = new FormData();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      formData.append("fileInput", blob, "input.pdf");
      formData.append("outputFormat", outputFormat || "txt");

      const stirlingUrl = process.env.STIRLING_PDF_URL;
      const stirlingApiKey = process.env.STIRLING_PDF_API_KEY;

      if (!stirlingUrl) {
        throw new Error("Stirling PDF URL not configured");
      }

      const response = await fetch(`${stirlingUrl}/api/v1/convert/pdf/text`, {
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

      const ab = await response.arrayBuffer();
      processedBuffer = Buffer.from(ab);
    }

    // 4. Upload processed file to Appwrite
    const processedFile = await storage.createFile(
      appwriteConfig.buckets.output,
      ID.unique(),
      InputFile.fromBuffer(processedBuffer, `converted.${extension}`)
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
      filename: `converted.${extension}`,
    });
  } catch (error: any) {
    console.error("PDF to Text error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert PDF to text" },
      { status: 500 }
    );
  }
}
