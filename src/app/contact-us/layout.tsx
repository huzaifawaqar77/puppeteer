import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact OmniPDF - Get Support & Feedback",
  description:
    "Get in touch with OmniPDF. Send us your feedback, questions, or support requests. We are here to help.",
  openGraph: {
    title: "Contact OmniPDF",
    description: "Reach out to our team for support and feedback.",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
