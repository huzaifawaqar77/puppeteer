"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Stamp, Type, Image as ImageIcon } from "lucide-react";

export default function AddStampToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [stampImage, setStampImage] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  
  // Stamp parameters
  const [stampType, setStampType] = useState<"text" | "image">("text");
  const [stampText, setStampText] = useState("CONFIDENTIAL");
  const [position, setPosition] = useState("5"); // 5 = Center
  const [rotation, setRotation] = useState("0");
  const [opacity, setOpacity] = useState("1");
  const [fontSize, setFontSize] = useState("30");
  const [customColor, setCustomColor] = useState("#FF0000");

  const handleFilesSelected = (files: File[]) => {
    setFile(files[0] ?? null);
    setError("");
    setResult(null);
  };

  const handleStampImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStampImage(e.target.files[0]);
    }
  };

  async function handleConvert() {
    if (!file || !user) {
      setError("Please select a PDF file");
      return;
    }

    if (stampType === "image" && !stampImage) {
      setError("Please select a stamp image");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const uploadedFile = await storage.createFile(appwriteConfig.buckets.input, ID.unique(), file);
      const job = await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.processingJobs, ID.unique(), {
        userId: user?.$id,
        operationType: "COMPRESS",
        status: "PENDING",
        inputFileIds: JSON.stringify([uploadedFile.$id]),
        startedAt: new Date().toISOString(),
      });

      const formData = new FormData();
      formData.append("fileId", uploadedFile.$id);
      formData.append("jobId", job.$id);
      formData.append("stampType", stampType);
      formData.append("position", position);
      formData.append("rotation", rotation);
      formData.append("opacity", opacity);

      if (stampType === "text") {
        formData.append("stampText", stampText);
        formData.append("fontSize", fontSize);
        formData.append("customColor", customColor);
      } else if (stampImage) {
        formData.append("stampImage", stampImage);
      }

      const response = await fetch("/api/add-stamp", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add stamp");
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add Stamp</h1>
          <p className="text-secondary">Add text or image stamps to your PDF documents</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Select PDF File</label>
            <FileUploader onFilesSelected={handleFilesSelected} accept={[".pdf"]} maxSize={30 * 1024 * 1024} />
          </div>

          {file && (
            <div className="space-y-6 mb-6">
              {/* Stamp Type Selector */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStampType("text")}
                  className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    stampType === "text"
                      ? "bg-primary text-white border-primary shadow-glow-orange"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  <Type className="h-4 w-4" /> Text Stamp
                </button>
                <button
                  onClick={() => setStampType("image")}
                  className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    stampType === "image"
                      ? "bg-primary text-white border-primary shadow-glow-orange"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" /> Image Stamp
                </button>
              </div>

              {/* Stamp Content */}
              {stampType === "text" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Stamp Text</label>
                    <input
                      type="text"
                      value={stampText}
                      onChange={(e) => setStampText(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      placeholder="e.g., CONFIDENTIAL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Font Size</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="h-12 w-12 rounded cursor-pointer border border-border"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="flex-1 p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Upload Stamp Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStampImageSelected}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>
              )}

              {/* Common Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  >
                    <option value="1">Bottom Left</option>
                    <option value="2">Bottom Center</option>
                    <option value="3">Bottom Right</option>
                    <option value="4">Middle Left</option>
                    <option value="5">Center</option>
                    <option value="6">Middle Right</option>
                    <option value="7">Top Left</option>
                    <option value="8">Top Center</option>
                    <option value="9">Top Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rotation ({rotation}°)</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="90"
                    value={rotation}
                    onChange={(e) => setRotation(e.target.value)}
                    className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary mt-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Opacity ({opacity})</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(e.target.value)}
                    className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary mt-4"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">{error}</p></div>)}

          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Stamp Added!</h3>
              <a href={result.url} download={result.filename} className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors">
                <Download className="h-4 w-4" /><span>Download {result.filename}</span>
              </a>
            </div>
          )}

          <button onClick={handleConvert} disabled={!file || processing} className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2">
            {processing ? (<><Loader2 className="h-5 w-5 animate-spin" />Processing...</>) : (<><Stamp className="h-5 w-5" />Add Stamp</>)}
          </button>
        </div>
      </div>
    </div>
  );
}
