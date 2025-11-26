"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, FileType } from "lucide-react";

export default function CompareToolPage() {
  const { user } = useAuth();
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFile1Selected = (files: File[]) => {
    setFile1(files[0] ?? null);
    setError("");
    setResult(null);
  };

  const handleFile2Selected = (files: File[]) => {
    setFile2(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleCompare() {
    if (!file1 || !file2 || !user) {
      setError("Please select both PDF files");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const [uploaded1, uploaded2] = await Promise.all([
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), file1),
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), file2),
      ]);

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "COMPRESS",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploaded1.$id, uploaded2.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file1Id: uploaded1.$id,
          file2Id: uploaded2.$id,
          jobId: job.$id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to compare PDFs");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Compare PDFs</h1>
          <p className="text-secondary">
            Compare two PDF documents and highlight differences
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
          {/* File 1 Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              First PDF File
            </label>
            <FileUploader
              onFilesSelected={handleFile1Selected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* File 2 Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Second PDF File
            </label>
            <FileUploader
              onFilesSelected={handleFile2Selected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Comparison Complete!
              </h3>
              <p className="text-sm text-green-800 mb-4">
                Differences have been highlighted in the output PDF.
              </p>
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

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            disabled={!file1 || !file2 || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Comparing PDFs...
              </>
            ) : (
              <>
                <FileType className="h-5 w-5" />
                Compare PDFs
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> This tool compares two PDF files and creates a new PDF highlighting the differences between them.
          </p>
        </div>
      </div>
    </div>
  );
}
