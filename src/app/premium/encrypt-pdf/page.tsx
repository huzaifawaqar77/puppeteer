"use client";

import { useState } from "react";
import { Lock, Download } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function EncryptPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

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

  async function handleEncrypt(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    if (!userPassword.trim()) {
      setError("Please enter a user password");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userPassword", userPassword);
      if (ownerPassword) {
        formData.append("ownerPassword", ownerPassword);
      }

      const response = await fetch("/api/premium/encrypt-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Encryption failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "encrypted.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFile(null);
      setUserPassword("");
      setOwnerPassword("");
    } catch (err: any) {
      setError(err.message || "Encryption failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Lock className="w-8 h-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold">Encrypt PDF</h1>
          <p className="text-gray-500">
            Protect your PDF with password encryption
          </p>
        </div>
      </div>

      <form onSubmit={handleEncrypt} className="space-y-6">
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

        {/* Password Protection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Password Protection</h3>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              User Password *
            </span>
            <div className="relative mt-1">
              <input
                type={showUserPassword ? "text" : "password"}
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Enter password to open PDF"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowUserPassword(!showUserPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showUserPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Users will need this password to open the PDF
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Owner Password (Optional)
            </span>
            <div className="relative mt-1">
              <input
                type={showOwnerPassword ? "text" : "password"}
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="Leave empty if not needed"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showOwnerPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Owner password controls document permissions (copying, printing,
              etc.)
            </p>
          </label>
        </div>

        {/* Information */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
          <p className="text-sm text-purple-900">
            <strong>Password Protection:</strong>
          </p>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>User password: Required to open/read the document</li>
            <li>
              Owner password: Controls printing, copying, and editing
              permissions
            </li>
            <li>Both passwords are optional but recommended for security</li>
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
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>{loading ? "Encrypting..." : "Encrypt PDF"}</span>
        </button>
      </form>
    </div>
  );
}
