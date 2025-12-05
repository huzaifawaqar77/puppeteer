"use client";

import React, { useState } from "react";
import {
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface ApiKeyRecord {
  id: string;
  keyPrefix: string;
  name: string;
  tier: string;
  status: string;
  requestCount: number;
  dailyLimit?: number;
  createdAt: string;
  expiresAt?: string;
  description?: string;
}

interface ApiKeyManagementProps {
  keys: ApiKeyRecord[];
  onDelete: (keyId: string) => Promise<void>;
  loading?: boolean;
}

export function ApiKeyManagement({
  keys,
  onDelete,
  loading = false,
}: ApiKeyManagementProps) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(keyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (keyId: string) => {
    if (
      window.confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone."
      )
    ) {
      setDeletingId(keyId);
      try {
        await onDelete(keyId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 border-green-200 text-green-900";
      case "revoked":
        return "bg-red-50 border-red-200 text-red-900";
      case "expired":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "inactive":
        return "bg-gray-50 border-gray-200 text-gray-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "revoked":
        return <XCircle className="w-4 h-4" />;
      case "expired":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const calculateUsagePercentage = (used: number, limit?: number) => {
    if (!limit || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const daysUntilExpiry =
      (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (keys.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <p className="text-blue-900 font-medium">No API keys yet</p>
        <p className="text-blue-700 text-sm">
          Create your first API key to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {keys.map((key) => (
          <div
            key={key.id}
            className={`border rounded-lg p-4 space-y-3 ${getStatusColor(
              key.status
            )}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(key.status)}
                <div>
                  <h3 className="font-semibold">{key.name}</h3>
                  {key.description && (
                    <p className="text-sm opacity-75">{key.description}</p>
                  )}
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-black/10 rounded">
                {key.tier.toUpperCase()}
              </span>
            </div>

            {/* Key Display */}
            <div className="bg-black/5 rounded p-3 flex items-center justify-between font-mono text-sm">
              <span className="flex-1 truncate">
                {visibleKeys.has(key.id)
                  ? key.keyPrefix + "..."
                  : "••••••••••••••••..."}
              </span>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => toggleKeyVisibility(key.id)}
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                  title={visibleKeys.has(key.id) ? "Hide key" : "Show key"}
                >
                  {visibleKeys.has(key.id) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleCopy(key.keyPrefix, key.id)}
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                  title="Copy prefix"
                >
                  {copiedId === key.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-75">Total Usage</span>
                <span className="font-medium">{key.requestCount} requests</span>
              </div>
              {key.dailyLimit && (
                <>
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <span>Daily Limit: {key.dailyLimit}</span>
                    <span>
                      {Math.round((key.requestCount / key.dailyLimit) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{
                        width: `${calculateUsagePercentage(
                          key.requestCount,
                          key.dailyLimit
                        )}%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs opacity-75">
              <div>
                <p className="font-medium">Created</p>
                <p>{formatDate(key.createdAt)}</p>
              </div>
              {key.expiresAt && (
                <div>
                  <p className="font-medium">Expires</p>
                  <p
                    className={
                      isExpiringSoon(key.expiresAt)
                        ? "text-orange-600 font-semibold"
                        : ""
                    }
                  >
                    {formatDate(key.expiresAt)}
                    {isExpiringSoon(key.expiresAt) && " ⚠️"}
                  </p>
                </div>
              )}
            </div>

            {/* Status Info */}
            {key.status !== "active" && (
              <div className="bg-black/10 rounded p-2 text-sm font-medium">
                This key is {key.status} and cannot be used
              </div>
            )}

            {/* Actions */}
            {key.status === "active" && (
              <button
                onClick={() => handleDelete(key.id)}
                disabled={deletingId === key.id || loading}
                className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-400/20 text-red-700 dark:text-red-300 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deletingId === key.id ? "Revoking..." : "Revoke Key"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
