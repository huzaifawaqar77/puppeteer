"use client";

import { 
  Upload, 
  FileText, 
  Merge, 
  Split, 
  FileArchive, 
  FileOutput, 
  RotateCw, 
  Lock, 
  Unlock, 
  Stamp, 
  Layers, 
  Trash2, 
  Image, 
  Wrench, 
  Tag,
  PenTool,
  Hash,
  Crop,
  Image as ImageIcon,
  LayoutGrid,
  FileCode,
  Link as LinkIcon,
  GitCompare,
  ShieldAlert,
  ScanText,
  Table,
  SunMedium
} from "lucide-react";
import Link from "next/link";

const quickTools = [
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
    name: "Rotate PDF",
    description: "Rotate PDF pages",
    icon: RotateCw,
    href: "/tools/rotate",
    color: "from-yellow-500 to-orange-500",
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
    color: "from-indigo-500 to-violet-500",
  },
  {
    name: "Watermark PDF",
    description: "Add text watermark",
    icon: Stamp,
    href: "/tools/watermark",
    color: "from-teal-500 to-cyan-500",
  },
  {
    name: "Flatten PDF",
    description: "Flatten forms and annotations",
    icon: Layers,
    href: "/tools/flatten",
    color: "from-gray-500 to-slate-500",
  },
  {
    name: "Delete Pages",
    description: "Remove specific pages",
    icon: Trash2,
    href: "/tools/remove-pages",
    color: "from-red-500 to-orange-500",
  },
  {
    name: "Image to PDF",
    description: "Convert images to PDF",
    icon: Image,
    href: "/tools/img-to-pdf",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "PDF to Text",
    description: "Extract text from PDF",
    icon: FileText,
    href: "/tools/pdf-to-text",
    color: "from-blue-400 to-indigo-400",
  },
  {
    name: "Repair PDF",
    description: "Fix corrupted files",
    icon: Wrench,
    href: "/tools/repair",
    color: "from-green-400 to-emerald-400",
  },
  {
    name: "Change Metadata",
    description: "Update PDF properties",
    icon: Tag,
    href: "/tools/metadata",
    color: "from-yellow-400 to-amber-400",
  },
  {
    name: "Sign PDF",
    description: "Add digital signature",
    icon: PenTool,
    href: "/tools/sign",
    color: "from-indigo-500 to-violet-500",
  },
  {
    name: "Page Numbers",
    description: "Add page numbers",
    icon: Hash,
    href: "/tools/page-numbers",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Crop PDF",
    description: "Crop PDF pages",
    icon: Crop,
    href: "/tools/crop",
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Extract Images",
    description: "Extract images from PDF",
    icon: ImageIcon,
    href: "/tools/extract-images",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Multi-Page Layout",
    description: "N-up page layout",
    icon: LayoutGrid,
    href: "/tools/multi-page-layout",
    color: "from-teal-500 to-emerald-500",
  },
  {
    name: "HTML to PDF",
    description: "Convert HTML to PDF",
    icon: FileCode,
    href: "/tools/html-to-pdf",
    color: "from-orange-600 to-red-600",
  },
  {
    name: "Markdown to PDF",
    description: "Convert Markdown to PDF",
    icon: FileText,
    href: "/tools/markdown-to-pdf",
    color: "from-gray-600 to-slate-600",
  },
  {
    name: "URL to PDF",
    description: "Convert webpage to PDF",
    icon: LinkIcon,
    href: "/tools/url-to-pdf",
    color: "from-blue-600 to-indigo-600",
  },
  {
    name: "Compare PDFs",
    description: "Compare two PDFs",
    icon: GitCompare,
    href: "/tools/compare",
    color: "from-purple-600 to-violet-600",
  },
  {
    name: "Sanitize PDF",
    description: "Remove malicious content",
    icon: ShieldAlert,
    href: "/tools/sanitize",
    color: "from-red-600 to-rose-600",
  },
  {
    name: "OCR PDF",
    description: "Make PDF searchable",
    icon: ScanText,
    href: "/tools/ocr",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "PDF to HTML",
    description: "Convert PDF to HTML",
    icon: FileCode,
    href: "/tools/pdf-to-html",
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "PDF to XML",
    description: "Convert PDF to XML",
    icon: FileCode,
    href: "/tools/pdf-to-xml",
    color: "from-yellow-500 to-amber-500",
  },
  {
    name: "PDF to CSV",
    description: "Extract tables to CSV",
    icon: Table,
    href: "/tools/pdf-to-csv",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Adjust Contrast",
    description: "Enhance readability",
    icon: SunMedium,
    href: "/tools/contrast",
    color: "from-indigo-500 to-violet-500",
  },
  {
    name: "Overlay PDF",
    description: "Overlay two PDFs",
    icon: Layers,
    href: "/tools/overlay",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Auto-Split",
    description: "Smart PDF splitting",
    icon: Split,
    href: "/tools/auto-split",
    color: "from-pink-500 to-rose-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Welcome back! Select a tool to get started.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <tool.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">{tool.name}</h3>
              <p className="text-sm text-gray-400">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Upload Files</h2>
        <div className="relative group cursor-pointer">
          <div className="border-2 border-dashed border-white/20 group-hover:border-primary/50 rounded-xl p-12 text-center transition-all bg-white/5 group-hover:bg-white/10">
            <Upload className="mx-auto h-12 w-12 text-gray-500 group-hover:text-primary transition-colors" />
            <p className="mt-4 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
              Drop files here or click to browse
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Supports PDF, JPG, PNG up to 100MB
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <Link href="/history" className="text-sm text-primary hover:text-primary/90">
            View all
          </Link>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-center py-8">
            No recent activity. Start by uploading a file!
          </p>
        </div>
      </div>
    </div>
  );
}
