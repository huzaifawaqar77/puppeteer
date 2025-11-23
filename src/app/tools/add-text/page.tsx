"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Type } from "lucide-react";

export default function AddTextToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const [color, setColor] = useState("#000000");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelected = (files: File[]) => {
    setFile(files[0] ?? null);
  };

  async function handleAddText() {
    if (!file || !text || !user) {
      setError("Please select a PDF file and enter text");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const uploadedPdf = await storage.createFile(
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
          operationType: "ADD_TEXT",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedPdf.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/add-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedPdf.$id,
          jobId: job.$id,
          text,
          x,
          y,
          fontSize,
          color,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add text to PDF");
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
          <h1 className="text-3xl font-bold text-white">Add Text to PDF</h1>
          <p className="mt-2 text-gray-400">Add custom text to your PDF document at specific coordinates.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">PDF File</label>
          <FileUploader
            onFilesSelected={handleFileSelected}
            accept={[".pdf"]}
            maxSize={30 * 1024 * 1024}
          />
        </div>

        {file && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Text Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white h-24 resize-none"
                placeholder="Enter text to add..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size
                </label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color (Hex)
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 bg-black/20 border border-white/10 rounded-lg px-2 py-1 cursor-pointer"
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
              Text Added!
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
          onClick={handleAddText}
          disabled={!file || !text || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Add Text"
          )}
        </button>
      </div>
    </div>
  );
}
