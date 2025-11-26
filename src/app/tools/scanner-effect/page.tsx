"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, ScanLine } from "lucide-react";

export default function ScannerEffectToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  
  // Scanner effect parameters
  const [noise, setNoise] = useState(0.5);
  const [blur, setBlur] = useState(0.5);
  const [rotation, setRotation] = useState(0); // Small random rotation
  const [quality, setQuality] = useState("1"); // 0=Low, 1=Medium, 2=High

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
        operationType: "COMPRESS",
        status: "PENDING",
        inputFileIds: JSON.stringify([uploadedFile.$id]),
        startedAt: new Date().toISOString(),
      });

      const response = await fetch("/api/scanner-effect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileId: uploadedFile.$id, 
          jobId: job.$id,
          noise,
          blur,
          rotation,
          quality
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to process PDF");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Scanner Effect</h1>
          <p className="text-secondary">Make your digital PDF look like a scanned document</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Select PDF File</label>
            <FileUploader onFilesSelected={handleFilesSelected} accept={[".pdf"]} maxSize={30 * 1024 * 1024} />
          </div>

          {file && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Noise Level ({noise})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={noise}
                  onChange={(e) => setNoise(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Blur Amount ({blur})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={blur}
                  onChange={(e) => setBlur(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rotation Variance ({rotation}°)</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Scan Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                >
                  <option value="0">Low (Gritty)</option>
                  <option value="1">Medium (Standard)</option>
                  <option value="2">High (Clean)</option>
                </select>
              </div>
            </div>
          )}

          {error && (<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">{error}</p></div>)}

          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Processing Complete!</h3>
              <a href={result.url} download={result.filename} className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors">
                <Download className="h-4 w-4" /><span>Download {result.filename}</span>
              </a>
            </div>
          )}

          <button onClick={handleConvert} disabled={!file || processing} className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2">
            {processing ? (<><Loader2 className="h-5 w-5 animate-spin" />Processing...</>) : (<><ScanLine className="h-5 w-5" />Apply Scanner Effect</>)}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900"><strong>Tip:</strong> Use this tool to make digital PDFs look like they were physically scanned. Great for forms that need to look "official" or "signed".</p>
        </div>
      </div>
    </div>
  );
}
