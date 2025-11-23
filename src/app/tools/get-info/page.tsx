"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Info } from "lucide-react";

export default function GetInfoToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setInfo(null);
    setError("");
  };

  async function handleGetInfo() {
    if (!file || !user) {
      setError("Please select a PDF file");
      return;
    }

    setProcessing(true);
    setError("");
    setInfo(null);

    try {
      const uploadedPdf = await storage.createFile(
        appwriteConfig.buckets.input,
        ID.unique(),
        file
      );

      // We don't necessarily need a job for this as it's a quick synchronous check,
      // but keeping it for consistency and history tracking is good.
      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "GET_INFO",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedPdf.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/get-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedPdf.$id,
          jobId: job.$id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get PDF info");
      }

      setInfo(data.info);
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
          <h1 className="text-3xl font-bold text-white">Get PDF Information</h1>
          <p className="mt-2 text-gray-400">View detailed metadata and information about your PDF document.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">PDF File</label>
          <FileUploader
            onFilesSelected={handleFileSelected}
            accept={[".pdf"]}
            maxSize={30 * 1024 * 1024}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {info && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              PDF Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {Object.entries(info).map(([key, value]) => (
                <div key={key} className="bg-black/20 p-3 rounded-lg">
                  <span className="block text-gray-400 capitalize mb-1">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-white font-medium break-all">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleGetInfo}
          disabled={!file || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Get Info"
          )}
        </button>
      </div>
    </div>
  );
}
