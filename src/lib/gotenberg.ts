import { NextResponse } from "next/server";

export interface GotenbergConfig {
  url: string;
  username: string;
  password: string;
}

export class GotenbergClient {
  private config: GotenbergConfig;
  private authHeader: string;

  constructor(config: GotenbergConfig) {
    this.config = config;
    const credentials = Buffer.from(
      `${config.username}:${config.password}`
    ).toString("base64");
    this.authHeader = `Basic ${credentials}`;
  }

  /**
   * Send multipart/form-data request to Gotenberg
   * Returns PDF or ZIP file (Blob)
   */
  async sendRequest(
    endpoint: string,
    formData: FormData,
    timeout: number = 60000
  ): Promise<Blob> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.config.url}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gotenberg Error:", {
          status: response.status,
          endpoint,
          error: errorText,
        });
        throw new Error(
          `Gotenberg API Error: ${response.status} - ${errorText}`
        );
      }

      return await response.blob();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Send request for JSON response (metadata operations)
   */
  async sendJsonRequest(
    endpoint: string,
    formData: FormData,
    timeout: number = 60000
  ): Promise<Record<string, any>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.config.url}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gotenberg API Error: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

/**
 * Utility: Convert FormData values to Gotenberg format
 */
export function appendFormField(
  formData: FormData,
  key: string,
  value: any
): void {
  if (value === null || value === undefined || value === "") return;

  if (typeof value === "object") {
    formData.append(key, JSON.stringify(value));
  } else if (typeof value === "boolean") {
    formData.append(key, String(value));
  } else if (typeof value === "number") {
    formData.append(key, String(value));
  } else {
    formData.append(key, value);
  }
}

/**
 * Utility: Create standardized error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: string
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}

/**
 * Utility: Create standardized PDF response
 */
export function createPdfResponse(
  buffer: ArrayBuffer,
  filename: string = "document.pdf"
) {
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}

/**
 * Utility: Create standardized ZIP response
 */
export function createZipResponse(
  buffer: ArrayBuffer,
  filename: string = "documents.zip"
) {
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}

/**
 * Utility: Create standardized image response
 */
export function createImageResponse(
  buffer: ArrayBuffer,
  format: "png" | "jpeg" | "webp" = "png",
  filename: string = "screenshot"
) {
  const mimeTypes = {
    png: "image/png",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeTypes[format],
      "Content-Disposition": `attachment; filename="${filename}.${format}"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}

/**
 * Utility: Create JSON response
 */
export function createJsonResponse(data: Record<string, any>) {
  return NextResponse.json(data);
}
