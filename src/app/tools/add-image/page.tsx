"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, FilePlus } from "lucide-react";

export default function AddImageToolPage() {
  const { user } = useAuth();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handlePdfSelected = (files: File[]) => {
    setPdfFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  const handleImageSelected = (files: File[]) => {
    setImageFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  async function handleAddImage() {
    if (!pdfFile || !imageFile || !user) {
      setError("Please select both PDF and image files");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const [uploadedPdf, uploadedImage] = await Promise.all([
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), pdfFile),
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), imageFile),
      ]);

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "ADD_IMAGE",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedPdf.$id, uploadedImage.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/add-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfFileId: uploadedPdf.$id,
          imageFileId: uploadedImage.$id,
          jobId: job.$id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add image to PDF");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Add Image to PDF</h1>
          <p className="text-secondary">
            Insert an image into your PDF document
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
          {/* PDF File Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select PDF File
            </label>
            <FileUploader
              onFilesSelected={handlePdfSelected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* Image File Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Image File
            </label>
            <FileUploader
              onFilesSelected={handleImageSelected}
              accept={[".jpg", ".jpeg", ".png", ".gif", ".webp"]}
              maxSize={10 * 1024 * 1024}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Image Added Successfully!
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

          {/* Add Image Button */}
          <button
            onClick={handleAddImage}
            disabled={!pdfFile || !imageFile || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Adding Image...
              </>
            ) : (
              <>
                <FilePlus className="h-5 w-5" />
                Add Image to PDF
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> The image will be added to your PDF. You can specify positioning and sizing options in advanced mode.
          </p>
        </div>
      </div>
    </div>
  );
}
