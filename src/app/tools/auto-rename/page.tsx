"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, FileSignature } from "lucide-react";

export default function AutoRenameToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [useFallback, setUseFallback] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleConvert() {
    if (!file || !user) {
      setError("Please select a file");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const uploadedFile = await storage.createFile(appwriteConfig.buckets.input, ID.unique(), file);
      const job = await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.processingJobs, ID.unique(), {
        userId: user?.$id,
        operationType: "AUTO_RENAME",
        status: "PENDING",
        inputFileIds: JSON.stringify([uploadedFile.$id]),
        startedAt: new Date().toISOString(),
      });

      const response = await fetch("/api/auto-rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileId: uploadedFile.$id, 
          jobId: job.$id,
          useFirstTextAsFallback: useFallback
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to rename PDF");
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Auto Rename</h1>
          <p className="text-secondary">Automatically rename PDF files based on their content (headers/titles)</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Select PDF File</label>
            <FileUploader onFilesSelected={handleFilesSelected} accept={[".pdf"]} maxSize={30 * 1024 * 1024} />
          </div>

          {file && (
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFallback}
                  onChange={(e) => setUseFallback(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">Use first text found as fallback if no title is detected</span>
              </label>
            </div>
          )}

          {error && (<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">{error}</p></div>)}

          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Renaming Complete!</h3>
              <p className="text-sm text-green-800 mb-4">New filename: <strong>{result.filename}</strong></p>
              <a href={result.url} download={result.filename} className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors">
                <Download className="h-4 w-4" /><span>Download Renamed File</span>
              </a>
            </div>
          )}

          <button onClick={handleConvert} disabled={!file || processing} className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2">
            {processing ? (<><Loader2 className="h-5 w-5 animate-spin" />Processing...</>) : (<><FileSignature className="h-5 w-5" />Auto Rename PDF</>)}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900"><strong>How it works:</strong> The tool analyzes the document structure to find the most likely title or header and renames the file accordingly.</p>
        </div>
      </div>
    </div>
  );
}
