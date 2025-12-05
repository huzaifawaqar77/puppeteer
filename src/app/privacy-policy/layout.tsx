import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - OmniPDF",
  description: "Learn how OmniPDF protects your privacy and data.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Privacy Policy",
    description: "OmniPDF Privacy Policy",
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
