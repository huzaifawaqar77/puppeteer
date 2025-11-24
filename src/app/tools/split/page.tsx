"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download } from "lucide-react";

export default function SplitToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string }[] | null>(null);
  const [error, setError] = useState<string>("");
  const [splitMode, setSplitMode] = useState<string>("PAGES");
  const [pageRange, setPageRange] = useState<string>("");

  const handleFileSelected = (files: File[]) => {
    setFile(files[0] || null);
    setError("");
    setResult(null);
  };

  async function handleSplit() {
    if (!file || !user) {
      setError("Please select a file");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.buckets.input,
        ID.unique(),
        file
      );

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "SPLIT",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          splitMode,
          pageRange,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to split PDF");
      }

      setResult(data.files);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Split PDF</h1>
          <p className="text-secondary">Split a PDF file into multiple documents</p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Select PDF File
            </label>
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* Split Options */}
          {file && (
            <div className="mb-6 space-y-4">
              <label className="block text-sm font-medium text-foreground mb-3">
                Split Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setSplitMode("PAGES")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    splitMode === "PAGES"
                      ? "bg-primary text-white shadow-glow-orange"
                      : "bg-sidebar text-secondary hover:bg-border"
                  }`}
                >
                  By Page Range
                </button>
                <button
                  onClick={() => setSplitMode("ALL")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    splitMode === "ALL"
                      ? "bg-primary text-white shadow-glow-orange"
                      : "bg-sidebar text-secondary hover:bg-border"
                  }`}
                >
                  All Pages Separately
                </button>
              </div>

              {splitMode === "PAGES" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Page Range (e.g., 1-5, 7, 9-12)
                  </label>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="1-5, 7, 9-12"
                    className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                PDF Split Successfully!
              </h3>
              <div className="space-y-2">
                {result.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    download={file.filename}
                    className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {file.filename}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Split Button */}
          <button
            onClick={handleSplit}
            disabled={!file || processing || (splitMode === "PAGES" && !pageRange)}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Split PDF"
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> You can split by page range (e.g., "1-5, 7, 9-12") or split every page into a separate file.
          </p>
        </div>
      </div>
    </div>
  );
}
