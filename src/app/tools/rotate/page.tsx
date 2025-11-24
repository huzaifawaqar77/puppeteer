"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, RotateCw } from "lucide-react";

export default function RotateToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [angle, setAngle] = useState<number>(90);

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleRotate() {
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
          operationType: "ROTATE",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          angle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rotate PDF");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Rotate PDF</h1>
          <p className="text-secondary">
            Rotate pages in your PDF document clockwise
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

          {/* Rotation Angle Selection */}
          {file && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Rotation Angle
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setAngle(deg)}
                    className={`py-4 px-4 rounded-lg border-2 transition-all ${
                      angle === deg
                        ? "bg-primary text-white border-primary shadow-glow-orange"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RotateCw className="h-6 w-6" style={{ transform: `rotate(${deg}deg)` }} />
                      <span className="font-semibold">{deg}°</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-secondary">
                All pages will be rotated by {angle} degrees clockwise
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
                Rotation Complete!
              </h3>
              <p className="text-sm text-green-800 mb-4">
                Your PDF pages have been rotated by {angle} degrees.
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

          {/* Rotate Button */}
          <button
            onClick={handleRotate}
            disabled={!file || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Rotating PDF...
              </>
            ) : (
              <>
                <RotateCw className="h-5 w-5" />
                Rotate PDF
              </>
            )}
          </button>
        </div>


        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> This operation rotates all pages in the document. For selective page rotation, use the split and merge tools.
          </p>
        </div>
      </div>
    </div>
  );
}
