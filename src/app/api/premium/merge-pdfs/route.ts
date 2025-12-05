import { NextRequest } from "next/server";
import {
  GotenbergClient,
  createErrorResponse,
  createPdfResponse,
} from "@/lib/gotenberg";

const gotenbergConfig = {
  url: process.env.GOTENBERG_URL || "https://gotenberg.uiflexer.com",
  username: process.env.GOTENBERG_USERNAME || "Znlz6EqYM09GmcJB",
  password:
    process.env.GOTENBERG_PASSWORD || "l1neT52mJSFRbiopVzEZLz6K0HrB6uqG",
};

const client = new GotenbergClient(gotenbergConfig);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const files = formData.getAll("files") as File[];

    if (!files || files.length < 2) {
      return createErrorResponse("At least 2 PDF files are required", 400);
    }

    // Validate that all files are PDFs
    for (const file of files) {
      if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
        return createErrorResponse(`File ${file.name} is not a PDF`, 400);
      }
    }

    const mergeFormData = new FormData();

    // Add files to FormData
    for (const file of files) {
      mergeFormData.append("files", file);
    }

    const blob = await client.sendRequest(
      "/forms/pdfengines/merge",
      mergeFormData,
      60000
    );

    const buffer = await blob.arrayBuffer();
    return createPdfResponse(buffer, "merged.pdf");
  } catch (error: any) {
    console.error("Merge PDFs Error:", error);
    return createErrorResponse(
      error.message || "Failed to merge PDFs",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
