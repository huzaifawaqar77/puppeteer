import { NextRequest } from "next/server";
import {
  GotenbergClient,
  appendFormField,
  createErrorResponse,
  createPdfResponse,
  createJsonResponse,
} from "@/lib/gotenberg";
import { gotenbergConfig } from "@/lib/config";
import { requirePremiumApiKey } from "@/middleware/require-premium-api-key";

const client = new GotenbergClient(gotenbergConfig);

interface MetadataRequest {
  action: "read" | "write";
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  const apiKeyValidation = await requirePremiumApiKey(request);
  if (!apiKeyValidation.valid) {
    return apiKeyValidation.response!;
  }

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const action = formData.get("action") as string;

    if (!file) {
      return createErrorResponse("PDF file is required", 400);
    }

    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      return createErrorResponse("File must be a PDF", 400);
    }

    if (action === "read") {
      // Read metadata
      const readFormData = new FormData();
      readFormData.append("files", file);

      const result = await client.sendJsonRequest(
        "/forms/pdfengines/metadata/read",
        readFormData,
        120000
      );

      return createJsonResponse(result);
    } else if (action === "write") {
      // Write metadata
      const metadata = formData.get("metadata") as string;

      if (!metadata) {
        return createErrorResponse(
          "Metadata is required for write action",
          400
        );
      }

      let metadataObject: Record<string, string> = {};
      try {
        metadataObject = JSON.parse(metadata);
      } catch (e) {
        return createErrorResponse("Invalid metadata JSON", 400);
      }

      const writeFormData = new FormData();
      writeFormData.append("file", file);

      // Filter out empty metadata values
      const nonEmptyMetadata: Record<string, string> = {};
      for (const [key, value] of Object.entries(metadataObject)) {
        if (value && String(value).trim()) {
          nonEmptyMetadata[key] = String(value);
        }
      }

      // Add metadata as a JSON string field - Gotenberg requires this format
      writeFormData.append("metadata", JSON.stringify(nonEmptyMetadata));

      const blob = await client.sendRequest(
        "/forms/pdfengines/metadata/write",
        writeFormData,
        120000
      );

      const buffer = await blob.arrayBuffer();
      const outputName = file.name.replace(/\.pdf$/i, "-metadata.pdf");

      const response = new Response(buffer);
      response.headers.set("Content-Type", "application/pdf");
      response.headers.set(
        "Content-Disposition",
        `attachment; filename="${outputName}"`
      );
      return response;
    } else {
      return createErrorResponse("Invalid action. Use 'read' or 'write'", 400);
    }
  } catch (error: any) {
    console.error("PDF Metadata Error:", error);
    return createErrorResponse(
      error.message || "Failed to process PDF metadata",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
