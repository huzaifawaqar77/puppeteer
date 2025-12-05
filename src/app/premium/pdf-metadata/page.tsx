"use client";

import { useState } from "react";
import { BookOpen, Download, Trash2 } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

interface Metadata {
  [key: string]: string;
}

export default function PdfMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metadata, setMetadata] = useState<Metadata>({});
  const [mode, setMode] = useState<"read" | "write">("read");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  function handleFilesSelected(files: File[]) {
    if (files.length === 0) return;
    const f = files[0];
    if (!f.name.endsWith(".pdf") && f.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }
    setFile(f);
    setMetadata({});
    setError("");
  }

  async function handleReadMetadata(e: React.FormEvent) {
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
      formData.append("action", "read");

      const response = await fetch("/api/premium/pdf-metadata", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to read metadata");
      }

      const data = await response.json();
      // Extract all metadata fields from Gotenberg response
      const readableData: Metadata = {};
      if (data) {
        // The response has filename as the key, extract the actual metadata object
        const metadataObject =
          (Object.values(data)[0] as Record<string, any>) || {};
        // Display all metadata fields returned by Gotenberg
        Object.entries(metadataObject).forEach(([field, value]) => {
          if (value !== null && value !== undefined) {
            readableData[field] = String(value);
          }
        });
      }
      setMetadata(readableData);
    } catch (err: any) {
      setError(err.message || "Failed to read metadata");
    } finally {
      setLoading(false);
    }
  }

  function addMetadataField() {
    if (!newKey.trim()) {
      setError("Please enter a metadata key");
      return;
    }
    setMetadata({
      ...metadata,
      [newKey]: newValue,
    });
    setNewKey("");
    setNewValue("");
    setError("");
  }

  function removeMetadataField(key: string) {
    const { [key]: _, ...rest } = metadata;
    setMetadata(rest);
  }

  async function handleWriteMetadata(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    // Filter out empty values
    const nonEmptyMetadata = Object.fromEntries(
      Object.entries(metadata).filter(
        ([_, value]) => value && String(value).trim()
      )
    );

    if (Object.keys(nonEmptyMetadata).length === 0) {
      setError("Please add at least one metadata field with a value");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "write");
      formData.append("metadata", JSON.stringify(nonEmptyMetadata));

      const response = await fetch("/api/premium/pdf-metadata", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to write metadata");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name.replace(/\.pdf$/i, "-metadata.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFile(null);
      setMetadata({});
    } catch (err: any) {
      setError(err.message || "Failed to write metadata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <BookOpen className="w-8 h-8 text-teal-500" />
        <div>
          <h1 className="text-3xl font-bold">PDF Metadata</h1>
          <p className="text-gray-500">
            Read or write metadata information to PDF documents
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex space-x-4">
          {(["read", "write"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setMetadata({});
                setError("");
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === m
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {m === "read" ? "Read Metadata" : "Write Metadata"}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={mode === "read" ? handleReadMetadata : handleWriteMetadata}
        className="space-y-6"
      >
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

        {/* Metadata Display/Edit */}
        {mode === "read" ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Current Metadata</h3>
            {Object.keys(metadata).length === 0 ? (
              <p className="text-sm text-gray-600">
                No metadata found. Select a file and click "Read Metadata".
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-700">{key}</p>
                    <p className="text-sm text-gray-600 wrap-break-word">
                      {String(value || "")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Metadata Fields</h3>

            {/* Add Metadata Field */}
            <div className="border-t pt-4 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Key</span>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., title, author, subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                  disabled={loading}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Value</span>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                  disabled={loading}
                />
              </label>
              <button
                type="button"
                onClick={addMetadataField}
                disabled={loading}
                className="w-full px-3 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-50 rounded-lg font-medium text-sm transition-colors"
              >
                Add Field
              </button>
            </div>

            {/* Metadata List */}
            {Object.keys(metadata).length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Added Fields ({Object.keys(metadata).length})
                </p>
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{key}</p>
                      <p className="text-xs text-gray-600 truncate">{value}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMetadataField(key)}
                      className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>
            {loading
              ? mode === "read"
                ? "Reading..."
                : "Writing..."
              : mode === "read"
              ? "Read Metadata"
              : "Write Metadata"}
          </span>
        </button>
      </form>
    </div>
  );
}
