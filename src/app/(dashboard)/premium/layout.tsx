import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium PDF Tools - Advanced Features for Power Users",
  description:
    "Unlock premium PDF tools with advanced features. Higher API limits, batch processing, priority support, and more.",
  openGraph: {
    title: "Premium PDF Tools",
    description: "Advanced features for power users. Currently available free.",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
};

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
