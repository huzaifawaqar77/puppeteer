"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Code,
  FileText,
  Globe,
  Lock,
  Zap,
} from "lucide-react";

// Get base URL from environment or use current location
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

const API_ENDPOINTS = [
  {
    category: "Web Conversion",
    endpoints: [
      {
        name: "URL to PDF",
        method: "POST",
        path: "/api/premium/url-to-pdf",
        description: "Convert any website URL into a PDF document",
        params: {
          url: "string (required)",
          pageWidth: "number (optional)",
          pageHeight: "number (optional)",
          scale: "number (optional)",
          delay: "number (optional, milliseconds)",
        },
      },
      {
        name: "HTML to PDF",
        method: "POST",
        path: "/api/premium/html-to-pdf",
        description: "Transform HTML code into professionally formatted PDFs",
        params: {
          html: "string (required)",
          pageWidth: "number (optional)",
          pageHeight: "number (optional)",
        },
      },
      {
        name: "Markdown to PDF",
        method: "POST",
        path: "/api/premium/markdown-to-pdf",
        description: "Convert Markdown files with full formatting support",
        params: {
          markdown: "string (required)",
        },
      },
      {
        name: "Screenshots",
        method: "POST",
        path: "/api/premium/screenshots",
        description: "Capture website screenshots as PNG, JPEG, or WebP",
        params: {
          url: "string (required)",
          format: "string (png/jpeg/webp, optional)",
          width: "number (optional)",
          height: "number (optional)",
          delay: "number (optional, milliseconds)",
        },
      },
    ],
  },
  {
    category: "Office Conversion",
    endpoints: [
      {
        name: "Office to PDF",
        method: "POST",
        path: "/api/premium/office-to-pdf",
        description:
          "Convert Word, Excel, PowerPoint to PDF using multipart form",
        params: {
          file: "file (required, multipart/form-data)",
        },
      },
    ],
  },
  {
    category: "PDF Operations",
    endpoints: [
      {
        name: "Merge PDFs",
        method: "POST",
        path: "/api/premium/merge-pdfs",
        description: "Combine multiple PDF files into a single document",
        params: {
          files: "files (required, multipart/form-data)",
        },
      },
      {
        name: "Split PDFs",
        method: "POST",
        path: "/api/premium/split-pdfs",
        description: "Extract specific pages from PDFs by page ranges",
        params: {
          file: "file (required, multipart/form-data)",
          pageRanges: "string (required, e.g., '1-3,5,7-9')",
          unify: "boolean (optional, default: true)",
        },
      },
      {
        name: "Encrypt PDF",
        method: "POST",
        path: "/api/premium/encrypt-pdf",
        description: "Add password protection to PDF files",
        params: {
          file: "file (required, multipart/form-data)",
          password: "string (required)",
          enablePrinting: "boolean (optional)",
          enableCopying: "boolean (optional)",
        },
      },
      {
        name: "Flatten PDF",
        method: "POST",
        path: "/api/premium/flatten-pdf",
        description: "Flatten form fields and annotations in PDFs",
        params: {
          file: "file (required, multipart/form-data)",
        },
      },
      {
        name: "PDF to PDF/A",
        method: "POST",
        path: "/api/premium/pdf-to-pdfa",
        description: "Convert PDFs to archival-compliant PDF/A format",
        params: {
          file: "file (required, multipart/form-data)",
        },
      },
    ],
  },
  {
    category: "PDF Metadata",
    endpoints: [
      {
        name: "PDF Metadata",
        method: "POST",
        path: "/api/premium/pdf-metadata",
        description: "Read or write PDF metadata information",
        params: {
          file: "file (for read, multipart/form-data)",
          action: "string (read/write, required)",
          metadata: "object (for write, JSON)",
        },
      },
    ],
  },
];

export default function ApiDocsPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const baseUrl = getBaseUrl();

  const generateApiKey = () => {
    const key = `pk_${Math.random().toString(36).substr(2, 32).toUpperCase()}`;
    setApiKey(key);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateApiKey = () => {
    generateApiKey();
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          API Documentation
        </h1>
        <p className="text-secondary">
          Integrate OmniPDF premium tools into your applications
        </p>
      </div>

      {/* API Key Section */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">API Key</h2>
            <p className="text-secondary mb-4">
              Your API key is required for all API requests. Keep it secure and
              never share it publicly.
            </p>

            {apiKey ? (
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-secondary mb-1">Your API Key</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-foreground bg-secondary/10 px-3 py-2 rounded flex-1 truncate">
                        {showApiKey ? apiKey : "•".repeat(apiKey.length)}
                      </code>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 hover:bg-secondary/10 rounded transition"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4 text-secondary" />
                        ) : (
                          <Eye className="h-4 w-4 text-secondary" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey)}
                        className="p-2 hover:bg-secondary/10 rounded transition"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-secondary" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={regenerateApiKey}
                    className="ml-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={generateApiKey}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Generate API Key
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: "overview", label: "Overview", icon: FileText },
          { id: "endpoints", label: "Endpoints", icon: Code },
          { id: "examples", label: "Examples", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-secondary border-transparent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Globe,
                title: "Base URL",
                content: `${baseUrl}/api/premium`,
              },
              {
                icon: Lock,
                title: "Authentication",
                content:
                  "Include your API key in the Authorization header: Bearer YOUR_API_KEY",
              },
              {
                icon: FileText,
                title: "Rate Limiting",
                content:
                  "Standard: 100 requests/minute, Premium: 1000 requests/minute",
              },
              {
                icon: Zap,
                title: "Response Format",
                content:
                  "All responses are returned as JSON with appropriate HTTP status codes",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-secondary">{item.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Getting Started
            </h3>
            <ol className="space-y-4 text-secondary">
              <li className="flex gap-3">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </span>
                <span>Generate your API key above</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </span>
                <span>Include the API key in your request headers</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </span>
                <span>Make API calls to the endpoints documented below</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </span>
                <span>Parse the JSON response for your results</span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === "endpoints" && (
        <div className="space-y-8">
          {API_ENDPOINTS.map((category, categoryIdx) => (
            <div key={categoryIdx}>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.endpoints.map((endpoint, endpointIdx) => (
                  <div
                    key={endpointIdx}
                    className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {endpoint.name}
                        </h3>
                        <p className="text-secondary text-sm">
                          {endpoint.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg">
                        <span className="text-xs font-bold text-primary">
                          {endpoint.method}
                        </span>
                      </div>
                    </div>

                    <div className="bg-secondary/5 rounded p-3 mb-4">
                      <code className="text-sm font-mono text-foreground break-all">
                        {endpoint.path}
                      </code>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Parameters:
                      </p>
                      <div className="space-y-2">
                        {Object.entries(endpoint.params).map(([key, value]) => (
                          <div key={key} className="text-sm text-secondary">
                            <code className="bg-secondary/10 px-2 py-1 rounded text-foreground">
                              {key}
                            </code>
                            {" - "}
                            {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "examples" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Example: URL to PDF
            </h3>
            <div className="bg-secondary/5 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-foreground font-mono">
                {`curl -X POST ${baseUrl}/api/premium/url-to-pdf \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "scale": 2
  }'`}
              </pre>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Example: Merge PDFs
            </h3>
            <div className="bg-secondary/5 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-foreground font-mono">
                {`curl -X POST ${baseUrl}/api/premium/merge-pdfs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "files=@file1.pdf" \\
  -F "files=@file2.pdf" \\
  -F "files=@file3.pdf"`}
              </pre>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Response Format
            </h3>
            <div className="bg-secondary/5 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-foreground font-mono">
                {`{
  "success": true,
  "url": "https://storage.example.com/file.pdf",
  "filename": "converted-file.pdf",
  "size": 1024000,
  "timestamp": "2025-12-05T10:30:00Z"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-secondary/5 border border-border rounded-lg p-6 text-center">
        <p className="text-sm text-secondary mb-2">
          Need help? Check our documentation or contact support
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="#"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Documentation
          </a>
          <span className="text-border">•</span>
          <a
            href="#"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Support
          </a>
          <span className="text-border">•</span>
          <a
            href="#"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Status
          </a>
        </div>
      </div>
    </div>
  );
}
