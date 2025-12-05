import { NextRequest } from "next/server";
import {
  GotenbergClient,
  createErrorResponse,
  createPdfResponse,
} from "@/lib/gotenberg";
import { gotenbergConfig } from "@/lib/config";
import { requirePremiumApiKey } from "@/middleware/require-premium-api-key";

const client = new GotenbergClient(gotenbergConfig);

export async function POST(request: NextRequest) {
  const apiKeyValidation = await requirePremiumApiKey(request);
  if (!apiKeyValidation.valid) {
    return apiKeyValidation.response!;
  }

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return createErrorResponse("PDF file is required", 400);
    }

    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      return createErrorResponse("File must be a PDF", 400);
    }

    const flattenFormData = new FormData();
    flattenFormData.append("files", file);

    const blob = await client.sendRequest(
      "/forms/pdfengines/flatten",
      flattenFormData,
      120000
    );

    const buffer = await blob.arrayBuffer();
    return createPdfResponse(buffer, "flattened.pdf");
  } catch (error: any) {
    console.error("Flatten PDF Error:", error);
    return createErrorResponse(
      error.message || "Failed to flatten PDF",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
