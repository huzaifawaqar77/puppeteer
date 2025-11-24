"use client";

import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { useAuth } from "@/contexts/AuthContext";

export default function CompressToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string; originalSize: number; compressedSize: number } | null>(null);
  const [error, setError] = useState<string>("");
  const [compressionLevel, setCompressionLevel] = useState<number>(1);

  const handleFileSelected = (files: File[]) => {
    setFile(files[0] || null);
    setError("");
    setResult(null);
  };

  async function handleCompress() {
    if (!file) {
      setError("Please upload a PDF file");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const originalSize = file.size;

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

      const response = await fetch("/api/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          compressionLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to compress PDF");
      }

      const data = await response.json();
      setResult({
        url: data.downloadUrl,
        filename: data.filename,
        originalSize,
        compressedSize: data.size,
      });

    } catch (err: any) {
      setError(err.message || "Failed to compress PDF file");
    } finally {
      setProcessing(false);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Compress PDF</h1>
          <p className="text-secondary">
            Reduce PDF file size while maintaining quality
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
              onFilesSelected={handleFileSelected}
              accept={["application/pdf"]}
              multiple={false}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* Compression Level */}
          {file && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                Compression Level
              </label>
              <input
                type="range"
                min="1"
                max="3"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-sm text-secondary mt-2">
                <span>Low (Faster)</span>
                <span>Medium</span>
                <span>High (Smaller)</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 text-center">
                Compression Complete!
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div>
                  <p className="text-sm text-secondary">Original Size</p>
                  <p className="text-xl font-semibold text-foreground">{formatFileSize(result.originalSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary">Compressed Size</p>
                  <p className="text-xl font-semibold text-green-700">{formatFileSize(result.compressedSize)}</p>
                </div>
              </div>
              <p className="text-center text-sm text-secondary mb-4">
                Saved {formatFileSize(result.originalSize - result.compressedSize)} (
                {((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)}% reduction)
              </p>
              <a
                href={result.url}
                download={result.filename}
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Download className="h-5 w-5" />
                Download Compressed PDF
              </a>
            </div>
          )}

          {/* Compress Button */}
          <button
            onClick={handleCompress}
            disabled={processing || !file}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Compressing...
              </>
            ) : (
              "Compress PDF"
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Higher compression levels will take longer but produce smaller files. Try 'Medium' for a good balance.
          </p>
        </div>
      </div>
    </div>
  );
}
