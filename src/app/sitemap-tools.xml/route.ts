import { NextResponse } from "next/server";

export async function GET() {
  const tools = [
    "add-image",
    "add-stamp",
    "add-text",
    "auto-rename",
    "auto-split",
    "compress",
    "convert",
    "crop",
    "detect-blank-pages",
    "extract-images",
    "file-to-pdf",
    "flatten",
    "get-info",
    "html-to-pdf",
    "img-to-pdf",
    "linearize",
    "markdown-to-pdf",
    "merge",
    "metadata",
    "multi-page-layout",
    "ocr",
    "overlay",
    "page-numbers",
    "pdf-to-csv",
    "pdf-to-html",
    "pdf-to-markdown",
    "pdf-to-pdfa",
    "pdf-to-presentation",
    "pdf-to-text",
    "pdf-to-word",
    "pdf-to-xml",
    "protect",
    "remove-blanks",
    "remove-pages",
    "repair",
    "rotate",
    "sanitize",
    "show-javascript",
    "sign",
    "split",
    "unlock",
    "watermark",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tools
  .map(
    (tool) => `  <url>
    <loc>https://omnipdf.uiflexer.com/tools/${tool}</loc>
    <lastmod>2025-12-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

