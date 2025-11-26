"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download } from "lucide-react";

const languages = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "rus", label: "Russian" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "ara", label: "Arabic" },
  { value: "hin", label: "Hindi" },
];

export default function OcrToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("eng");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleOcr() {
    if (!file || !user) {
      setError("Please select a file");
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
          operationType: "OCR",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to perform OCR");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">OCR PDF</h1>
          <p className="text-secondary">
            Make scanned PDFs searchable and selectable using OCR
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

          {/* Language Selection */}
          {file && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Document Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-secondary">
                Select the primary language of your document for best results
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
                OCR Complete!
              </h3>
              <p className="text-sm text-green-800 mb-4">
                Your PDF has been processed and text is now searchable and selectable.
              </p>
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

          {/* OCR Button */}
          <button
            onClick={handleOcr}
            disabled={!file || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing OCR...
              </>
            ) : (
              "Start OCR"
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> OCR (Optical Character Recognition) works best with clear, high-quality scans. Processing time depends on document length.
          </p>
        </div>
      </div>
    </div>
  );
}
