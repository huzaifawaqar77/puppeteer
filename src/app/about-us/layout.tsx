import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About OmniPDF - Transforming PDF Processing",
  description:
    "Learn about OmniPDF. We are building the most comprehensive and user-friendly PDF processing platform.",
  openGraph: {
    title: "About OmniPDF",
    description: "Transforming how people work with PDFs.",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
