"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { Loader2, Download, Link as LinkIcon } from "lucide-react";

export default function UrlToPdfToolPage() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  async function handleConvert() {
    if (!url || !user) {
      setError("Please enter a valid URL");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "URL_TO_PDF",
          status: "PENDING",
          inputFileIds: JSON.stringify([]), // No input file for URL conversion
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/url-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          jobId: job.$id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert URL to PDF");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">URL to PDF</h1>
          <p className="mt-2 text-gray-400">Convert webpages to PDF documents.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              Conversion Complete!
            </h3>
            <a
              href={result.url}
              download={result.filename}
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download {result.filename}</span>
            </a>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!url || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Convert to PDF"
          )}
        </button>
      </div>
    </div>
  );
}
