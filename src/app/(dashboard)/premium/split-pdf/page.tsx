"use client";

import { useState } from "react";
import { Scissors, Download } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function SplitPdfPage() {
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

  async function handleSplit(e: React.FormEvent) {
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

      const response = await fetch("/api/premium/split-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Split failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name.replace(/\.pdf$/i, "-split.zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFile(null);
    } catch (err: any) {
      setError(err.message || "Split failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Scissors className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold">Split PDF</h1>
          <p className="text-gray-500">
            Extract individual pages from a PDF into separate files
          </p>
        </div>
      </div>

      <form onSubmit={handleSplit} className="space-y-6">
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong>
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Each page of your PDF will be saved as a separate PDF file</li>
            <li>All individual pages will be downloaded as a ZIP file</li>
            <li>
              Files will be named with the original filename and page number
            </li>
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
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>{loading ? "Splitting..." : "Split PDF"}</span>
        </button>
      </form>
    </div>
  );
}
