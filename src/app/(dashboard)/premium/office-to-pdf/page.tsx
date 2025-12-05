"use client";

import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function OfficeToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [landscape, setLandscape] = useState(false);
  const [nativePageRanges, setNativePageRanges] = useState("");
  const [singlePage, setSinglePage] = useState(false);
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [pdfa, setPdfA] = useState<"PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b" | "">(
    ""
  );
  const [pdfua, setPdfua] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docAuthor, setDocAuthor] = useState("");
  const [docSubject, setDocSubject] = useState("");

  function handleFilesSelected(files: File[]) {
    if (files.length === 0) return;
    const f = files[0];
    const allowedFormats = [
      "doc",
      "docx",
      "odt",
      "rtf",
      "txt",
      "xls",
      "xlsx",
      "ods",
      "csv",
      "tsv",
      "ppt",
      "pptx",
      "odp",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "svg",
      "tiff",
    ];

    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedFormats.includes(ext)) {
      setError(`Unsupported file format: ${ext}`);
      return;
    }

    setFile(f);
    setError("");
  }

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const options = {
        landscape: landscape || undefined,
        nativePageRanges: nativePageRanges || undefined,
        singlePage: singlePage || undefined,
        userPassword: userPassword || undefined,
        ownerPassword: ownerPassword || undefined,
        pdfa: pdfa || undefined,
        pdfua: pdfua || undefined,
        metadata: {
          ...(docTitle && { title: docTitle }),
          ...(docAuthor && { author: docAuthor }),
          ...(docSubject && { subject: docSubject }),
        },
      };

      formData.append("options", JSON.stringify(options));

      const response = await fetch("/api/premium/office-to-pdf", {
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
      link.download = file.name.replace(/\.[^.]+$/, ".pdf");
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
        <FileText className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold">Office to PDF</h1>
          <p className="text-gray-500">
            Convert Word, Excel, PowerPoint, and other office documents to PDF
          </p>
        </div>
      </div>

      <form onSubmit={handleConvert} className="space-y-6">
        {/* File Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Select Office Document *
            </span>
          </label>
          <FileUploader
            onFilesSelected={handleFilesSelected}
            accept={[
              ".doc",
              ".docx",
              ".odt",
              ".rtf",
              ".txt",
              ".xls",
              ".xlsx",
              ".ods",
              ".csv",
              ".tsv",
              ".ppt",
              ".pptx",
              ".odp",
              ".jpg",
              ".jpeg",
              ".png",
              ".gif",
              ".bmp",
              ".svg",
              ".tiff",
            ]}
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
          <p className="text-sm text-gray-600">
            Supported formats: DOC, DOCX, ODT, RTF, TXT, XLS, XLSX, ODS, CSV,
            TSV, PPT, PPTX, ODP, JPG, PNG, GIF, BMP, SVG, TIFF
          </p>
        </div>

        {/* Page Setup */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Page Setup</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={landscape}
              onChange={(e) => setLandscape(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
              disabled={loading}
            />
            <span className="text-sm font-medium text-gray-700">
              Landscape Orientation
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={singlePage}
              onChange={(e) => setSinglePage(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
              disabled={loading}
            />
            <span className="text-sm font-medium text-gray-700">
              Single Page
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Page Ranges (e.g., 1-3, 5)
            </span>
            <input
              type="text"
              value={nativePageRanges}
              onChange={(e) => setNativePageRanges(e.target.value)}
              placeholder="Leave empty for all pages"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              disabled={loading}
            />
          </label>
        </div>

        {/* Security & Compliance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Security & Compliance</h3>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              PDF/A Format
            </span>
            <select
              value={pdfa}
              onChange={(e) =>
                setPdfA(
                  e.target.value as "PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b" | ""
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              disabled={loading}
            >
              <option value="">None</option>
              <option value="PDF/A-1b">PDF/A-1b</option>
              <option value="PDF/A-2b">PDF/A-2b</option>
              <option value="PDF/A-3b">PDF/A-3b</option>
            </select>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={pdfua}
              onChange={(e) => setPdfua(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
              disabled={loading}
            />
            <span className="text-sm font-medium text-gray-700">
              PDF/UA (Universal Accessibility)
            </span>
          </label>
        </div>

        {/* Password Protection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Password Protection</h3>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              User Password
            </span>
            <input
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder="Leave empty for no protection"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              disabled={loading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Password for opening the PDF
            </p>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Owner Password
            </span>
            <input
              type="password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder="Leave empty for no protection"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              disabled={loading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Password for document permissions
            </p>
          </label>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Document Metadata</h3>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Title</span>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              disabled={loading}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Author</span>
            <input
              type="text"
              value={docAuthor}
              onChange={(e) => setDocAuthor(e.target.value)}
              placeholder="Author name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              disabled={loading}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Subject</span>
            <input
              type="text"
              value={docSubject}
              onChange={(e) => setDocSubject(e.target.value)}
              placeholder="Document subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              disabled={loading}
            />
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>{loading ? "Converting..." : "Convert to PDF"}</span>
        </button>
      </form>
    </div>
  );
}
