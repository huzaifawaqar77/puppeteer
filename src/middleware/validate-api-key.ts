import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/config';
import { Query } from 'appwrite';
import {
  hashApiKey,
  isKeyExpired,
  isDailyLimitExceeded,
  isValidApiKeyFormat,
  canAccessEndpoint,
} from '@/lib/api-keys';

export interface ValidatedApiKey {
  id: string;
  userId: string;
  tier: 'free' | 'premium';
  requestCount: number;
  dailyLimit: number | null;
  monthlyLimit: number | null;
  allowedEndpoints: string[];
  keyPrefix: string;
}

/**
 * Extract API key from Authorization header
 * Expected format: "Bearer pk_xxxxx..."
 */
function extractApiKeyFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '').trim();
}

/**
 * Validate incoming API key and return key details if valid
 * This middleware checks:
 * - Key exists in database
 * - Key is active (not revoked/expired)
 * - Key hasn't expired
 * - Daily limit not exceeded
 * - User tier can access endpoint
 */
export async function validateApiKey(
  request: NextRequest,
  endpoint?: string
): Promise<ValidatedApiKey | null> {
  try {
    // Extract API key from header
    const authHeader = request.headers.get('Authorization');
    const apiKey = extractApiKeyFromHeader(authHeader);

    if (!apiKey) {
      console.debug('No API key found in Authorization header');
      return null;
    }

    // Validate key format
    if (!isValidApiKeyFormat(apiKey)) {
      console.debug(`Invalid API key format: ${apiKey.substring(0, 8)}...`);
      return null;
    }

    // Hash the key for database lookup
    const keyHash = hashApiKey(apiKey);

    // Lookup in database using pre-configured client
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      [
        Query.equal('keyHash', keyHash),
        Query.equal('status', 'active'),
      ]
    );

    if (response.documents.length === 0) {
      console.debug(`API key not found in database: ${keyHash.substring(0, 8)}...`);
      return null;
    }

    const keyDoc = response.documents[0] as any;

    // Check if expired
    if (isKeyExpired(keyDoc.expiresAt)) {
      console.debug(`API key expired: ${keyDoc.$id}`);
      // Mark as expired in database
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.apiKeys,
          keyDoc.$id,
          { status: 'expired' }
        );
      } catch (error) {
        console.error('Failed to mark key as expired:', error);
      }
      return null;
    }

    // Check daily limit
    if (isDailyLimitExceeded(keyDoc.requestCount, keyDoc.dailyLimit)) {
      console.debug(`Daily limit exceeded for key: ${keyDoc.$id}`);
      return null;
    }

    // Check endpoint access if endpoint is provided
    if (endpoint && !canAccessEndpoint(keyDoc.tier, endpoint)) {
      console.debug(`Tier ${keyDoc.tier} cannot access endpoint ${endpoint}`);
      return null;
    }

    // Return validated key info
    return {
      id: keyDoc.$id,
      userId: keyDoc.userId,
      tier: keyDoc.tier,
      requestCount: keyDoc.requestCount,
      dailyLimit: keyDoc.dailyLimit || null,
      monthlyLimit: keyDoc.monthlyLimit || null,
      allowedEndpoints: keyDoc.allowedEndpoints || [],
      keyPrefix: keyDoc.keyPrefix,
    };
  } catch (error) {
    console.error('API Key Validation Error:', error);
    return null;
  }
}

/**
 * Increment request count and update lastUsedAt for a validated key
 */
export async function incrementKeyUsage(
  keyId: string,
  ip?: string
): Promise<void> {
  try {
    const key = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      keyId
    );

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.apiKeys,
      keyId,
      {
        requestCount: (key.requestCount || 0) + 1,
        lastUsedAt: new Date().toISOString(),
        lastUsedFromIP: ip || 'unknown',
      }
    );
  } catch (error) {
    console.error('Failed to increment key usage:', error);
    // Don't throw - let request succeed even if tracking fails
  }
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Invalid or missing API key'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create a 403 Forbidden response
 */
export function forbiddenResponse(message: string = 'Access forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Create a 429 Too Many Requests response
 */
export function rateLimitResponse(
  message: string = 'API rate limit exceeded',
  remaining?: number
): NextResponse {
  const response = NextResponse.json(
    { error: message, ...(remaining !== undefined && { requestsRemaining: remaining }) },
    { status: 429 }
  );
  response.headers.set('Retry-After', '3600'); // 1 hour
  return response;
}

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Middleware wrapper for API routes that require API key validation
 * Usage:
 * ```
 * export async function POST(request: NextRequest) {
 *   const validatedKey = await validateAndAuthorizeApiKey(request, '/api/premium/some-endpoint');
 *   if (!validatedKey.isValid) {
 *     return validatedKey.response;
 *   }
 *   // ... proceed with endpoint logic
 * }
 * ```
 */
export async function validateAndAuthorizeApiKey(
  request: NextRequest,
  endpoint: string,
  requiredTier?: 'free' | 'premium'
): Promise<{
  isValid: boolean;
  validatedKey?: ValidatedApiKey;
  response?: NextResponse;
}> {
  // Validate API key
  const validatedKey = await validateApiKey(request, endpoint);

  if (!validatedKey) {
    return {
      isValid: false,
      response: unauthorizedResponse('Invalid or missing API key'),
    };
  }

  // Check tier requirement
  if (requiredTier && validatedKey.tier !== requiredTier) {
    return {
      isValid: false,
      response: forbiddenResponse(`${requiredTier} API key required for this endpoint`),
    };
  }

  // Check rate limit
  if (validatedKey.dailyLimit && isDailyLimitExceeded(validatedKey.requestCount, validatedKey.dailyLimit)) {
    const remaining = Math.max(0, validatedKey.dailyLimit - validatedKey.requestCount);
    return {
      isValid: false,
      response: rateLimitResponse('Daily API quota exceeded', remaining),
    };
  }

  return {
    isValid: true,
    validatedKey,
  };
}
