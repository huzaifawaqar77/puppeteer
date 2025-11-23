"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Image as ImageIcon } from "lucide-react";

export default function ImageToPdfToolPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [fitOption, setFitOption] = useState<string>("fillPage");

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  async function handleConvert() {
    if (files.length === 0 || !user) {
      setError("Please select at least one image");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      // Upload all files to Appwrite Storage
      const uploadedFileIds = await Promise.all(
        files.map(async (file) => {
          const uploaded = await storage.createFile(
            appwriteConfig.buckets.input,
            ID.unique(),
            file
          );
          return uploaded.$id;
        })
      );

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "IMG_TO_PDF",
          status: "PENDING",
          inputFileIds: JSON.stringify(uploadedFileIds),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/img-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: uploadedFileIds,
          jobId: job.$id,
          fitOption,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert images to PDF");
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
          <h1 className="text-3xl font-bold text-white">Image to PDF</h1>
          <p className="mt-2 text-gray-400">Convert multiple images into a single PDF document.</p>
        </div>

        <FileUploader
          onFilesSelected={handleFilesSelected}
          accept={[".jpg", ".jpeg", ".png", ".gif"]}
          multiple={true}
          maxSize={50 * 1024 * 1024}
        />

        {files.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fit Option</label>
              <select
                value={fitOption}
                onChange={(e) => setFitOption(e.target.value)}
                className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="fillPage">Fill Page</option>
                <option value="fitPage">Fit Page</option>
                <option value="maintainAspectRatio">Maintain Aspect Ratio</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-400">{files.length} images selected</p>
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
              Conversion Complete!
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
          onClick={handleConvert}
          disabled={files.length === 0 || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Convert to PDF"
          )}
        </button>
      </div>
    </div>
  );
}
