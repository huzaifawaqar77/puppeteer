import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All PDF Tools - 40+ Free PDF Conversion & Editing Tools",
  description:
    "Access 40+ powerful PDF tools for free. Convert, compress, merge, split, OCR, watermark, and more. No registration required.",
  keywords: [
    "PDF tools",
    "PDF converter",
    "PDF merger",
    "PDF splitter",
    "PDF compressor",
    "free PDF tools",
  ],
  openGraph: {
    title: "All PDF Tools - 40+ Free Tools",
    description: "Transform your PDFs with 40+ powerful tools.",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
