import { NextRequest } from "next/server";
import {
  GotenbergClient,
  appendFormField,
  createErrorResponse,
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
    const pageRanges = formData.get("pageRanges") as string;
    const unify = formData.get("unify") === "true";

    if (!file) {
      return createErrorResponse("PDF file is required", 400);
    }

    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      return createErrorResponse("Please upload a PDF file", 400);
    }

    if (!pageRanges || pageRanges.trim() === "") {
      return createErrorResponse("Page ranges are required", 400);
    }

    // Validate page ranges format (e.g., "1-3", "1,5,7-9")
    const rangePattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
    if (!rangePattern.test(pageRanges.trim())) {
      return createErrorResponse(
        "Invalid page ranges format. Use format like: 1-3,5,7-9",
        400
      );
    }

    const splitFormData = new FormData();
    splitFormData.append("files", file);
    splitFormData.append("splitMode", "pages");
    splitFormData.append("splitSpan", pageRanges.trim());
    appendFormField(splitFormData, "splitUnify", unify ? "true" : "false");

    const blob = await client.sendRequest(
      "/forms/pdfengines/split",
      splitFormData,
      120000
    );

    const buffer = await blob.arrayBuffer();
    const response = new Response(buffer);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="split-${Date.now()}.pdf"`
    );
    return response;
  } catch (error: any) {
    console.error("Split PDF Error:", error);
    return createErrorResponse(
      error.message || "Failed to split PDF",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
