"use client";

import { Merge, Split, FileArchive, FileOutput, ScanText, Shield, FileEdit, Scissors, Image, Link as LinkIcon, FileType, FileDigit, Grid3x3, Lock, Unlock, RotateCw, Trash2, Wrench, FilePlus, FileText, Globe, FileCheck, Layers, Minimize2, ZoomIn, Contrast, Search } from "lucide-react";
import Link from "next/link";

const allTools = [
  {
    name: "Merge PDFs",
    description: "Combine multiple PDFs into one",
    icon: Merge,
    href: "/tools/merge",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Split PDF",
    description: "Extract pages from your PDF",
    icon: Split,
    href: "/tools/split",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Compress PDF",
    description: "Reduce file size",
    icon: FileArchive,
    href: "/tools/compress",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Convert PDF",
    description: "Convert to images or other formats",
    icon: FileOutput,
    href: "/tools/convert",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "OCR PDF",
    description: "Make scanned documents searchable",
    icon: ScanText,
    href: "/tools/ocr",
    color: "from-amber-500 to-yellow-500",
  },
  {
    name: "Protect PDF",
    description: "Add password protection",
    icon: Lock,
    href: "/tools/protect",
    color: "from-red-500 to-rose-500",
  },
  {
    name: "Unlock PDF",
    description: "Remove password protection",
    icon: Unlock,
    href: "/tools/unlock",
    color: "from-teal-500 to-cyan-500",
  },
  {
    name: "Rotate PDF",
    description: "Rotate PDF pages",
    icon: RotateCw,
    href: "/tools/rotate",
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Add Watermark",
    description: "Add watermark to PDF",
    icon: FileEdit,
    href: "/tools/watermark",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Extract Images",
    description: "Extract all images from PDF",
    icon: Image,
    href: "/tools/extract-images",
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Add Page Numbers",
    description: "Insert page numbers",
    icon: FileDigit,
    href: "/tools/page-numbers",
    color: "from-sky-500 to-blue-500",
  },
  {
    name: "Remove Pages",
    description: "Delete specific pages",
    icon: Trash2,
    href: "/tools/remove-pages",
    color: "from-red-500 to-pink-500",
  },
  {
    name: "Crop PDF",
    description: "Crop PDF pages",
    icon: Scissors,
    href: "/tools/crop",
    color: "from-lime-500 to-green-500",
  },
  {
    name: "Repair PDF",
    description: "Fix corrupted PDFs",
    icon: Wrench,
    href: "/tools/repair",
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Flatten PDF",
    description: "Flatten form fields and annotations",
    icon: Layers,
    href: "/tools/flatten",
    color: "from-cyan-500 to-teal-500",
  },
  {
    name: "Sign PDF",
    description: "Digitally sign documents",
    icon: FileCheck,
    href: "/tools/sign",
    color: "from-emerald-500 to-green-500",
  },
  {
    name: "Add Text",
    description: "Add text content to PDFs",
    icon: FileText,
    href: "/tools/add-text",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Add Image",
    description: "Insert images into PDFs",
    icon: FilePlus,
    href: "/tools/add-image",
    color: "from-purple-500 to-violet-500",
  },
  {
    name: "URL to PDF",
    description: "Convert webpage to PDF",
    icon: Globe,
    href: "/tools/url-to-pdf",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "HTML to PDF",
    description: "Convert HTML to PDF",
    icon: FileType,
    href: "/tools/html-to-pdf",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Markdown to PDF",
    description: "Convert Markdown to PDF",
    icon: FileType,
    href: "/tools/markdown-to-pdf",
    color: "from-indigo-500 to-blue-500",
  },
  {
    name: "Images to PDF",
    description: "Convert images to PDF",
    icon: Image,
    href: "/tools/img-to-pdf",
    color: "from-pink-500 to-purple-500",
  },
  {
    name: "PDF to Text",
    description: "Extract text from PDF",
    icon: FileText,
    href: "/tools/pdf-to-text",
    color: "from-gray-500 to-slate-500",
  },
  {
    name: "PDF to HTML",
    description: "Convert PDF to HTML",
    icon: Globe,
    href: "/tools/pdf-to-html",
    color: "from-teal-500 to-emerald-500",
  },
  {
    name: "PDF to CSV",
    description: "Extract tables to CSV",
    icon: FileType,
    href: "/tools/pdf-to-csv",
    color: "from-green-500 to-lime-500",
  },
  {
    name: "PDF to XML",
    description: "Convert PDF to XML",
    icon: FileType,
    href: "/tools/pdf-to-xml",
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Edit Metadata",
    description: "Modify PDF metadata",
    icon: FileEdit,
    href: "/tools/metadata",
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Get PDF Info",
    description: "View PDF metadata and properties",
    icon: Search,
    href: "/tools/get-info",
    color: "from-sky-500 to-cyan-500",
  },
  {
    name: "Linearize PDF",
    description: "Optimize for web viewing",
    icon: Minimize2,
    href: "/tools/linearize",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Multi-Page Layout",
    description: "Arrange multiple pages per sheet",
    icon: Grid3x3,
    href: "/tools/multi-page-layout",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Overlay PDF",
    description: "Overlay one PDF onto another",
    icon: Layers,
    href: "/tools/overlay",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Auto Split",
    description: "Automatically split PDFs",
    icon: Split,
    href: "/tools/auto-split",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Compare PDFs",
    description: "Compare two PDF documents",
    icon: FileType,
    href: "/tools/compare",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Adjust Contrast",
    description: "Modify PDF contrast",
    icon: Contrast,
    href: "/tools/contrast",
    color: "from-slate-500 to-gray-500",
  },
  {
    name: "Detect Blank Pages",
    description: "Find and remove blank pages",
    icon: Search,
    href: "/tools/detect-blank-pages",
    color: "from-yellow-500 to-amber-500",
  },
  {
    name: "Sanitize PDF",
    description: "Remove sensitive information",
    icon: Shield,
    href: "/tools/sanitize",
    color: "from-red-500 to-rose-500",
  },
];

export default function ToolsPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">PDF Tools</h1>
          <p className="mt-2 text-secondary">
            {allTools.length} powerful tools to process your PDF files
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {allTools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:border-primary/50 transition-all shadow-card hover:shadow-glow-orange"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <tool.icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{tool.name}</h3>
              <p className="text-sm text-secondary line-clamp-2">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
