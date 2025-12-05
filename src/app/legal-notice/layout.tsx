import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice - OmniPDF",
  description: "Legal information and disclaimers for OmniPDF.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Legal Notice",
    description: "OmniPDF Legal Notice",
    type: "website",
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
