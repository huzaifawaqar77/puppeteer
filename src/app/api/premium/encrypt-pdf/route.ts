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

interface EncryptPdfRequest {
  userPassword: string;
  ownerPassword?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const userPassword = formData.get("userPassword") as string;
    const ownerPassword = formData.get("ownerPassword") as string;

    if (!file) {
      return createErrorResponse("PDF file is required", 400);
    }

    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      return createErrorResponse("File must be a PDF", 400);
    }

    if (!userPassword) {
      return createErrorResponse("User password is required", 400);
    }

    const encryptFormData = new FormData();
    encryptFormData.append("files", file);
    appendFormField(encryptFormData, "userPassword", userPassword);
    appendFormField(encryptFormData, "ownerPassword", ownerPassword);

    const blob = await client.sendRequest(
      "/forms/pdfengines/encrypt",
      encryptFormData,
      120000
    );

    const buffer = await blob.arrayBuffer();
    return createPdfResponse(buffer, "encrypted.pdf");
  } catch (error: any) {
    console.error("Encrypt PDF Error:", error);
    return createErrorResponse(
      error.message || "Failed to encrypt PDF",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
