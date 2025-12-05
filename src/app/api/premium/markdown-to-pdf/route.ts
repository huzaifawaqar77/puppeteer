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

interface MarkdownToPdfRequest {
  markdown: string;
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
  waitDelay?: string;
  emulatedMediaType?: "screen" | "print";
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as MarkdownToPdfRequest;

    if (!data.markdown || data.markdown.trim() === "") {
      return createErrorResponse("Markdown content is required", 400);
    }

    // Create HTML wrapper that uses Gotenberg's toHTML template function
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 {
      font-size: 2em;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; color: #6a737d; }
    p {
      margin-bottom: 16px;
    }
    a {
      color: #0366d6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    code {
      background: #f6f8fa;
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      border-radius: 3px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }
    pre {
      background: #f6f8fa;
      padding: 16px;
      border-radius: 6px;
      overflow: auto;
      margin: 16px 0;
      line-height: 1.45;
    }
    pre code {
      background: none;
      padding: 0;
      margin: 0;
      font-size: 100%;
      border-radius: 0;
    }
    blockquote {
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid #dfe2e5;
      margin: 0 0 16px 0;
    }
    blockquote > :first-child {
      margin-top: 0;
    }
    blockquote > :last-child {
      margin-bottom: 0;
    }
    ul, ol {
      padding-left: 2em;
      margin-bottom: 16px;
    }
    li {
      margin-bottom: 8px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    table th,
    table td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
      text-align: left;
    }
    table tr:nth-child(2n) {
      background: #f6f8fa;
    }
    table th {
      background: #f6f8fa;
      font-weight: 600;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    hr {
      background: #e1e4e8;
      border: 0;
      height: 2px;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  {{ toHTML "document.md" }}
</body>
</html>`;

    const formData = new FormData();

    // Add HTML wrapper as index.html
    const htmlBlob = new Blob([htmlContent], { type: "text/html" });
    formData.append("files", htmlBlob, "index.html");

    // Add markdown file as document.md
    const mdBlob = new Blob([data.markdown], { type: "text/markdown" });
    formData.append("files", mdBlob, "document.md");

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
    appendFormField(formData, "waitDelay", data.waitDelay);
    appendFormField(formData, "emulatedMediaType", data.emulatedMediaType);

    const blob = await client.sendRequest(
      "/forms/chromium/convert/markdown",
      formData,
      60000
    );

    const buffer = await blob.arrayBuffer();
    return createPdfResponse(buffer, "markdown-to-pdf.pdf");
  } catch (error: any) {
    console.error("Markdown to PDF Error:", error);
    return createErrorResponse(
      error.message || "Failed to convert Markdown to PDF",
      error.message?.includes("timeout") ? 408 : 500
    );
  }
}
