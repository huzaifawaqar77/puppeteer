"use client";

import { ReactNode } from "react";

type StatusType = "processing" | "completed" | "failed";

interface StatusPillProps {
  status: StatusType;
  children?: ReactNode;
}

const statusConfig = {
  processing: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    animation: "animate-pulse-orange",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    animation: "",
  },
  failed: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    animation: "",
  },
};

export default function StatusPill({ status, children }: StatusPillProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
        ${config.bg} ${config.text} ${config.border} ${config.animation}
      `}
    >
      {/* Status Dot */}
      <span className={`w-1.5 h-1.5 rounded-full ${status === "processing" ? "bg-primary" : status === "completed" ? "bg-green-500" : "bg-red-500"}`}></span>
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
