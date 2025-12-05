"use client";

import { useState, useEffect } from "react";
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
  Loader,
} from "lucide-react";
import {
  useActivityLogs,
  formatRelativeTime,
  getActivityInfo,
} from "@/hooks/useActivityLogs";

// Popular Operations - Featured tools
const popularOperations = [
  {
    name: "Merge PDFs",
    description: "Combine multiple PDF files into one",
    icon: <Layers className="h-8 w-8" />,
    href: "/tools/merge",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "OCR PDF",
    description: "Make scanned documents searchable",
    icon: <ScanText className="h-8 w-8" />,
    href: "/tools/ocr",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Protect PDF",
    description: "Add password protection to PDFs",
    icon: <ShieldX className="h-8 w-8" />,
    href: "/tools/protect",
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
    description: "Automatically split PDFs",
    icon: <Scissors className="h-8 w-8" />,
    href: "/tools/auto-split",
    color: "from-yellow-500 to-amber-500",
  },
  {
    name: "Extract Images",
    description: "Pull all images from PDFs",
    icon: <ImageIcon className="h-8 w-8" />,
    href: "/tools/extract-images",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size",
    icon: <Layers className="h-8 w-8" />,
    href: "/tools/compress",
    color: "from-indigo-500 to-purple-500",
  },
];

export default function DashboardPage() {
  const { logs, loading: logsLoading } = useActivityLogs(10);

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
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-secondary">Loading activity...</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-secondary">
                No activity yet. Start using our PDF tools!
              </p>
            </div>
          ) : (
            <table className="w-full min-w-max">
              <thead className="bg-sidebar border-b border-border">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-xs font-medium text-secondary uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-xs font-medium text-secondary uppercase tracking-wider hidden sm:table-cell">
                    Time
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-xs font-medium text-secondary uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((job) => {
                  const { Icon, displayName } = getActivityInfo(
                    job.operationType
                  );
                  return (
                    <tr
                      key={job.$id}
                      className="hover:bg-sidebar/50 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate max-w-xs">
                            {displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary hidden sm:table-cell">
                        {formatRelativeTime(job.startedAt)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <StatusPill
                          status={
                            job.status.toLowerCase() as
                              | "processing"
                              | "completed"
                              | "failed"
                              | "pending"
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
