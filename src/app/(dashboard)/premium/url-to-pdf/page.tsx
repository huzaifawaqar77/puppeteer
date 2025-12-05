"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { useApiKey } from "@/contexts/ApiKeyContext";
import { useAuth } from "@/contexts/AuthContext";

export default function UrlToPdfPage() {
  const { user } = useAuth();
  const {
    apiKey,
    isLoading: isLoadingApiKey,
    error: apiKeyError,
  } = useApiKey();
  const [url, setUrl] = useState("");
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
  const [singlePage, setSinglePage] = useState(false);
  const [waitDelay, setWaitDelay] = useState("0");
  const [emulatedMediaType, setEmulatedMediaType] = useState<
    "screen" | "print"
  >("print");
  const [pdfA, setPdfA] = useState<"PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b" | "">(
    ""
  );
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [flatten, setFlatten] = useState(false);

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      setLoading(true);

      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("/api/premium/url-to-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.$id}`,
        },
        body: JSON.stringify({
          url,
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
          singlePage: singlePage || undefined,
          waitDelay: waitDelay !== "0" ? waitDelay : undefined,
          emulatedMediaType: emulatedMediaType || undefined,
          pdfa: pdfA || undefined,
          userPassword: userPassword || undefined,
          ownerPassword: ownerPassword || undefined,
          flatten: flatten || undefined,
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
      link.download = "url-to-pdf.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setUrl("");
    } catch (err: any) {
      setError(err.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Download className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">URL to PDF</h1>
          <p className="text-gray-500">
            Convert any website or URL to a high-quality PDF document
          </p>
        </div>
      </div>

      {/* API Key Status */}
      {isLoadingApiKey && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">Loading your API key...</p>
        </div>
      )}

      {!isLoadingApiKey && !apiKey && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Premium API key not found</p>
          <p className="text-red-700 text-sm mt-1">
            Go to{" "}
            <a href="/api-docs" className="underline hover:text-red-900">
              API Docs
            </a>{" "}
            to generate a premium API key first.
          </p>
        </div>
      )}

      {!isLoadingApiKey && apiKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            ✓ Using premium API key:{" "}
            <span className="font-mono font-semibold">
              {apiKey.keyPrefix}...
            </span>
          </p>
        </div>
      )}

      <form onSubmit={handleConvert} className="space-y-6">
        {/* URL Input */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Website URL *
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={loading}
              required
            />
          </label>
          <p className="text-sm text-gray-600">
            Enter the full URL of the website you want to convert to PDF
          </p>
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

        {/* Security Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Security & Compliance</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                PDF/A Format
              </span>
              <select
                value={pdfA}
                onChange={(e) =>
                  setPdfA(
                    e.target.value as "PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b" | ""
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                disabled={loading}
              >
                <option value="">None</option>
                <option value="PDF/A-1b">PDF/A-1b</option>
                <option value="PDF/A-2b">PDF/A-2b</option>
                <option value="PDF/A-3b">PDF/A-3b</option>
              </select>
            </label>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={flatten}
              onChange={(e) => setFlatten(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
              disabled={loading}
            />
            <span className="text-sm font-medium text-gray-700">
              Flatten PDF
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              disabled={loading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Password for document permissions
            </p>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !apiKey || isLoadingApiKey}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>
            {loading
              ? "Converting..."
              : !apiKey || isLoadingApiKey
              ? "Loading API key..."
              : "Convert URL to PDF"}
          </span>
        </button>
      </form>
    </div>
  );
}
