import { NextResponse } from "next/server";

export async function GET() {
  const blogs = [
    { slug: "pdf-compression-guide", date: "2025-11-05" },
    { slug: "pdf-ocr-mastery", date: "2025-11-15" },
    { slug: "pdf-api-integration", date: "2025-11-25" },
    { slug: "pdf-security-guide", date: "2025-12-01" },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogs
  .map(
    (blog) => `  <url>
    <loc>https://omnipdf.uiflexer.com/blog/${blog.slug}</loc>
    <lastmod>${blog.date}</lastmod>
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

