/**
 * SEO Configuration for PDFSaaS Platform
 * Centralized SEO metadata for all pages
 */

const SEO_CONFIG = {
  siteName: "PDFSaaS",
  siteUrl: "https://puppeteer.uiflexer.com",
  defaultImage: "https://puppeteer.uiflexer.com/og-image.png",
  twitterHandle: "@pdfsaas",

  pages: {
    home: {
      title: "PDFSaaS - Professional PDF Generation API for Developers",
      description:
        "Modern PDF generation API for developers. Convert HTML to PDF, generate documents at scale with enterprise-grade reliability and security. Trusted by leading companies worldwide.",
      keywords:
        "pdf generation api, html to pdf api, pdf converter api, puppeteer api, headless browser pdf, document generation api, pdf as a service",
      canonical: "https://puppeteer.uiflexer.com/",
      ogType: "website",
    },

    pdfTools: {
      title: "PDF Tools - Convert, Merge & Edit PDFs | PDFSaaS",
      description:
        "Professional PDF tools: convert HTML to PDF, merge documents, compress files, add watermarks. Fast, secure & enterprise-grade.",
      keywords:
        "pdf tools, html to pdf, merge pdf, compress pdf, pdf converter, pdf api",
      canonical: "https://puppeteer.uiflexer.com/pdf-tools.html",
      ogType: "website",
    },

    blogs: {
      title: "Blog - HTML to PDF Conversion Guides & Tutorials | PDFSaaS",
      description:
        "Expert guides on HTML to PDF conversion, document generation, and API integration. Learn best practices for PDF generation at scale.",
      keywords:
        "html to pdf tutorial, pdf generation guide, pdf api tutorials, document conversion",
      canonical: "https://puppeteer.uiflexer.com/blogs.html",
      ogType: "website",
    },

    dashboard: {
      title: "Dashboard - Manage Your PDF API | PDFSaaS",
      description:
        "Access your PDFSaaS dashboard to manage API keys, view usage statistics, and control your PDF generation projects.",
      keywords: "pdf api dashboard, pdf management, api key management",
      canonical: "https://puppeteer.uiflexer.com/dashboard.html",
      ogType: "website",
      robots: "noindex, nofollow",
    },

    docs: {
      title: "API Documentation - PDF Generation API Guide | PDFSaaS",
      description:
        "Complete API documentation for HTML to PDF conversion. Code examples, authentication guide, and integration tutorials for developers.",
      keywords:
        "pdf api documentation, html to pdf api docs, pdf generation api guide, puppeteer api documentation",
      canonical: "https://puppeteer.uiflexer.com/docs.html",
      ogType: "article",
    },

    login: {
      title: "Login - Access Your PDFSaaS Account",
      description:
        "Login to your PDFSaaS account to access API keys, usage dashboard, and manage your subscription.",
      keywords: "pdf api login, pdfsaas login",
      canonical: "https://puppeteer.uiflexer.com/login.html",
      ogType: "website",
      robots: "noindex, nofollow",
    },

    register: {
      title: "Sign Up Free - Start Generating PDFs Today | PDFSaaS",
      description:
        "Create your free account and get instant access to powerful PDF generation API. No credit card required. Start converting HTML to PDF now!",
      keywords: "pdf api signup, free pdf api, pdf generation registration",
      canonical: "https://puppeteer.uiflexer.com/register.html",
      ogType: "website",
    },
  },

  // Structured Data (JSON-LD) for rich snippets
  structuredData: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PDFSaaS",
      url: "https://puppeteer.uiflexer.com",
      logo: "https://puppeteer.uiflexer.com/logo.png",
      description:
        "Professional PDF generation API for developers. Convert HTML to PDF at scale with enterprise-grade reliability.",
      sameAs: ["https://twitter.com/pdfsaas", "https://github.com/pdfsaas"],
    },

    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PDFSaaS",
      url: "https://puppeteer.uiflexer.com",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://puppeteer.uiflexer.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },

    softwareApplication: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "PDFSaaS",
      applicationCategory: "DeveloperApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      operatingSystem: "Any",
      description:
        "Professional PDF generation API for developers. Convert HTML to PDF at scale.",
    },
  },
};

// Export for use in HTML pages
if (typeof module !== "undefined" && module.exports) {
  module.exports = SEO_CONFIG;
}
