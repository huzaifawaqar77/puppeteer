import { NextRequest } from "next/server";
import {
  GotenbergClient,
  appendFormField,
  createErrorResponse,
  createPdfResponse,
} from "@/lib/gotenberg";
import { gotenbergConfig } from "@/lib/config";
import {
  requirePremiumApiKey,
  incrementApiKeyRequestCount,
} from "@/middleware/require-premium-api-key";

const client = new GotenbergClient(gotenbergConfig);

const ALLOWED_FORMATS = [
  "doc",
  "docx",
  "odt",
  "rtf",
  "txt",
  "xls",
  "xlsx",
  "ods",
  "csv",
  "tsv",
  "ppt",
  "pptx",
  "odp",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "svg",
  "tiff",
];

interface OfficeToPdfRequest {
  landscape?: boolean;
  nativePageRanges?: string;
  singlePage?: boolean;
  userPassword?: string;
  ownerPassword?: string;
  pdfa?: "PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b";
  pdfua?: boolean;
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
    const options = formData.get("options") as string;

    if (!file) {
      return createErrorResponse("File is required", 400);
    }

    // Validate file type
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_FORMATS.includes(fileExt)) {
      return createErrorResponse(
        `Unsupported file format: .${fileExt}. Supported: ${ALLOWED_FORMATS.join(
          ", "
        )}`,
        400
      );
    }

    let data: OfficeToPdfRequest = {};
    if (options) {
      try {
        data = JSON.parse(options);
      } catch (e) {
        return createErrorResponse("Invalid options JSON", 400);
      }
    }

    const mergeFormData = new FormData();
    mergeFormData.append("files", file);

    appendFormField(mergeFormData, "landscape", data.landscape);
    appendFormField(mergeFormData, "nativePageRanges", data.nativePageRanges);
    appendFormField(mergeFormData, "singlePage", data.singlePage);
    appendFormField(mergeFormData, "userPassword", data.userPassword);
    appendFormField(mergeFormData, "ownerPassword", data.ownerPassword);
    appendFormField(mergeFormData, "pdfa", data.pdfa);
    appendFormField(mergeFormData, "pdfua", data.pdfua);

    if (data.metadata) {
      for (const [key, value] of Object.entries(data.metadata)) {
        appendFormField(mergeFormData, `metadata.${key}`, value);
      }
    }

    const blob = await client.sendRequest(
      "/forms/libreoffice/convert",
      mergeFormData,
      120000
    );

    const buffer = await blob.arrayBuffer();
    const outputName = file.name.replace(/\.[^.]+$/, ".pdf");
    const response = createPdfResponse(buffer, outputName);

    // Track API usage
    if (apiKeyValidation.keyId) {
      incrementApiKeyRequestCount(apiKeyValidation.keyId).catch((err) => {
        console.error("Failed to track usage:", err);
      });
    }

    return response;
  } catch (error: any) {
    console.error("Office to PDF Error:", error);
    return createErrorResponse(
      error.message || "Failed to convert office document to PDF",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
