import { NextRequest } from "next/server";
import {
  GotenbergClient,
  appendFormField,
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

interface PdfToPdfARequest {
  pdfa: "PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const pdfa = formData.get("pdfa") as string;

    if (!file) {
      return createErrorResponse("PDF file is required", 400);
    }

    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      return createErrorResponse("File must be a PDF", 400);
    }

    if (!pdfa || !["PDF/A-1b", "PDF/A-2b", "PDF/A-3b"].includes(pdfa)) {
      return createErrorResponse("Valid PDF/A format is required", 400);
    }

    const convertFormData = new FormData();
    convertFormData.append("files", file);
    appendFormField(convertFormData, "pdfa", pdfa);

    const blob = await client.sendRequest(
      "/forms/pdfengines/convert",
      convertFormData,
      120000
    );

    const buffer = await blob.arrayBuffer();
    const outputName = file.name.replace(/\.pdf$/i, `-${pdfa}.pdf`);
    return createPdfResponse(buffer, outputName);
  } catch (error: any) {
    console.error("PDF to PDF/A Error:", error);
    return createErrorResponse(
      error.message || "Failed to convert PDF to PDF/A",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
