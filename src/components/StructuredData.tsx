"use client";

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OmniPDF",
    url: "https://omnipdf.uiflexer.com",
    logo: "https://omnipdf.uiflexer.com/favicon-512.png",
    description: "Transform your PDFs with 40+ powerful tools",
    sameAs: [
      "https://twitter.com/omnipdf",
      "https://github.com/omnipdf",
      "https://linkedin.com/company/omnipdf",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OmniPDF",
    url: "https://omnipdf.uiflexer.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://omnipdf.uiflexer.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const applicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OmniPDF",
    applicationCategory: "Productivity",
    description: "Comprehensive PDF processing platform with 40+ tools",
    url: "https://omnipdf.uiflexer.com",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(applicationSchema),
        }}
      />
    </>
  );
}

