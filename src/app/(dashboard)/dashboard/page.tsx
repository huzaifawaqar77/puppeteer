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
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Search Bar - Full Width */}
      <SearchBar />

      {/* Popular Operations */}
      <section>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4 sm:mb-6">
          Popular Operations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4 sm:mb-6">
          Recent Activity
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-card">
          <table className="w-full min-w-max">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-xs font-medium text-secondary uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-xs font-medium text-secondary uppercase tracking-wider hidden sm:table-cell">
                  Data
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-xs font-medium text-secondary uppercase tracking-wider hidden md:table-cell">
                  Last Update
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-xs font-medium text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-xs font-medium text-secondary uppercase tracking-wider hidden lg:table-cell">
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
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-foreground">
                    {activity.operation}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary hidden sm:table-cell">
                    {activity.data}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary hidden md:table-cell">
                    {activity.lastUpdate}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <StatusPill status={activity.status} />
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm hidden lg:table-cell">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        className="p-1 sm:p-1.5 hover:bg-black/5 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-secondary hover:text-primary" />
                      </button>
                      <button
                        className="p-1 sm:p-1.5 hover:bg-black/5 rounded transition-colors"
                        title="View Log"
                      >
                        <Eye className="h-4 w-4 text-secondary hover:text-primary" />
                      </button>
                      <button
                        className="p-1 sm:p-1.5 hover:bg-black/5 rounded transition-colors"
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
