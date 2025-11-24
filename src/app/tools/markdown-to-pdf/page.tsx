"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { Loader2, Download, FileText } from "lucide-react";

export default function MarkdownToPdfToolPage() {
  const { user } = useAuth();
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  async function handleConvert() {
    if (!markdownContent || !user) {
      setError("Please enter Markdown content");
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
          operationType: "MARKDOWN_TO_PDF",
          status: "PENDING",
          inputFileIds: JSON.stringify([]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/markdown-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdownContent,
          jobId: job.$id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert Markdown to PDF");
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Markdown to PDF</h1>
          <p className="text-secondary">
            Convert Markdown text to a formatted PDF document
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          {/* Markdown Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Enter Markdown Content
            </label>
            <textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="# My Document

## Introduction
This is a **bold** statement and this is *italic*.

- List item 1
- List item 2
- List item 3

[Link](https://example.com)"
              rows={12}
              className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-secondary/50 resize-none font-mono text-sm"
            />
            <p className="mt-2 text-xs text-secondary">
              Use standard Markdown syntax for formatting
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Markdown Converted to PDF!
              </h3>
              <a
                href={result.url}
                download={result.filename}
                className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download {result.filename}</span>
              </a>
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={!markdownContent || processing}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Convert to PDF
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Supported formatting:</strong> Headers (#), bold (**), italic (*), lists, links, code blocks, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
