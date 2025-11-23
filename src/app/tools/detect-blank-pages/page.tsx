"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, FileX } from "lucide-react";

export default function DetectBlankPagesToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [blankPages, setBlankPages] = useState<number[] | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setBlankPages(null);
    setError("");
  };

  async function handleDetectBlankPages() {
    if (!file || !user) {
      setError("Please select a PDF file");
      return;
    }

    setProcessing(true);
    setError("");
    setBlankPages(null);

    try {
      const uploadedPdf = await storage.createFile(
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
          operationType: "DETECT_BLANK_PAGES",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedPdf.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/detect-blank-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedPdf.$id,
          jobId: job.$id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to detect blank pages");
      }

      setBlankPages(data.blankPages);
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
          <h1 className="text-3xl font-bold text-white">Detect Blank Pages</h1>
          <p className="mt-2 text-gray-400">Identify blank pages in your PDF document.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">PDF File</label>
          <FileUploader
            onFilesSelected={handleFileSelected}
            accept={[".pdf"]}
            maxSize={30 * 1024 * 1024}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {blankPages && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileX className="h-5 w-5 text-primary" />
              Blank Pages Found
            </h3>
            {blankPages.length > 0 ? (
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-gray-300">
                  The following pages are blank:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {blankPages.map((page) => (
                    <span
                      key={page}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium"
                    >
                      Page {page}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-400">No blank pages detected.</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleDetectBlankPages}
          disabled={!file || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Detect Blank Pages"
          )}
        </button>
      </div>
    </div>
  );
}
