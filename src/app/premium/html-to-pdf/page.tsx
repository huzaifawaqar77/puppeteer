"use client";

import { useState } from "react";
import {
  FileCode,
  Link as LinkIcon,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function HtmlToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");

  const handleConvert = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();

      if (activeTab === "file") {
        if (files.length === 0) {
          throw new Error("Please select a file");
        }
        formData.append("file", files[0]);
        formData.append("type", "file");
      } else {
        if (!url) {
          throw new Error("Please enter a URL");
        }
        formData.append("url", url);
        formData.append("type", "url");
      }

      const response = await fetch("/api/premium/html-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Conversion failed");
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "converted.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileCode className="w-8 h-8 text-orange-500" />
          HTML to PDF
        </h1>
        <p className="text-muted-foreground mt-2">
          Convert HTML files or URLs to high-quality PDF documents using
          Gotenberg.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === "file"
                ? "text-primary border-b-2 border-primary -mb-0.5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCode className="w-4 h-4" />
            Upload HTML File
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === "url"
                ? "text-primary border-b-2 border-primary -mb-0.5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Enter URL
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "file" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                HTML File
              </label>
              <FileUploader
                onFilesSelected={(selectedFiles: File[]) =>
                  setFiles(selectedFiles)
                }
                accept={[".html", ".htm"]}
                maxSize={30 * 1024 * 1024}
              />
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-3">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-foreground"
              >
                Website URL
              </label>
              <input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-12 px-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleConvert}
              disabled={
                isProcessing ||
                (activeTab === "file" && files.length === 0) ||
                (activeTab === "url" && !url)
              }
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
