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
  const [certFile, setCertFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelected = (files: File[]) => {
    setFile(files[0] ?? null);
  };

  const handleCertSelected = (files: File[]) => {
    setCertFile(files[0] ?? null);
  };

  async function handleSign() {
    if (!file || !certFile || !user) {
      setError("Please select both a PDF file and a certificate");
      return;
    }

    if (!password) {
      setError("Please enter the certificate password");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      // Upload PDF
      const uploadedPdf = await storage.createFile(
        appwriteConfig.buckets.input,
        ID.unique(),
        file
      );

      // Upload Certificate
      const uploadedCert = await storage.createFile(
        appwriteConfig.buckets.input,
        ID.unique(),
        certFile
      );

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "SIGN",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedPdf.$id, uploadedCert.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedPdf.$id,
          certFileId: uploadedCert.$id,
          jobId: job.$id,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign PDF");
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
          <h1 className="text-3xl font-bold text-white">Sign PDF</h1>
          <p className="mt-2 text-gray-400">Digitally sign your PDF with a certificate (.p12 or .pfx).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">PDF Document</label>
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Certificate (.p12 / .pfx)</label>
            <FileUploader
              onFilesSelected={handleCertSelected}
              accept={[".p12", ".pfx"]}
              maxSize={5 * 1024 * 1024}
            />
          </div>
        </div>

        {(file && certFile) && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Certificate Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter certificate password"
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
              PDF Signed Successfully!
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
          onClick={handleSign}
          disabled={!file || !certFile || !password || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Sign PDF"
          )}
        </button>
      </div>
    </div>
  );
}
