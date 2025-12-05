import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { Query } from "appwrite";
import { useAuth } from "@/contexts/AuthContext";
import type { LucideIcon } from "lucide-react";
import {
  Merge,
  Split,
  Archive,
  FileOutput,
  ScanText,
  RotateCw,
  Layers,
  Lock,
  Unlock,
  Droplets,
  Image,
  Trash2,
  Scissors,
  Wrench,
  FileSignature,
  Code,
  FileText,
  Globe,
  Table2,
  FileType,
  FileCode,
  Download,
  Presentation,
  FileDown,
  Loader,
} from "lucide-react";

export interface ProcessingJob {
  $id: string;
  userId: string;
  operationType: string;
  status: string;
  inputFileIds: string;
  outputFileId?: string;
  errorLog?: string;
  startedAt: string;
  completedAt?: string;
}

export function useActivityLogs(limit: number = 10) {
  const [logs, setLogs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchActivityLogs() {
      try {
        setLoading(true);
        setError(null);

        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          "processingJobs",
          [
            Query.equal("userId", user?.$id || ""),
            Query.orderDesc("startedAt"),
            Query.limit(limit),
          ]
        );

        setLogs(response.documents as unknown as ProcessingJob[]);
      } catch (err: any) {
        console.error("Failed to fetch activity logs:", err);
        setError(err.message || "Failed to fetch activity logs");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivityLogs();
  }, [user, limit]);

  return { logs, loading, error };
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

/**
 * Get icon component and display name for operation type
 */
export function getActivityInfo(operationType: string): {
  Icon: LucideIcon;
  displayName: string;
} {
  const typeMap: Record<string, { Icon: LucideIcon; name: string }> = {
    MERGE: { Icon: Merge, name: "Merge PDFs" },
    SPLIT: { Icon: Split, name: "Split PDF" },
    COMPRESS: { Icon: Archive, name: "Compress" },
    CONVERT: { Icon: FileOutput, name: "Convert" },
    OCR: { Icon: ScanText, name: "OCR" },
    ROTATE: { Icon: RotateCw, name: "Rotate" },
    FLATTEN: { Icon: Layers, name: "Flatten" },
    PROTECT: { Icon: Lock, name: "Protect" },
    UNLOCK: { Icon: Unlock, name: "Unlock" },
    WATERMARK: { Icon: Droplets, name: "Watermark" },
    "EXTRACT-IMAGES": { Icon: Image, name: "Extract Images" },
    "PAGE-NUMBERS": { Icon: FileText, name: "Add Page Numbers" },
    "REMOVE-PAGES": { Icon: Trash2, name: "Remove Pages" },
    CROP: { Icon: Scissors, name: "Crop" },
    REPAIR: { Icon: Wrench, name: "Repair" },
    SIGN: { Icon: FileSignature, name: "Sign" },
    "HTML-TO-PDF": { Icon: Code, name: "HTML to PDF" },
    "IMG-TO-PDF": { Icon: Image, name: "Images to PDF" },
    "PDF-TO-TEXT": { Icon: FileText, name: "Extract Text" },
    "PDF-TO-HTML": { Icon: Code, name: "PDF to HTML" },
    "PDF-TO-CSV": { Icon: Table2, name: "PDF to CSV" },
    "PDF-TO-XML": { Icon: FileCode, name: "PDF to XML" },
    "PDF-TO-WORD": { Icon: FileType, name: "PDF to Word" },
    "PDF-TO-PRESENTATION": { Icon: Presentation, name: "PDF to PPT" },
    "PDF-TO-MARKDOWN": { Icon: FileDown, name: "PDF to Markdown" },
  };

  const info = typeMap[operationType] || {
    Icon: FileText,
    name: operationType,
  };
  return { Icon: info.Icon, displayName: info.name };
}
