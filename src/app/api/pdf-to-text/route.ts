import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";
import { GoogleGenerativeAI } from "@google/generative-ai";
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ 
    data, 
    useSystemFonts: true,
    disableFontFace: true 
  });
  
  const pdfDocument = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText;
}

function chunkText(text: string, chunkSize: number = 30000): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  const sentences = text.split('. ');

  for (const sentence of sentences) {
    if ((currentChunk.length + sentence.length) < chunkSize) {
      currentChunk += sentence + ". ";
    } else {
      chunks.push(currentChunk);
      currentChunk = sentence + ". ";
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

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
      // --- AI PROCESSING PATH (Node.js) ---
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      // 1. Extract Text
      const text = await extractTextFromPdf(buffer);

      // 2. Chunk Text
      const chunks = chunkText(text);

      // 3. Process with Gemini
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const results = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const prompt = `
          You are a helpful assistant that extracts information from text.
          
          USER INSTRUCTION: ${aiPrompt}
          
          DATA TO PROCESS (Chunk ${i + 1}/${chunks.length}):
          ${chunk}
          
          OUTPUT FORMAT:
          Please provide the output in valid JSON format. 
          If the user asked for a list, return a JSON object with a key "items" containing the list.
          Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.
        `;

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          results.push(response.text());
        } catch (e: any) {
          console.error(`Error processing chunk ${i}:`, e);
          results.push(JSON.stringify({ error: e.message }));
        }
      }

      // 4. Merge Results (Simple merge)
      let mergedOutput = "";
      try {
        // Try to parse and merge if they are JSON arrays
        const allItems: any[] = [];
        let isArrayMerge = true;

        for (const res of results) {
          try {
            const parsed = JSON.parse(res);
            if (parsed.items && Array.isArray(parsed.items)) {
              allItems.push(...parsed.items);
            } else if (Array.isArray(parsed)) {
              allItems.push(...parsed);
            } else {
              isArrayMerge = false;
            }
          } catch {
            isArrayMerge = false;
          }
        }

        if (isArrayMerge && allItems.length > 0) {
          mergedOutput = JSON.stringify(allItems, null, 2);
        } else {
          mergedOutput = results.join("\n\n");
        }
      } catch {
        mergedOutput = results.join("\n\n");
      }

      processedBuffer = Buffer.from(mergedOutput);
      extension = "json";

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
