"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, FileEdit } from "lucide-react";

export default function MetadataToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    subject: "",
    keywords: "",
  });

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleUpdateMetadata() {
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
          operationType: "COMPRESS",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update metadata");
      }

      setResult(data);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit PDF Metadata</h1>
          <p className="text-secondary">
            Update title, author, subject, and keywords of your PDF
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Select PDF File
            </label>
            <FileUploader
              onFilesSelected={handleFilesSelected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* Metadata Fields */}
          {file && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="Document Title"
                  className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={metadata.author}
                  onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                  placeholder="Author Name"
                  className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                  placeholder="Document Subject"
                  className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={metadata.keywords}
                  onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="mt-1 text-xs text-secondary">
                  Separate keywords with commas
                </p>
              </div>
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
                Metadata Updated Successfully!
              </h3>
              <a
                href={result.url}
                download={result.filename}
                className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download {result.filename}</span>
              </a>
            </div>
          )}

          {/* Update Button */}
          <button
            onClick={handleUpdateMetadata}
            disabled={!file || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating Metadata...
              </>
            ) : (
              <>
                <FileEdit className="h-5 w-5" />
                Update Metadata
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Metadata helps organize and identify your PDFs. It's also displayed in PDF readers and search results.
          </p>
        </div>
      </div>
    </div>
  );
}
