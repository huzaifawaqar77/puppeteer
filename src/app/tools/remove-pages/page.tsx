"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Trash2 } from "lucide-react";

export default function RemovePagesToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [pages, setPages] = useState<string>("");

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
  };

  async function handleRemovePages() {
    if (!file || !user) {
      setError("Please select a file");
      return;
    }

    if (!pages) {
      setError("Please enter pages to remove");
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
          operationType: "REMOVE_PAGES",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/remove-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          pages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove pages");
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
          <h1 className="text-3xl font-bold text-white">Delete Pages</h1>
          <p className="mt-2 text-gray-400">Remove specific pages from your PDF document.</p>
        </div>

        <FileUploader
          onFilesSelected={handleFilesSelected}
          accept={[".pdf"]}
          maxSize={30 * 1024 * 1024}
        />

        {file && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pages to Remove</label>
              <div className="relative">
                <Trash2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g. 1,3,5-7"
                  className="w-full pl-10 pr-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter page numbers or ranges separated by commas (e.g. 1, 3-5)
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              Pages Removed!
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
          onClick={handleRemovePages}
          disabled={!file || !pages || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Delete Pages"
          )}
        </button>
      </div>
    </div>
  );
}
