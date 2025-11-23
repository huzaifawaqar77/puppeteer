"use client";

import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, AlertCircle } from "lucide-react";
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

  async function handleMerge() {
    if (files.length < 2) {
      setError("Please upload at least 2 PDF files to merge");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      // Upload files to Appwrite Storage
      const uploadPromises = files.map((file) =>
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), file)
      );
      const uploadedFiles = await Promise.all(uploadPromises);

      // Create processing job
      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "MERGE",
          status: "PENDING",
          inputFileIds: JSON.stringify(uploadedFiles.map((f) => f.$id)), // Store as JSON string
          startedAt: new Date().toISOString(),
        }
      );

      // Call server action to process
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
        <div>
          <h1 className="text-3xl font-bold text-white">Merge PDFs</h1>
          <p className="mt-2 text-gray-400">
            Combine multiple PDF files into a single document
          </p>
        </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upload Files</h2>
        <FileUploader
          onFilesSelected={setFiles}
          accept={["application/pdf"]}
          multiple={true}
          maxSize={30}
        />

        {files.length > 0 && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
            <p className="text-sm text-blue-400">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Success!</h3>
          <p className="text-gray-400 mb-4">Your PDFs have been merged</p>
          <a
            href={result.url}
            download={result.filename}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-5 w-5" />
            Download Merged PDF
          </a>
        </div>
      )}

      <button
        onClick={handleMerge}
        disabled={processing || files.length < 2}
        className="w-full py-4 px-6 bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
}
