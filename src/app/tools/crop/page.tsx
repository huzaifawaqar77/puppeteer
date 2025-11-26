"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { ID } from "appwrite";
import { FileUploader } from "@/components/FileUploader";
import { Loader2, Download, Crop as CropIcon } from "lucide-react";

export default function CropToolPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [pdfPreview, setPdfPreview] = useState<string>("");
  
  // Crop state
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pdfRendered, setPdfRendered] = useState(false);
  const [scale, setScale] = useState(1.5); // Render scale for quality
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 }); // Original PDF dimensions
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfjsLibRef = useRef<any>(null);

  const handleFilesSelected = (files: File[]) => {
    const selectedFile = files[0] ?? null;
    setFile(selectedFile);
    setError("");
    setResult(null);
    setPdfRendered(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPdfPreview(url);
    }
  };

  // Mouse Event Handlers for the Overlay Div
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfRendered || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !pdfRendered || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const width = Math.abs(currentX - dragStart.x);
    const height = Math.abs(currentY - dragStart.y);
    
    setCropArea({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Load and render PDF
  useEffect(() => {
    if (!pdfPreview) return;

    const loadPdf = async () => {
      try {
        console.log("Loading PDF.js...");
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLibRef.current = pdfjsLib;
        
        console.log("Setting worker source to /pdf.worker.min.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        
        const loadingTask = pdfjsLib.getDocument(pdfPreview);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // Get original dimensions (scale 1.0)
        const originalViewport = page.getViewport({ scale: 1.0 });
        setPdfDimensions({ width: originalViewport.width, height: originalViewport.height });

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Render at higher scale for better quality
        const viewport = page.getViewport({ scale: scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        setPdfRendered(true);
        console.log("PDF Rendered successfully");
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError('Failed to load PDF preview');
      }
    };

    loadPdf();
  }, [pdfPreview, scale]);

  async function handleCrop() {
    if (!file || !user) {
      setError("Please select a file");
      return;
    }

    if (cropArea.width === 0 || cropArea.height === 0 || !containerRef.current) {
      setError("Please draw a crop area on the PDF");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      // Calculate coordinates based on percentage of the container size
      // mapped to the original PDF dimensions
      const rect = containerRef.current.getBoundingClientRect();
      
      const ratioX = pdfDimensions.width / rect.width;
      const ratioY = pdfDimensions.height / rect.height;

      // Calculate width and height first
      const realWidth = Math.round(cropArea.width * ratioX);
      const realHeight = Math.round(cropArea.height * ratioY);

      // Calculate X and Y
      // For Y, we need to invert it because PDF origin is Bottom-Left, but UI is Top-Left
      // y_pdf = pdfHeight - (y_ui * ratioY) - realHeight
      const realX = Math.round(cropArea.x * ratioX);
      const realY = Math.round(pdfDimensions.height - (cropArea.y * ratioY) - realHeight);

      const realCoordinates = {
        x: realX,
        y: realY,
        width: realWidth,
        height: realHeight
      };

      console.log("Screen Rect:", rect.width, rect.height);
      console.log("Original PDF:", pdfDimensions.width, pdfDimensions.height);
      console.log("Crop Coordinates (Screen):", cropArea);
      console.log("Crop Coordinates (Real - Inverted Y):", realCoordinates);

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
          operationType: "COMPRESS", // Using COMPRESS as generic type for now
          status: "PENDING",
          inputFileIds: JSON.stringify([uploadedFile.$id]),
          startedAt: new Date().toISOString(),
        }
      );

      const response = await fetch("/api/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.$id,
          jobId: job.$id,
          coordinates: realCoordinates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to crop PDF");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Crop PDF</h1>
          <p className="text-secondary">
            Upload a PDF and drag to select the area you want to keep
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Controls */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select PDF File
              </label>
              <FileUploader
                onFilesSelected={handleFilesSelected}
                accept={[".pdf"]}
                maxSize={30 * 1024 * 1024}
              />
            </div>

            {pdfRendered && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Crop Selection (PDF Points):</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
                    <div>X: {Math.round(cropArea.x * (pdfDimensions.width / (containerRef.current?.getBoundingClientRect().width || 1)))}</div>
                    <div>Y: {Math.round(pdfDimensions.height - (cropArea.y * (pdfDimensions.height / (containerRef.current?.getBoundingClientRect().height || 1))) - (cropArea.height * (pdfDimensions.height / (containerRef.current?.getBoundingClientRect().height || 1))))}</div>
                    <div>W: {Math.round(cropArea.width * (pdfDimensions.width / (containerRef.current?.getBoundingClientRect().width || 1)))}</div>
                    <div>H: {Math.round(cropArea.height * (pdfDimensions.height / (containerRef.current?.getBoundingClientRect().height || 1)))}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">Original PDF Size: {pdfDimensions.width} x {pdfDimensions.height} pt</p>
                  <p className="text-xs text-blue-500 mt-1">Note: Y-axis inverted for PDF standard (Bottom-Left origin)</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  PDF Cropped Successfully!
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

            <button
              onClick={handleCrop}
              disabled={!file || processing || !pdfRendered || cropArea.width === 0}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Cropping PDF...
                </>
              ) : (
                <>
                  <CropIcon className="h-5 w-5" />
                  Crop PDF
                </>
              )}
            </button>
          </div>

          {/* Right: PDF Preview */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <label className="block text-sm font-medium text-foreground mb-4">
              PDF Preview {pdfRendered && "- Drag to Select Crop Area"}
            </label>
            
            {pdfPreview ? (
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block">
                <div 
                  className="relative inline-block"
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: 'crosshair', touchAction: 'none' }}
                >
                  {/* PDF Canvas */}
                  <canvas
                    ref={canvasRef}
                    className="block max-w-full h-auto"
                  />
                  
                  {/* Crop Overlay */}
                  {pdfRendered && (
                    <>
                      {/* Dark overlay outside selection */}
                      <div className="absolute inset-0 bg-black/40 pointer-events-none" 
                           style={{ 
                             clipPath: `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, ${cropArea.x}px ${cropArea.y}px, ${cropArea.x + cropArea.width}px ${cropArea.y}px, ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px, ${cropArea.x}px ${cropArea.y + cropArea.height}px, ${cropArea.x}px ${cropArea.y}px)` 
                           }} 
                      />
                      
                      {/* Selection Border */}
                      <div 
                        className="absolute border-2 border-[#ff6b35] pointer-events-none"
                        style={{
                          left: cropArea.x,
                          top: cropArea.y,
                          width: cropArea.width,
                          height: cropArea.height,
                          display: cropArea.width > 0 ? 'block' : 'none',
                          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)' // Alternative to clip-path if needed
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Upload a PDF to preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>How to use:</strong> Upload a PDF, then click and drag on the preview to select the area you want to keep. Everything outside will be cropped away.
          </p>
        </div>
      </div>
    </div>
  );
}
