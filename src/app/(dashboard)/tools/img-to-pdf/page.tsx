"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Image as ImageIcon } from "lucide-react";

export default function ImageToPdfToolPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [fitOption, setFitOption] = useState<string>("fillPage");

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError("");
    setResult(null);
  };

  async function handleConvert() {
    if (files.length === 0 || !user) {
      setError("Please select at least one image");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const uploadedFileIds = await Promise.all(
        files.map(async (file) => {
          const uploaded = await storage.createFile(
            appwriteConfig.buckets.input,
            ID.unique(),
            file
          );
          return uploaded.$id;
        })
      );

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "CONVERT",
          status: "PENDING",
          inputFileIds: JSON.stringify(uploadedFileIds),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/img-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: uploadedFileIds,
          jobId: job.$id,
          fitOption,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert images to PDF");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Images to PDF</h1>
          <p className="text-secondary">
            Convert multiple images into a single PDF document
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Images (JPG, PNG, GIF)
            </label>
            <FileUploader
              onFilesSelected={handleFilesSelected}
              accept={[".jpg", ".jpeg", ".png", ".gif", ".webp"]}
              multiple={true}
              maxSize={50 * 1024 * 1024}
            />
          </div>

          {/* Fit Option Selection */}
          {files.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Image Fit Option
              </label>
              <select
                value={fitOption}
                onChange={(e) => setFitOption(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="fillPage">Fill Page (stretch to fit)</option>
                <option value="fitPage">Fit Page (shrink to fit)</option>
                <option value="maintainAspectRatio">Maintain Aspect Ratio</option>
              </select>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>{files.length}</strong> image{files.length > 1 ? "s" : ""} selected
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
                Images Converted to PDF!
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

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={files.length === 0 || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Converting to PDF...
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5" />
                Convert to PDF
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Images will be arranged in the order you select them. For best results, use high-quality images with similar dimensions.
          </p>
        </div>
      </div>
    </div>
  );
}
