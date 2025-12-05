import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";

/**
 * Middleware to protect premium endpoints
 * Requires valid API key with appropriate tier
 *
 * Usage:
 * export async function POST(request: NextRequest) {
 *   const validation = await requirePremiumApiKey(request);
 *   if (!validation.valid) return validation.response;
 *   // Your endpoint logic here
 * }
 */

export interface ApiKeyValidation {
  valid: boolean;
  response?: NextResponse;
  keyId?: string;
  userId?: string;
  tier?: string;
  requestCount?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export async function requirePremiumApiKey(
  request: NextRequest
): Promise<ApiKeyValidation> {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Missing or invalid authorization header",
            message:
              'Authorization header required in format: "Bearer YOUR_API_KEY"',
          },
          { status: 401 }
        ),
      };
    }

    // Extract API key
    const apiKey = authHeader.substring(7); // Remove "Bearer "

    if (!apiKey) {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: "API key is required",
          },
          { status: 401 }
        ),
      };
    }

    // Validate API key
    const validation = await validateApiKey(apiKey);

    if (!validation.valid) {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Invalid or inactive API key",
            message: validation.message || "The provided API key is not valid",
          },
          { status: 401 }
        ),
      };
    }

    // Check if key is active and not expired
    if (validation.status !== "active") {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: `API key is ${validation.status}`,
            message: `Cannot use ${validation.status} API keys`,
          },
          { status: 403 }
        ),
      };
    }

    // Check if key has expired
    if (validation.expiresAt) {
      const expiryDate = new Date(validation.expiresAt);
      if (expiryDate < new Date()) {
        return {
          valid: false,
          response: NextResponse.json(
            {
              success: false,
              error: "API key has expired",
              expiresAt: validation.expiresAt,
            },
            { status: 403 }
          ),
        };
      }
    }

    // Check tier (premium endpoints require at least "premium" tier)
    if (validation.tier !== "premium") {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Insufficient tier for this endpoint",
            message: `This endpoint requires premium tier, your tier is: ${validation.tier}`,
            currentTier: validation.tier,
            requiredTier: "premium",
          },
          { status: 403 }
        ),
      };
    }

    // Check if endpoint is allowed
    if (validation.allowedEndpoints && validation.allowedEndpoints.length > 0) {
      const pathname = new URL(request.url).pathname;
      const isAllowed = validation.allowedEndpoints.some((endpoint) => {
        // Support wildcards like /api/premium/* or exact paths
        if (endpoint.includes("*")) {
          const pattern = endpoint.replace(/\*/g, ".*");
          return new RegExp(`^${pattern}$`).test(pathname);
        }
        return endpoint === pathname;
      });

      if (!isAllowed) {
        return {
          valid: false,
          response: NextResponse.json(
            {
              success: false,
              error: "Endpoint not allowed for this API key",
              pathname,
              allowedEndpoints: validation.allowedEndpoints,
            },
            { status: 403 }
          ),
        };
      }
    }

    // Check daily limit
    if (validation.dailyLimit && validation.dailyLimit > 0) {
      if (
        validation.requestCountToday !== undefined &&
        validation.requestCountToday >= validation.dailyLimit
      ) {
        return {
          valid: false,
          response: NextResponse.json(
            {
              success: false,
              error: "Daily request limit exceeded",
              dailyLimit: validation.dailyLimit,
              requestsToday: validation.requestCountToday,
            },
            { status: 429 }
          ),
        };
      }
    }

    // Check monthly limit
    if (validation.monthlyLimit && validation.monthlyLimit > 0) {
      if (
        validation.requestCountMonth !== undefined &&
        validation.requestCountMonth >= validation.monthlyLimit
      ) {
        return {
          valid: false,
          response: NextResponse.json(
            {
              success: false,
              error: "Monthly request limit exceeded",
              monthlyLimit: validation.monthlyLimit,
              requestsMonth: validation.requestCountMonth,
            },
            { status: 429 }
          ),
        };
      }
    }

    // Everything is valid, return success
    return {
      valid: true,
      keyId: validation.keyId,
      userId: validation.userId,
      tier: validation.tier,
      requestCount: validation.requestCount,
      dailyLimit: validation.dailyLimit,
      monthlyLimit: validation.monthlyLimit,
    };
  } catch (error) {
    console.error("Premium API key validation error:", error);
    return {
      valid: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Server error during API key validation",
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Simpler version for endpoints that only need basic API key validation
 * without tier or endpoint restrictions
 */
export async function requireApiKey(
  request: NextRequest
): Promise<ApiKeyValidation> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Missing or invalid authorization header",
          },
          { status: 401 }
        ),
      };
    }

    const apiKey = authHeader.substring(7);

    if (!apiKey) {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: "API key is required",
          },
          { status: 401 }
        ),
      };
    }

    const validation = await validateApiKey(apiKey);

    if (!validation.valid) {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Invalid API key",
          },
          { status: 401 }
        ),
      };
    }

    if (validation.status !== "active") {
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: `API key is ${validation.status}`,
          },
          { status: 403 }
        ),
      };
    }

    return {
      valid: true,
      keyId: validation.keyId,
      userId: validation.userId,
      tier: validation.tier,
      requestCount: validation.requestCount,
    };
  } catch (error) {
    console.error("API key validation error:", error);
    return {
      valid: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Server error during API key validation",
        },
        { status: 500 }
      ),
    };
  }
}
