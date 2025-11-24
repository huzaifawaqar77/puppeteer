"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Type } from "lucide-react";

export default function AddTextToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [text, setText] = useState<string>("");

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleAddText() {
    if (!file || !user) {
      setError("Please select a file");
      return;
    }

    if (!text) {
      setError("Please enter text to add");
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
          operationType: "ADD_TEXT",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/add-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add text to PDF");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Add Text to PDF</h1>
          <p className="text-secondary">
            Add custom text content to your PDF document
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
              onFilesSelected={handleFilesSelected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* Text Input */}
          {file && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Text to Add
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to add to the PDF..."
                rows={4}
                className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-secondary/50 resize-none"
              />
              <p className="mt-2 text-xs text-secondary">
                The text will be added to your PDF document
              </p>
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
                Text Added Successfully!
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

          {/* Add Text Button */}
          <button
            onClick={handleAddText}
            disabled={!file || !text || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Adding Text...
              </>
            ) : (
              <>
                <Type className="h-5 w-5" />
                Add Text
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> You can customize font, size, color, and position in the advanced settings.
          </p>
        </div>
      </div>
    </div>
  );
}
