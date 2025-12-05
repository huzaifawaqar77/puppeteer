"use client";

import { useState } from "react";
import { FileCheck, Download } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function PdfToPdfAPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [format, setFormat] = useState<"PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b">(
    "PDF/A-2b"
  );

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

  async function handleConvert(e: React.FormEvent) {
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
      formData.append("pdfa", format);

      const response = await fetch("/api/premium/pdf-to-pdfa", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Conversion failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name.replace(/\.pdf$/i, `-${format}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFile(null);
    } catch (err: any) {
      setError(err.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <FileCheck className="w-8 h-8 text-cyan-500" />
        <div>
          <h1 className="text-3xl font-bold">PDF to PDF/A</h1>
          <p className="text-gray-500">
            Convert PDF to PDF/A archival format for long-term preservation
          </p>
        </div>
      </div>

      <form onSubmit={handleConvert} className="space-y-6">
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

        {/* PDF/A Format Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">PDF/A Format</h3>
          <div className="space-y-3">
            {[
              {
                value: "PDF/A-1b",
                label: "PDF/A-1b",
                description:
                  "Level B conformance. Ensures visual appearance is preserved. Most compatible.",
              },
              {
                value: "PDF/A-2b",
                label: "PDF/A-2b",
                description:
                  "Level B conformance (PDF 1.7 based). Supports compression and transparency. Recommended.",
              },
              {
                value: "PDF/A-3b",
                label: "PDF/A-3b",
                description:
                  "Level B conformance. Allows embedded files. Most flexible.",
              },
            ].map((option) => (
              <label key={option.value} className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={format === option.value}
                  onChange={(e) =>
                    setFormat(
                      e.target.value as "PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b"
                    )
                  }
                  className="w-4 h-4 mt-1 rounded border-gray-300"
                  disabled={loading}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Information */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-2">
          <p className="text-sm text-cyan-900">
            <strong>About PDF/A:</strong>
          </p>
          <ul className="text-sm text-cyan-800 space-y-1 list-disc list-inside">
            <li>PDF/A is an ISO standard for long-term archival of PDFs</li>
            <li>Ensures documents remain readable in the future</li>
            <li>Embeds all fonts and removes external dependencies</li>
            <li>Widely accepted for legal and government documents</li>
            <li>May change visual appearance or reduce file size</li>
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
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>{loading ? "Converting..." : "Convert to PDF/A"}</span>
        </button>
      </form>
    </div>
  );
}
