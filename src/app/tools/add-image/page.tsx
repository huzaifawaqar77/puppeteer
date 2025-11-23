"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Image as ImageIcon } from "lucide-react";

export default function AddImageToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelected = (files: File[]) => {
    setFile(files[0] ?? null);
  };

  const handleImageSelected = (files: File[]) => {
    setImageFile(files[0] ?? null);
  };

  async function handleAddImage() {
    if (!file || !imageFile || !user) {
      setError("Please select both a PDF file and an image file");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const [uploadedPdf, uploadedImage] = await Promise.all([
        storage.createFile(appwriteConfig.buckets.input, ID.unique(), file),
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
          pdfId: uploadedPdf.$id,
          imageId: uploadedImage.$id,
          jobId: job.$id,
          x,
          y,
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
        <div>
          <h1 className="text-3xl font-bold text-white">Add Image to PDF</h1>
          <p className="mt-2 text-gray-400">Add an image to your PDF document at specific coordinates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">PDF File</label>
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept={[".pdf"]}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Image File</label>
            <FileUploader
              onFilesSelected={handleImageSelected}
              accept={[".jpg", ".jpeg", ".png"]}
              maxSize={10 * 1024 * 1024}
            />
          </div>
        </div>

        {file && imageFile && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  X Coordinate
                </label>
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Y Coordinate
                </label>
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
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
              Image Added!
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
          onClick={handleAddImage}
          disabled={!file || !imageFile || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Add Image"
          )}
        </button>
      </div>
    </div>
  );
}
