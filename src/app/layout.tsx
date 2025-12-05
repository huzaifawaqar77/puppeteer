import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiKeyProvider } from "@/contexts/ApiKeyContext";
import { StructuredData } from "@/components/StructuredData";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniPDF - Master Your PDFs with 40+ Intelligent Tools",
  description:
    "Transform your PDFs with OmniPDF. Access 40+ powerful tools for conversion, compression, OCR, splitting, merging, and more. Free tier with premium features available.",
  keywords: [
    "PDF tools",
    "PDF converter",
    "PDF compressor",
    "PDF OCR",
    "PDF merger",
    "PDF splitter",
    "PDF watermark",
    "PDF signature",
    "PDF editor",
    "online PDF tools",
  ],
  authors: [{ name: "OmniPDF Team" }],
  creator: "OmniPDF",
  publisher: "OmniPDF",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" },
      { url: "/apple-icon-152.png", sizes: "152x152" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://omnipdf.uiflexer.com",
    title: "OmniPDF - Master Your PDFs with 40+ Tools",
    description:
      "Transform your PDFs with 40+ powerful tools. Free access with premium features. No limits on conversions.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OmniPDF - PDF Tools Platform",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 800,
        height: 800,
        alt: "OmniPDF Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniPDF - Master Your PDFs",
    description:
      "Transform PDFs with 40+ powerful tools. Free access with premium features.",
    creator: "@omnipdf",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#1f2937" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          <ApiKeyProvider>{children}</ApiKeyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

