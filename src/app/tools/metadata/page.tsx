"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, FileText } from "lucide-react";

export default function MetadataToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
  });

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  async function handleUpdateMetadata() {
    if (!file || !user) {
      setError("Please select a file");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.buckets.input,
        ID.unique(),
        file
      );

      const job = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        ID.unique(),
        {
          userId: user?.$id,
          operationType: "UPDATE_METADATA",
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update metadata");
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
          <h1 className="text-3xl font-bold text-white">Change Metadata</h1>
          <p className="mt-2 text-gray-400">Update the metadata properties of your PDF document.</p>
        </div>

        <FileUploader
          onFilesSelected={handleFilesSelected}
          accept={[".pdf"]}
          maxSize={30 * 1024 * 1024}
        />

        {file && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Metadata Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={metadata.title}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Document Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                <input
                  type="text"
                  name="author"
                  value={metadata.author}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Author Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={metadata.subject}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
                <input
                  type="text"
                  name="keywords"
                  value={metadata.keywords}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Keywords (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Creator</label>
                <input
                  type="text"
                  name="creator"
                  value={metadata.creator}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Creator Application"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Producer</label>
                <input
                  type="text"
                  name="producer"
                  value={metadata.producer}
                  onChange={handleMetadataChange}
                  className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="PDF Producer"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              Metadata Updated!
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
          onClick={handleUpdateMetadata}
          disabled={!file || processing}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Update Metadata"
          )}
        </button>
      </div>
    </div>
  );
}
