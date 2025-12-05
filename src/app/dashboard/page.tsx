"use client";

import SearchBar from "@/components/SearchBar";
import ToolCard from "@/components/ToolCard";
import StatusPill from "@/components/StatusPill";
import {
  Wand2,
  Layers,
  ScanText,
  FileEdit,
  Scissors,
  Image as ImageIcon,
  Link as LinkIcon,
  ShieldX,
  Download,
  Eye,
  RotateCcw,
} from "lucide-react";

// Popular Operations - Featured tools
const popularOperations = [
  {
    name: "Visual Pipeline Builder",
    description: "Create a Magic & Visual Pipeline to Flowchart",
    icon: <Wand2 className="h-8 w-8" />,
    href: "/pipelines/builder",
    color: "from-purple-500 to-pink-500",
    featured: true,
  },
  {
    name: "Merge PDFs",
    description: "Merge PDFs into in layers PDFs",
    icon: <Layers className="h-8 w-8" />,
    href: "/tools/merge",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "OCR PDF",
    description: "Scanner text and/or text, and un tontext",
    icon: <ScanText className="h-8 w-8" />,
    href: "/tools/ocr",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Smart Redact",
    description: "Smart redact a markers and notice.",
    icon: <ShieldX className="h-8 w-8" />,
    href: "/tools/redact",
    color: "from-red-500 to-rose-500",
  },
  {
    name: "Flatten PDF",
    description: "Flatten forms and annotations",
    icon: <FileEdit className="h-8 w-8" />,
    href: "/tools/flatten",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Auto Split",
    description: "Split PDF by page ranges or bookmarks",
    icon: <Scissors className="h-8 w-8" />,
    href: "/tools/auto-split",
    color: "from-yellow-500 to-amber-500",
  },
  {
    name: "Extract Images",
    description: "Pull all high-res images out of a document",
    icon: <ImageIcon className="h-8 w-8" />,
    href: "/tools/extract-images",
    color: "from-cyan-500 to-blue-500",
  },
];

// Recent Activity - Mock data
const recentActivity = [
  {
    operation: "Flatten PDF",
    data: "Soannent PDF",
    lastUpdate: "1 minutes ago",
    status: "processing" as const,
  },
  {
    operation: "Flatten PDF",
    data: "Soannent PDF",
    lastUpdate: "1 minutes ago",
    status: "completed" as const,
  },
  {
    operation: "Merge PDFs",
    data: "Contract_v1.pdf + Contract_v2.pdf",
    lastUpdate: "5 minutes ago",
    status: "completed" as const,
  },
  {
    operation: "OCR PDF",
    data: "Scanned_Document.pdf",
    lastUpdate: "12 minutes ago",
    status: "completed" as const,
  },
  {
    operation: "Extract Images",
    data: "Annual_Report_2024.pdf",
    lastUpdate: "1 hour ago",
    status: "failed" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Search Bar - Full Width */}
      <SearchBar />

      {/* Popular Operations */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Popular Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularOperations.map((tool) => (
            <ToolCard
              key={tool.name}
              name={tool.name}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
              color={tool.color}
              featured={tool.featured}
            />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Recent Activity
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <tr
                  key={index}
                  className="hover:bg-sidebar/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {activity.operation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    {activity.data}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    {activity.lastUpdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusPill status={activity.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 hover:bg-black/5 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-secondary hover:text-primary" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-black/5 rounded transition-colors"
                        title="View Log"
                      >
                        <Eye className="h-4 w-4 text-secondary hover:text-primary" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-black/5 rounded transition-colors"
                        title="Rerun"
                      >
                        <RotateCcw className="h-4 w-4 text-secondary hover:text-primary" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
