"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, PenTool } from "lucide-react";

export default function SignToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handlePdfSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  const handleSignatureSelected = (files: File[]) => {
    setSignatureImage(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleSign() {
    if (!file || !user) {
      setError("Please select a PDF file");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const uploadedPdf = await storage.createFile(appwriteConfig.buckets.input, ID.unique(), file);
      const uploadedSignature = signatureImage ? await storage.createFile(appwriteConfig.buckets.input, ID.unique(), signatureImage) : null;
      
      const job = await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.processingJobs, ID.unique(), {
        userId: user?.$id,
        operationType: "COMPRESS",
        status: "PENDING",
        inputFileIds: JSON.stringify([uploadedPdf.$id, ...(uploadedSignature ? [uploadedSignature.$id] : [])]),
        startedAt: new Date().toISOString(),
      });

      const response = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: uploadedPdf.$id, signatureFileId: uploadedSignature?.$id, jobId: job.$id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to sign PDF");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Sign PDF</h1>
          <p className="text-secondary">Add digital signature to your PDF document</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select PDF File</label>
            <FileUploader onFilesSelected={handlePdfSelected} accept={[".pdf"]} maxSize={30 * 1024 * 1024} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Signature Image (Optional)</label>
            <FileUploader onFilesSelected={handleSignatureSelected} accept={[".jpg", ".jpeg", ".png"]} maxSize={5 * 1024 * 1024} />
            <p className="mt-1 text-xs text-secondary">Upload a signature image to add to the PDF</p>
          </div>

          {error && (<div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">{error}</p></div>)}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">PDF Signed!</h3>
              <a href={result.url} download={result.filename} className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors">
                <Download className="h-4 w-4" /><span>Download {result.filename}</span>
              </a>
            </div>
          )}

          <button onClick={handleSign} disabled={!file || processing} className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2">
            {processing ? (<><Loader2 className="h-5 w-5 animate-spin" />Signing PDF...</>) : (<><PenTool className="h-5 w-5" />Sign PDF</>)}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900"><strong>Tip:</strong> Digital signatures provide authentication and ensure document integrity.</p>
        </div>
      </div>
    </div>
  );
}
