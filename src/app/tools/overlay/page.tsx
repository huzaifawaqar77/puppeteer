"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Layers } from "lucide-react";

export default function OverlayToolPage() {
  const { user } = useAuth();
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleBaseSelected = (files: File[]) => {
    setBaseFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  const handleOverlaySelected = (files: File[]) => {
    setOverlayFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleOverlay() {
    if (!baseFile || !overlayFile || !user) {
      setError("Please select both PDF files");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const [uploadedBase, uploadedOverlay] = await Promise.all([
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), baseFile),
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), overlayFile),
      ]);

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "OVERLAY",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedBase.$id, uploadedOverlay.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/overlay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseFileId: uploadedBase.$id,
          overlayFileId: uploadedOverlay.$id,
          jobId: job.$id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to overlay PDFs");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Overlay PDF</h1>
          <p className="text-secondary">
            Overlay one PDF onto another PDF document
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
          {/* Base PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Base PDF File
            </label>
            <FileUploader
              onFilesSelected={handleBaseSelected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
            <p className="mt-1 text-xs text-secondary">This will be the background document</p>
          </div>

          {/* Overlay PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Overlay PDF File
            </label>
            <FileUploader
              onFilesSelected={handleOverlaySelected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
            <p className="mt-1 text-xs text-secondary">This will be placed on top of the base</p>
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
                Overlay Complete!
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

          {/* Overlay Button */}
          <button
            onClick={handleOverlay}
            disabled={!baseFile || !overlayFile || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Overlaying PDFs...
              </>
            ) : (
              <>
                <Layers className="h-5 w-5" />
                Overlay PDFs
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Use case:</strong> Great for adding letterheads, stamps, or combining content from two PDFs.
          </p>
        </div>
      </div>
    </div>
  );
}
