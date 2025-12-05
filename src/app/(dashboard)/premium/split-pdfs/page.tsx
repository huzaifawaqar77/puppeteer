"use client";

import { useState } from "react";
import { Upload, Download, Loader2, Split } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function SplitPdfsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState("");
  const [unify, setUnify] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleFilesSelected(files: File[]) {
    if (files.length === 0) return;
    const f = files[0];
    if (!f.name.endsWith(".pdf") && f.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }
    setFile(f);
    setError("");
    setSuccess(false);
  }

  async function handleSplit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    if (!pageRanges.trim()) {
      setError("Please enter page ranges");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pageRanges", pageRanges);
      formData.append("unify", String(unify));

      const response = await fetch("/api/premium/split-pdfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to split PDF");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `split-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(true);
      setFile(null);
      setPageRanges("");
    } catch (err: any) {
      setError(err.message || "Failed to split PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Split className="w-8 h-8 text-cyan-500" />
          <h1 className="text-3xl font-bold">Split PDFs</h1>
        </div>
        <p className="text-gray-600">
          Extract specific pages or page ranges from your PDF files.
        </p>
      </div>

      <form onSubmit={handleSplit} className="space-y-6">
        {/* File Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Select PDF File</h3>
          <FileUploader onFilesSelected={handleFilesSelected} />
          {file && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {file.name}
              </p>
            </div>
          )}
        </div>

        {/* Page Ranges Input */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Ranges
            </label>
            <input
              type="text"
              value={pageRanges}
              onChange={(e) => setPageRanges(e.target.value)}
              placeholder="e.g., 1-3, 5, 7-9"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              Examples:
              <br />• <code className="bg-gray-100 px-2 py-1 rounded">
                1-3
              </code>{" "}
              - Extract pages 1 to 3
              <br />• <code className="bg-gray-100 px-2 py-1 rounded">
                1,5
              </code>{" "}
              - Extract pages 1 and 5
              <br />•{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">1-3,5,7-9</code> -
              Extract pages 1-3, 5, and 7-9
            </p>
          </div>

          {/* Quick Presets */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPageRanges("1")}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                First Page
              </button>
              <button
                type="button"
                onClick={() => setPageRanges("1-5")}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                First 5 Pages
              </button>
              <button
                type="button"
                onClick={() => setPageRanges("1-10")}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                First 10 Pages
              </button>
            </div>
          </div>

          {/* Unify Option */}
          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={unify}
                onChange={(e) => setUnify(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Put all extracted pages into a single file
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              When unchecked, each page range will be saved as a separate file
              in a ZIP archive.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            ✓ PDF split successfully! Your file has been downloaded.
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file || !pageRanges}
          className="w-full px-4 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Splitting PDF...
            </>
          ) : (
            <>
              <Split className="w-4 h-4" />
              Split PDF
            </>
          )}
        </button>
      </form>

      {/* Info Section */}
      <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How to use</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            1. <strong>Upload a PDF file</strong> using the file uploader
          </li>
          <li>
            2. <strong>Enter page ranges</strong> to extract (e.g., 1-3,5,7-9)
          </li>
          <li>
            3. <strong>Click "Split PDF"</strong> to extract the selected pages
          </li>
          <li>
            4. <strong>Download</strong> your new PDF with only the selected
            pages
          </li>
        </ul>
      </div>
    </div>
  );
}
