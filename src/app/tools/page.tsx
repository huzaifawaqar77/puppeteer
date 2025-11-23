"use client";

import { Merge, Split, FileArchive, FileOutput } from "lucide-react";
import Link from "next/link";

const tools = [
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
];

export default function ToolsPage() {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">PDF Tools</h1>
          <p className="mt-2 text-gray-400">
            Select a tool to process your PDF files
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <tool.icon className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">{tool.name}</h3>
            <p className="text-gray-400">{tool.description}</p>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}
