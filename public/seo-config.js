/**
 * SEO Configuration for PDF SaaS Platform
 * Centralized SEO metadata for all pages
 */

const SEO_CONFIG = {
  siteName: "UIFlexer PDF Tools",
  siteUrl: "https://pdf.uiflexer.com",
  defaultImage: "https://pdf.uiflexer.com/og-image.png",
  twitterHandle: "@uiflexer", // Update with your actual Twitter handle
  
  pages: {
    home: {
      title: "Free Online PDF Tools - Convert, Merge, Compress PDFs | UIFlexer",
      description: "Free online PDF tools to convert HTML to PDF, merge PDFs, compress files, add watermarks & more. Powered by AI. No installation required. Try free now!",
      keywords: "free pdf tools, html to pdf converter, merge pdf online, compress pdf, pdf to word, pdf watermark, online pdf editor, pdf converter free",
      canonical: "https://pdf.uiflexer.com/",
      ogType: "website"
    },
    
    pdfTools: {
      title: "PDF Tools - Merge, Compress, Convert & Edit PDFs Online | UIFlexer",
      description: "Professional PDF tools: merge multiple PDFs, compress files, convert PDF to Word/Image, add watermarks & password protection. Fast, secure & easy to use.",
      keywords: "pdf tools, merge pdf, compress pdf, pdf to word, pdf to image, pdf watermark, pdf password, pdf converter",
      canonical: "https://pdf.uiflexer.com/pdf-tools.html",
      ogType: "website"
    },
    
    dashboard: {
      title: "Dashboard - Manage Your PDF Projects | UIFlexer",
      description: "Access your PDF dashboard to manage conversions, view usage statistics, and control your PDF generation projects.",
      keywords: "pdf dashboard, pdf management, pdf api dashboard",
      canonical: "https://pdf.uiflexer.com/dashboard.html",
      ogType: "website",
      robots: "noindex, nofollow" // Private page
    },
    
    pricing: {
      title: "Pricing Plans - Affordable PDF API & Tools | UIFlexer",
      description: "Flexible pricing for PDF conversion API and tools. Start free, upgrade as you grow. Plans for individuals, businesses & enterprises. No hidden fees.",
      keywords: "pdf api pricing, pdf tools pricing, pdf converter cost, html to pdf pricing, pdf api plans",
      canonical: "https://pdf.uiflexer.com/pricing.html",
      ogType: "website"
    },
    
    docs: {
      title: "API Documentation - PDF Generation API Guide | UIFlexer",
      description: "Complete API documentation for HTML to PDF conversion. Code examples, authentication guide, and integration tutorials for developers.",
      keywords: "pdf api documentation, html to pdf api, pdf generation api docs, puppeteer api guide",
      canonical: "https://pdf.uiflexer.com/docs.html",
      ogType: "article"
    },
    
    login: {
      title: "Login - Access Your PDF Tools Account | UIFlexer",
      description: "Login to your UIFlexer account to access PDF tools, API keys, and manage your subscription.",
      keywords: "pdf tools login, pdf api login",
      canonical: "https://pdf.uiflexer.com/login.html",
      ogType: "website",
      robots: "noindex, nofollow" // Auth page
    },
    
    register: {
      title: "Sign Up Free - Start Using PDF Tools Today | UIFlexer",
      description: "Create your free account and get instant access to powerful PDF tools. No credit card required. Start converting, merging & editing PDFs now!",
      keywords: "pdf tools signup, free pdf account, pdf api registration",
      canonical: "https://pdf.uiflexer.com/register.html",
      ogType: "website"
    }
  },
  
  // Structured Data (JSON-LD) for rich snippets
  structuredData: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "UIFlexer",
      "url": "https://pdf.uiflexer.com",
      "logo": "https://pdf.uiflexer.com/logo.png",
      "description": "Professional online PDF tools and API for converting, merging, compressing and editing PDF files.",
      "sameAs": [
        "https://twitter.com/uiflexer",
        "https://github.com/uiflexer"
      ]
    },
    
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "UIFlexer PDF Tools",
      "url": "https://pdf.uiflexer.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://pdf.uiflexer.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    
    softwareApplication: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "UIFlexer PDF Tools",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "operatingSystem": "Web Browser",
      "description": "Online PDF tools for converting, merging, compressing and editing PDF files"
    }
  }
};

// Export for use in HTML pages
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEO_CONFIG;
}

