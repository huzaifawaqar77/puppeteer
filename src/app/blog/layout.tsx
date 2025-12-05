import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OmniPDF Blog - PDF Tips, Tutorials & Best Practices",
  description:
    "Learn PDF processing tips, tutorials, and best practices. Discover how to use OmniPDF tools effectively for your workflow.",
  openGraph: {
    title: "OmniPDF Blog - PDF Tips & Tutorials",
    description:
      "Master PDF processing with our comprehensive guides and tutorials.",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
