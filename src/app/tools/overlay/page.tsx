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
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFile1Selected = (files: File[]) => {
    setFile1(files[0] ?? null);
  };

  const handleFile2Selected = (files: File[]) => {
    setFile2(files[0] ?? null);
  };

  async function handleOverlay() {
    if (!file1 || !file2 || !user) {
      setError("Please select two PDF files");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const [uploadedFile1, uploadedFile2] = await Promise.all([
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), file1),
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), file2),
      ]);

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "OVERLAY_PDF",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile1.$id, uploadedFile2.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/overlay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file1Id: uploadedFile1.$id,
          file2Id: uploadedFile2.$id,
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
        <div>
          <h1 className="text-3xl font-bold text-white">Overlay PDF</h1>
          <p className="mt-2 text-gray-400">Overlay one PDF document on top of another.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Base PDF</label>
            <FileUploader
              onFilesSelected={handleFile1Selected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Overlay PDF</label>
            <FileUploader
              onFilesSelected={handleFile2Selected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              Overlay Complete!
            </h3>
            <a
              href={result.url}
              download={result.filename}
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download {result.filename}</span>
            </a>
          </div>
        )}

        <button
          onClick={handleOverlay}
          disabled={!file1 || !file2 || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Overlay PDFs"
          )}
        </button>
      </div>
    </div>
  );
}
