/\*\*

- PREMIUM ENDPOINT TEMPLATE - Request Tracking
-
- This is a template showing how to add request tracking to premium endpoints
- Copy and paste the relevant parts into your premium endpoint.
-
- STEP 1: Add imports
- ```typescript

  ```
- import { incrementApiKeyRequestCount } from "@/middleware/require-premium-api-key";
- ```

  ```
-
- STEP 2: After calling requirePremiumApiKey, validate the response
- ```typescript

  ```
- const apiKeyValidation = await requirePremiumApiKey(request);
- if (!apiKeyValidation.valid) {
- return apiKeyValidation.response!;
- }
- ```

  ```
-
- STEP 3: In your success response handler, before returning the response, add tracking
- ```typescript

  ```
- const response = createPdfResponse(buffer, "file.pdf");
-
- // Track API usage
- if (apiKeyValidation.keyId) {
- incrementApiKeyRequestCount(apiKeyValidation.keyId).catch((err) => {
-     console.error("Failed to track usage:", err);
- });
- }
-
- return response;
- ```

  ```
-
- IMPORTANT:
- - The incrementApiKeyRequestCount call is async but we don't await it
- - This is fire-and-forget to avoid slowing down the response
- - Errors are logged but don't affect the API response
- - The request count is updated in the database independently
-
- WHAT HAPPENS:
- - Each successful API call increments the request counter
- - Daily counters reset at midnight UTC (when the date changes)
- - The middleware checks these counters BEFORE processing requests
- - Users get a 429 error when they exceed their daily limit
-
- TESTING:
- 1.  Generate a free API key with 500/day limit
- 2.  Make requests to the API
- 3.  Check the API key in the management dashboard - usage bar updates
- 4.  Try to exceed the limit - should get 429 error
      \*/

// Example complete endpoint with tracking:
/\*
import { NextRequest } from "next/server";
import {
GotenbergClient,
appendFormField,
createErrorResponse,
createPdfResponse,
} from "@/lib/gotenberg";
import { gotenbergConfig } from "@/lib/config";
import { requirePremiumApiKey, incrementApiKeyRequestCount } from "@/middleware/require-premium-api-key";

const client = new GotenbergClient(gotenbergConfig);

export async function POST(request: NextRequest) {
// Validate API key
const apiKeyValidation = await requirePremiumApiKey(request);
if (!apiKeyValidation.valid) {
return apiKeyValidation.response!;
}

try {
const data = await request.json();

    // ... your endpoint logic here ...

    const formData = new FormData();
    // ... build formData ...

    const blob = await client.sendRequest(
      "/forms/chromium/convert/url",
      formData,
      60000
    );

    const buffer = await blob.arrayBuffer();
    const response = createPdfResponse(buffer, "output.pdf");

    // TRACK USAGE - Add this before returning
    if (apiKeyValidation.keyId) {
      incrementApiKeyRequestCount(apiKeyValidation.keyId).catch((err) => {
        console.error("Failed to track usage:", err);
      });
    }

    return response;

} catch (error: any) {
console.error("Error:", error);
return createErrorResponse(
error.message || "Failed to process request",
500
);
}
}
\*/
