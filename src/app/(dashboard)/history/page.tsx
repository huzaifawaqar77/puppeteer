"use client";

import { useEffect, useState } from "react";
import { databases, storage } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { Query } from "appwrite";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";

interface ProcessingJob {
  $id: string;
  operationType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  outputFileId?: string;
  errorLog?: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  async function loadHistory() {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        [
          Query.equal("userId", user?.$id || ""),
          Query.orderDesc("startedAt"),
          Query.limit(50),
        ]
      );
      setJobs(response.documents as unknown as ProcessingJob[]);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(job: ProcessingJob) {
    if (!job.outputFileId) {
      setDownloadError("No output file available for this job");
      return;
    }

    try {
      setDownloading(job.$id);
      setDownloadError(null);

      const downloadUrl = await storage.getFileDownload(
        appwriteConfig.buckets.output,
        job.outputFileId
      );

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl.toString();
      link.download = `${job.operationType}-${new Date(
        job.startedAt
      ).getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadError("Failed to download file");
    } finally {
      setDownloading(null);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "PROCESSING":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Processing History
          </h1>
          <p className="mt-2 text-xs sm:text-sm lg:text-base text-secondary">
            View your recent PDF processing jobs
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-12 text-center">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-secondary/50 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              No processing history
            </h3>
            <p className="text-xs sm:text-sm text-secondary">
              Your completed PDF operations will appear here
            </p>
          </div>
        ) : (
          <>
            {downloadError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm text-red-600">
                  {downloadError}
                </p>
              </div>
            )}
            <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-x-auto shadow-card">
              <table className="w-full min-w-max">
                <thead className="bg-secondary/5">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider hidden sm:table-cell">
                      Started
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider hidden md:table-cell">
                      Completed
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((job) => (
                    <tr
                      key={job.$id}
                      className="hover:bg-secondary/5 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-foreground">
                            {job.operationType}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {getStatusIcon(job.status)}
                          <span className="text-xs sm:text-sm text-foreground">
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary hidden sm:table-cell">
                        {formatDate(job.startedAt)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary hidden md:table-cell">
                        {job.completedAt ? formatDate(job.completedAt) : "-"}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {job.status === "COMPLETED" && job.outputFileId ? (
                          <button
                            onClick={() => handleDownload(job)}
                            disabled={downloading === job.$id}
                            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
                          >
                            {downloading === job.$id ? (
                              <>
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                <span className="hidden sm:inline">
                                  Downloading...
                                </span>
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">
                                  Download
                                </span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-secondary">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
