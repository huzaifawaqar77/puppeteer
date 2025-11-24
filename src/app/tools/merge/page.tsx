"use client";

import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download } from "lucide-react";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { useAuth } from "@/contexts/AuthContext";

export default function MergeToolPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError("");
    setResult(null);
  };

  async function handleMerge() {
    if (files.length < 2) {
      setError("Please upload at least 2 PDF files to merge");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const uploadPromises = files.map((file) =>
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), file)
      );
      const uploadedFiles = await Promise.all(uploadPromises);

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "MERGE",
          status: "PENDING",
          inputFileIds: JSON.stringify(uploadedFiles.map((f) => f.$id)),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: uploadedFiles.map((f) => f.$id),
          jobId: job.$id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to merge PDFs");
      }

      const data = await response.json();
      setResult({
        url: data.downloadUrl,
        filename: data.filename,
      });

    } catch (err: any) {
      setError(err.message || "Failed to merge PDF files");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Merge PDFs</h1>
          <p className="text-secondary">
            Combine multiple PDF files into a single document
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Select PDF Files (at least 2)
            </label>
            <FileUploader
              onFilesSelected={handleFilesSelected}
              accept={["application/pdf"]}
              multiple={true}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* Files Selected Info */}
          {files.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>{files.length}</strong> file{files.length > 1 ? "s" : ""} selected
              </p>
              <ul className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-xs text-blue-800">
                    {index + 1}. {file.name}
                  </li>
                ))}
              </ul>
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
                PDFs Merged Successfully!
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

          {/* Merge Button */}
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Merging PDFs...
              </>
            ) : (
              "Merge PDFs"
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Files will be merged in the order they appear. You can upload multiple PDFs at once.
          </p>
        </div>
      </div>
    </div>
  );
}
