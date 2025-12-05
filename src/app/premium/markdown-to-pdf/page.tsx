"use client";

import { useState } from "react";
import { FileText, Download, Plus, Trash2 } from "lucide-react";

export default function MarkdownToPdfPage() {
  const [files, setFiles] = useState<
    Array<{ id: string; name: string; content: string }>
  >([{ id: "1", name: "document.md", content: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paperWidth, setPaperWidth] = useState("8.5");
  const [paperHeight, setPaperHeight] = useState("11");
  const [marginTop, setMarginTop] = useState("0.5");
  const [marginBottom, setMarginBottom] = useState("0.5");
  const [marginLeft, setMarginLeft] = useState("0.5");
  const [marginRight, setMarginRight] = useState("0.5");
  const [landscape, setLandscape] = useState(false);
  const [scale, setScale] = useState(1);
  const [printBackground, setPrintBackground] = useState(true);
  const [omitBackground, setOmitBackground] = useState(false);
  const [waitDelay, setWaitDelay] = useState("0");
  const [emulatedMediaType, setEmulatedMediaType] = useState<
    "screen" | "print"
  >("print");

  function updateFile(id: string, field: "name" | "content", value: string) {
    setFiles(files.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  }

  function addFile() {
    const newId = Math.random().toString(36).substr(2, 9);
    setFiles([
      ...files,
      { id: newId, name: `document-${files.length + 1}.md`, content: "" },
    ]);
  }

  function removeFile(id: string) {
    if (files.length > 1) {
      setFiles(files.filter((f) => f.id !== id));
    }
  }

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate markdown content
    if (!files[0]?.content.trim()) {
      setError("Please enter markdown content");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/premium/markdown-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: files[0].content,
          paperWidth: paperWidth || undefined,
          paperHeight: paperHeight || undefined,
          marginTop: marginTop || undefined,
          marginBottom: marginBottom || undefined,
          marginLeft: marginLeft || undefined,
          marginRight: marginRight || undefined,
          landscape: landscape || undefined,
          scale: scale !== 1 ? scale : undefined,
          printBackground: printBackground || undefined,
          omitBackground: omitBackground || undefined,
          waitDelay: waitDelay !== "0" ? waitDelay : undefined,
          emulatedMediaType: emulatedMediaType || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Conversion failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "markdown-to-pdf.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFiles([{ id: "1", name: "document.md", content: "" }]);
    } catch (err: any) {
      setError(err.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <FileText className="w-8 h-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold">Markdown to PDF</h1>
          <p className="text-gray-500">
            Convert markdown documents to professional PDF files
          </p>
        </div>
      </div>

      <form onSubmit={handleConvert} className="space-y-6">
        {/* Markdown Files */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Markdown Files</h3>
            <button
              type="button"
              onClick={addFile}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              <span>Add File</span>
            </button>
          </div>

          {files.map((file, idx) => (
            <div
              key={file.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="block flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    Filename
                  </span>
                  <input
                    type="text"
                    value={file.name}
                    onChange={(e) =>
                      updateFile(file.id, "name", e.target.value)
                    }
                    placeholder="document.md"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    disabled={loading}
                  />
                </label>
                {files.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    disabled={loading}
                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 mt-6"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Content
                </span>
                <textarea
                  value={file.content}
                  onChange={(e) =>
                    updateFile(file.id, "content", e.target.value)
                  }
                  placeholder="# Heading&#10;&#10;Your markdown content here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1 font-mono text-sm"
                  disabled={loading}
                />
              </label>
            </div>
          ))}
        </div>

        {/* Page Setup */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Page Setup</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Paper Width (inches)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={paperWidth}
                onChange={(e) => setPaperWidth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Paper Height (inches)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={paperHeight}
                onChange={(e) => setPaperHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              />
            </label>
          </div>
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
        </div>

        {/* Margins */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Margins</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Top (inches)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={marginTop}
                onChange={(e) => setMarginTop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Bottom (inches)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={marginBottom}
                onChange={(e) => setMarginBottom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Left (inches)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={marginLeft}
                onChange={(e) => setMarginLeft(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Right (inches)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={marginRight}
                onChange={(e) => setMarginRight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* Rendering Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Rendering Options</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={printBackground}
                onChange={(e) => setPrintBackground(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700">
                Print Background Graphics
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={omitBackground}
                onChange={(e) => setOmitBackground(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700">
                Omit Background
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Scale</span>
              <input
                type="number"
                min="0.1"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Wait Delay (ms)
              </span>
              <input
                type="number"
                min="0"
                step="100"
                value={waitDelay}
                onChange={(e) => setWaitDelay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              />
            </label>
          </div>

          <label className="block pt-2">
            <span className="text-sm font-medium text-gray-700">
              Emulated Media Type
            </span>
            <select
              value={emulatedMediaType}
              onChange={(e) =>
                setEmulatedMediaType(e.target.value as "screen" | "print")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              disabled={loading}
            >
              <option value="print">Print</option>
              <option value="screen">Screen</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>{loading ? "Converting..." : "Convert Markdown to PDF"}</span>
        </button>
      </form>
    </div>
  );
}
