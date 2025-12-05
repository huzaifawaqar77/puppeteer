"use client";

import { useState } from "react";
import { Layers, Download, Trash2 } from "lucide-react";

export default function MergePdfsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf")
    );

    if (pdfFiles.length !== selectedFiles.length) {
      setError("Only PDF files are allowed");
      return;
    }

    setFiles([...files, ...pdfFiles]);
    setError("");
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  function moveFile(index: number, direction: "up" | "down") {
    const newFiles = [...files];
    if (direction === "up" && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [
        newFiles[index - 1],
        newFiles[index],
      ];
    } else if (direction === "down" && index < newFiles.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [
        newFiles[index + 1],
        newFiles[index],
      ];
    }
    setFiles(newFiles);
  }

  async function handleMerge(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (files.length < 2) {
      setError("Please select at least 2 PDF files");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/premium/merge-pdfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Merge failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "merged.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFiles([]);
    } catch (err: any) {
      setError(err.message || "Merge failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Layers className="w-8 h-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold">Merge PDFs</h1>
          <p className="text-gray-500">
            Combine multiple PDF files into a single document
          </p>
        </div>
      </div>

      <form onSubmit={handleMerge} className="space-y-6">
        {/* File Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Select PDF Files *
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
          </label>
          <p className="text-sm text-gray-600">
            Select 2 or more PDF files to merge. Files will be combined in the
            order shown below.
          </p>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
              Files to Merge ({files.length})
            </h3>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-semibold rounded-full text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveFile(idx, "up")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        disabled={loading}
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {idx < files.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveFile(idx, "down")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        disabled={loading}
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || files.length < 2}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>
            {loading
              ? "Merging..."
              : `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`}
          </span>
        </button>
      </form>
    </div>
  );
}
