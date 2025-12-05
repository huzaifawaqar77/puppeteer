"use client";

import { useState } from "react";
import { Download, Loader2, Camera } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function ScreenshotsPage() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [scale, setScale] = useState(1);
  const [delay, setDelay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  async function handleTakeScreenshot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPreview(null);

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("url", url);
      formData.append("format", format);
      formData.append("width", width.toString());
      formData.append("height", height.toString());
      formData.append("scale", scale.toString());
      if (delay > 0) {
        formData.append("delay", delay.toString());
      }

      const response = await fetch("/api/premium/screenshots", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to take screenshot");
      }

      const blob = await response.blob();

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(blob);

      // Also offer download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `screenshot.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      setError(err.message || "Failed to take screenshot");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Camera className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl font-bold">Website Screenshots</h1>
        </div>
        <p className="text-gray-600">
          Capture screenshots of any website as PNG, JPEG, or WebP images.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form onSubmit={handleTakeScreenshot} className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="png">PNG (Lossless)</option>
                  <option value="jpeg">JPEG (Compressed)</option>
                  <option value="webp">WebP (Modern)</option>
                </select>
              </div>

              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width: {width}px
                </label>
                <input
                  type="range"
                  min="800"
                  max="3840"
                  step="100"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setWidth(1024)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    1024
                  </button>
                  <button
                    type="button"
                    onClick={() => setWidth(1280)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    1280
                  </button>
                  <button
                    type="button"
                    onClick={() => setWidth(1920)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    1920
                  </button>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height: {height}px
                </label>
                <input
                  type="range"
                  min="600"
                  max="2160"
                  step="100"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scale: {scale}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setScale(1)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    1x
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(2)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    2x
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(3)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    3x
                  </button>
                </div>
              </div>

              {/* Delay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wait Time: {delay}ms
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time to wait before taking screenshot (allows page to load)
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setDelay(0)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Immediate
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelay(2000)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    2s
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelay(5000)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    5s
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelay(10000)}
                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    10s
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Taking Screenshot...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Take Screenshot
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {preview ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <div className="bg-gray-100 rounded-lg overflow-auto max-h-96 flex items-center justify-center">
                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 border-dashed p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Your screenshot preview will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
