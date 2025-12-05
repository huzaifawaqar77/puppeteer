import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation - OmniPDF REST API",
  description:
    "Comprehensive REST API documentation for OmniPDF. Integrate PDF processing into your application.",
  keywords: ["API", "REST API", "PDF API", "documentation"],
  openGraph: {
    title: "API Documentation",
    description: "OmniPDF REST API Documentation",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
