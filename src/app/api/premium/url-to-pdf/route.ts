import { NextRequest } from "next/server";
import {
  GotenbergClient,
  appendFormField,
  createErrorResponse,
  createPdfResponse,
} from "@/lib/gotenberg";
import { gotenbergConfig } from "@/lib/config";
import { requirePremiumApiKey } from "@/middleware/require-premium-api-key";

const client = new GotenbergClient(gotenbergConfig);

interface UrlToPdfRequest {
  url: string;
  paperWidth?: string;
  paperHeight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  landscape?: boolean;
  scale?: number;
  printBackground?: boolean;
  omitBackground?: boolean;
  singlePage?: boolean;
  nativePageRanges?: string;
  waitDelay?: string;
  emulatedMediaType?: "screen" | "print";
  pdfa?: "PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b";
  pdfua?: boolean;
  userPassword?: string;
  ownerPassword?: string;
  flatten?: boolean;
}

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Validate API key and check tier
  const apiKeyValidation = await requirePremiumApiKey(request);
  if (!apiKeyValidation.valid) {
    return apiKeyValidation.response!;
  }

  try {
    const data = (await request.json()) as UrlToPdfRequest;

    if (!data.url) {
      return createErrorResponse("URL is required", 400);
    }

    if (!isValidUrl(data.url)) {
      return createErrorResponse("Invalid URL format", 400);
    }

    const formData = new FormData();
    formData.append("url", data.url);

    appendFormField(formData, "paperWidth", data.paperWidth);
    appendFormField(formData, "paperHeight", data.paperHeight);
    appendFormField(formData, "marginTop", data.marginTop);
    appendFormField(formData, "marginBottom", data.marginBottom);
    appendFormField(formData, "marginLeft", data.marginLeft);
    appendFormField(formData, "marginRight", data.marginRight);
    appendFormField(formData, "landscape", data.landscape);
    appendFormField(formData, "scale", data.scale);
    appendFormField(formData, "printBackground", data.printBackground);
    appendFormField(formData, "omitBackground", data.omitBackground);
    appendFormField(formData, "singlePage", data.singlePage);
    appendFormField(formData, "nativePageRanges", data.nativePageRanges);
    appendFormField(formData, "waitDelay", data.waitDelay);
    appendFormField(formData, "emulatedMediaType", data.emulatedMediaType);
    appendFormField(formData, "pdfa", data.pdfa);
    appendFormField(formData, "pdfua", data.pdfua);
    appendFormField(formData, "userPassword", data.userPassword);
    appendFormField(formData, "ownerPassword", data.ownerPassword);
    appendFormField(formData, "flatten", data.flatten);

    const blob = await client.sendRequest(
      "/forms/chromium/convert/url",
      formData,
      60000
    );

    const buffer = await blob.arrayBuffer();
    return createPdfResponse(buffer, "url-to-pdf.pdf");
  } catch (error: any) {
    console.error("URL to PDF Error:", error);
    return createErrorResponse(
      error.message || "Failed to convert URL to PDF",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
