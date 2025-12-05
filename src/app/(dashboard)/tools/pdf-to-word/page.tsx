"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, FileText } from "lucide-react";

export default function PdfToWordToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<"doc" | "docx">("docx");

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
        operationType: "CONVERT",
        status: "PENDING",
        inputFileIds: JSON.stringify([uploadedFile.$id]),
        startedAt: new Date().toISOString(),
      });

      const response = await fetch("/api/pdf-to-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: uploadedFile.$id, jobId: job.$id, outputFormat }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to convert PDF");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">PDF to Word</h1>
          <p className="text-secondary">Convert PDF documents to editable Word files</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Select PDF File</label>
            <FileUploader onFilesSelected={handleFilesSelected} accept={[".pdf"]} maxSize={30 * 1024 * 1024} />
          </div>

          {file && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Output Format</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOutputFormat("docx")}
                  className={`py-3 px-4 rounded-lg border transition-all ${
                    outputFormat === "docx"
                      ? "bg-primary text-white border-primary shadow-glow-orange"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  Word 2007+ (.docx)
                </button>
                <button
                  onClick={() => setOutputFormat("doc")}
                  className={`py-3 px-4 rounded-lg border transition-all ${
                    outputFormat === "doc"
                      ? "bg-primary text-white border-primary shadow-glow-orange"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  Word 97-2003 (.doc)
                </button>
              </div>
            </div>
          )}

          {error && (<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">{error}</p></div>)}

          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Conversion Complete!</h3>
              <a href={result.url} download={result.filename} className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors">
                <Download className="h-4 w-4" /><span>Download {result.filename}</span>
              </a>
            </div>
          )}

          <button onClick={handleConvert} disabled={!file || processing} className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2">
            {processing ? (<><Loader2 className="h-5 w-5 animate-spin" />Converting...</>) : (<><FileText className="h-5 w-5" />Convert to Word</>)}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900"><strong>Tip:</strong> For best results, ensure your PDF contains selectable text. Scanned PDFs may require OCR first.</p>
        </div>
      </div>
    </div>
  );
}
