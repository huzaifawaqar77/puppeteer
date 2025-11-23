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

      // Upload file to Appwrite Storage
      const uploadedFile = await storage.createFile(
        appwriteConfig.buckets.input,
        ID.unique(),
        file
      );

      // Create processing job
      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "COMPRESS",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]), // Store as JSON string
          startedAt: new Date().toISOString(),
        }
      );

      // Call server action
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
      <div>
        <h1 className="text-3xl font-bold text-white">Compress PDF</h1>
        <p className="mt-2 text-gray-400">
          Reduce PDF file size while maintaining quality
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upload File</h2>
        <FileUploader
          onFilesSelected={(files) => setFile(files[0] || null)}
          accept={["application/pdf"]}
          multiple={false}
          maxSize={30}
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Compression Level</h2>
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="3"
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Low (Faster)</span>
            <span>Medium</span>
            <span>High (Smaller)</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Success!</h3>
          <div className="grid grid-cols-2 gap-4 mb-4 text-center">
            <div>
              <p className="text-sm text-gray-400">Original Size</p>
              <p className="text-xl font-semibold text-white">{formatFileSize(result.originalSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Compressed Size</p>
              <p className="text-xl font-semibold text-green-400">{formatFileSize(result.compressedSize)}</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mb-4">
            Saved {formatFileSize(result.originalSize - result.compressedSize)} (
            {((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)}%)
          </p>
          <a
            href={result.url}
            download={result.filename}
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-5 w-5" />
            Download Compressed PDF
          </a>
        </div>
      )}

      <button
        onClick={handleCompress}
        disabled={processing || !file}
        className="w-full py-4 px-6 bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
}
