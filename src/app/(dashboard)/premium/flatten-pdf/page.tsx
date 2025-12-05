"use client";

import { useState } from "react";
import { Layers, Download } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function FlattenPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFilesSelected(files: File[]) {
    if (files.length === 0) return;
    const f = files[0];
    if (!f.name.endsWith(".pdf") && f.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }
    setFile(f);
    setError("");
  }

  async function handleFlatten(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/premium/flatten-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Flatten failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "flattened.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFile(null);
    } catch (err: any) {
      setError(err.message || "Flatten failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Layers className="w-8 h-8 text-indigo-500" />
        <div>
          <h1 className="text-3xl font-bold">Flatten PDF</h1>
          <p className="text-gray-500">
            Remove form fields and flatten all layers into a single image layer
          </p>
        </div>
      </div>

      <form onSubmit={handleFlatten} className="space-y-6">
        {/* File Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Select PDF File *
            </span>
          </label>
          <FileUploader
            onFilesSelected={handleFilesSelected}
            accept={["application/pdf"]}
          />
          {file && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Selected:</strong> {file.name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2">
          <p className="text-sm text-indigo-900">
            <strong>What flattening does:</strong>
          </p>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            <li>Converts all form fields to static text</li>
            <li>Merges all layers into a single layer</li>
            <li>Removes editability - makes PDF non-interactive</li>
            <li>Useful for archiving completed forms</li>
            <li>Reduces file size in some cases</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>{loading ? "Flattening..." : "Flatten PDF"}</span>
        </button>
      </form>
    </div>
  );
}
