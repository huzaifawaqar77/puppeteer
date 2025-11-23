"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download } from "lucide-react";

export default function SplitToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string }[] | null>(null);
  const [error, setError] = useState<string>("");
  const [splitMode, setSplitMode] = useState<string>("PAGES");
  const [pageRange, setPageRange] = useState<string>("");

  async function handleSplit() {
    if (!file || !user) {
      setError("Please select a file");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
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
          operationType: "SPLIT",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      // Call split API
      const response = await fetch("/api/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          splitMode,
          pageRange,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to split PDF");
      }

      setResult(data.files);
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
        <h1 className="text-3xl font-bold text-white">Split PDF</h1>
        <p className="mt-2 text-gray-400">
          Split a PDF file into multiple documents
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upload File</h2>
        <FileUploader
          onFilesSelected={(files) => setFile(files[0] || null)}
          accept={[".pdf"]}
          maxSize={30}
        />
      </div>

      {file && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Split Options</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Split Mode
            </label>
            <select
              value={splitMode}
              onChange={(e) => setSplitMode(e.target.value)}
              className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="PAGES">Split by page range</option>
              <option value="FIXED_SIZE">Split into fixed size chunks</option>
              <option value="EXTRACT_SINGLE">Extract single page</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {splitMode === "PAGES" ? "Page Ranges (e.g., 1-3,5,7-9)" : 
               splitMode === "FIXED_SIZE" ? "Pages per file" : 
               "Page Number"}
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder={splitMode === "PAGES" ? "1-3,5,7-9" : "2"}
              className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
            Split Complete! Generated {result.length} file(s)
          </h3>
          <div className="space-y-2">
            {result.map((file, index) => (
              <a
                key={index}
                href={file.url}
                download={file.filename}
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{file.filename}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSplit}
        disabled={!file || processing}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          "Split PDF"
        )}
      </button>
      </div>
    </div>
  );
}
