import { NextResponse } from "next/server";
import { incrementApiKeyRequestCount } from "@/lib/api-keys";

/**
 * Wrapper to track API key usage and increment request counters
 * Call this after a successful API operation to record the usage
 *
 * Usage:
 * const response = createPdfResponse(buffer, "file.pdf");
 * return trackApiUsage(apiKeyValidation.keyId, response);
 */
export async function trackApiUsage(
  keyId: string | undefined,
  response: NextResponse
): Promise<NextResponse> {
  // Only track if we have a keyId
  if (!keyId) {
    return response;
  }

  // Check if response is successful (2xx status code)
  const statusCode = response.status || 200;
  if (statusCode < 200 || statusCode >= 300) {
    return response;
  }

  // Increment the request count asynchronously (don't wait for it)
  incrementApiKeyRequestCount(keyId).catch((err) => {
    console.error("Failed to track API usage for key:", keyId, err);
  });

  return response;
}

/**
 * Inline tracking for synchronous operations
 * Use this when you want to increment the counter inline with the response
 *
 * Usage:
 * const response = createPdfResponse(buffer, "file.pdf");
 * if (apiKeyValidation.keyId) {
 *   inlineTrackApiUsage(apiKeyValidation.keyId);
 * }
 * return response;
 */
export function inlineTrackApiUsage(keyId: string): void {
  incrementApiKeyRequestCount(keyId).catch((err) => {
    console.error("Failed to track API usage for key:", keyId, err);
  });
}
