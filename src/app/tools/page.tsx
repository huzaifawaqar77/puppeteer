"use client";

import {
  Merge,
  Split,
  FileArchive,
  FileOutput,
  ScanText,
  Shield,
  FileEdit,
  Scissors,
  Image,
  Link as LinkIcon,
  FileType,
  FileDigit,
  Grid3x3,
  Lock,
  Unlock,
  RotateCw,
  Trash2,
  Wrench,
  FilePlus,
  FileText,
  Globe,
  FileCheck,
  Layers,
  Minimize2,
  ZoomIn,
  Contrast,
  Search,
  Presentation,
  Archive,
  ScanLine,
  Stamp,
  Code,
  FileCode,
  FileSignature,
  FileMinus,
  Workflow,
} from "lucide-react";
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
    color: "from-gray-500 to-slate-500",
  },
  {
    name: "Flatten PDF",
    description: "Flatten form fields and annotations",
    icon: Layers,
    href: "/tools/flatten",
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    name: "Add Image",
    description: "Insert images into PDFs",
    icon: Image,
    href: "/tools/add-image",
    color: "from-rose-500 to-red-500",
  },
  {
    name: "Sign PDF",
    description: "Digitally sign documents",
    icon: FileCheck,
    href: "/tools/sign",
    color: "from-emerald-600 to-green-600",
  },
  {
    name: "HTML to PDF",
    description: "Convert HTML to PDF",
    icon: Code,
    href: "/tools/html-to-pdf",
    color: "from-orange-500 to-amber-500",
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
  {
    name: "PDF to Word",
    description: "Convert PDF to Word",
    icon: FileText,
    href: "/tools/pdf-to-word",
    color: "from-blue-600 to-blue-400",
  },
  {
    name: "PDF to PowerPoint",
    description: "Convert PDF to Presentation",
    icon: Presentation,
    href: "/tools/pdf-to-presentation",
    color: "from-orange-600 to-orange-400",
  },
  {
    name: "Office to PDF",
    description: "Convert Office docs to PDF",
    icon: FileType,
    href: "/tools/file-to-pdf",
    color: "from-blue-700 to-blue-500",
  },
  {
    name: "PDF to PDF/A",
    description: "Convert to archival format",
    icon: Archive,
    href: "/tools/pdf-to-pdfa",
    color: "from-purple-700 to-purple-500",
  },
  {
    name: "Add Stamp",
    description: "Add text or image stamps",
    icon: Stamp,
    href: "/tools/add-stamp",
    color: "from-red-600 to-red-400",
  },
  {
    name: "Show JavaScript",
    description: "Extract embedded JS",
    icon: Code,
    href: "/tools/show-javascript",
    color: "from-yellow-600 to-yellow-400",
  },
  {
    name: "PDF to Markdown",
    description: "Convert PDF to Markdown",
    icon: FileCode,
    href: "/tools/pdf-to-markdown",
    color: "from-slate-600 to-slate-400",
  },
  {
    name: "Auto Rename",
    description: "Rename based on content",
    icon: FileSignature,
    href: "/tools/auto-rename",
    color: "from-indigo-600 to-indigo-400",
  },
  {
    name: "Remove Blanks",
    description: "Remove blank pages",
    icon: FileMinus,
    href: "/tools/remove-blanks",
    color: "from-pink-600 to-pink-400",
  },
  {
    name: "Visual Pipeline Builder",
    description: "Chain multiple operations",
    icon: Workflow,
    href: "/pipelines/builder",
    color: "from-amber-500 to-yellow-500",
    special: true,
  },
];

export default function ToolsPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            PDF Tools
          </h1>
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
              className={`group relative overflow-hidden rounded-xl bg-card border p-6 transition-all shadow-card 
                ${
                  (tool as any).special
                    ? "border-amber-500/50 shadow-glow-gold hover:shadow-glow-gold-intense col-span-1 sm:col-span-2 lg:col-span-2"
                    : "border-border hover:border-primary/50 hover:shadow-glow-orange"
                }
              `}
            >
              {/* Background Gradient on Hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`}
              />

              {/* Special Badge */}
              {(tool as any).special && (
                <div className="absolute top-0 right-0 bg-linear-to-bl from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                  ADVANCED
                </div>
              )}

              <div className="relative">
                <div
                  className={`mb-4 transform group-hover:scale-110 transition-transform duration-300 inline-block p-3 rounded-lg ${
                    (tool as any).special
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-primary/5 text-primary"
                  }`}
                >
                  <tool.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-secondary">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
