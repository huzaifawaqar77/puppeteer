"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, AlertCircle, Lock, Zap, BarChart3 } from "lucide-react";

interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  totalRequests: number;
  monthlyLimit: number;
  percentageUsed: number;
  freeKeysCount: number;
  premiumKeysCount: number;
}

export function ApiKeyAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ApiKeyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadApiKeyStats();
  }, [user]);

  async function loadApiKeyStats() {
    try {
      const response = await fetch("/api/user/api-keys", {
        headers: {
          Authorization: `Bearer ${user?.$id}`,
        },
      });

      const data = await response.json();
      const keys = data.keys || [];

      // Calculate stats
      const totalKeys = keys.length;
      const activeKeys = keys.filter((k: any) => k.status === "active").length;
      const totalRequests = keys.reduce(
        (sum: number, k: any) => sum + (k.requestCount || 0),
        0
      );
      const freeKeysCount = keys.filter((k: any) => k.tier === "free").length;
      const premiumKeysCount = keys.filter(
        (k: any) => k.tier === "premium"
      ).length;

      // For free tier, monthly limit is 10k
      const monthlyLimit = 10000;
      const percentageUsed = (totalRequests / monthlyLimit) * 100;

      setStats({
        totalKeys,
        activeKeys,
        totalRequests,
        monthlyLimit,
        percentageUsed: Math.min(percentageUsed, 100),
        freeKeysCount,
        premiumKeysCount,
      });
    } catch (error) {
      console.error("Failed to load API key stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg animate-pulse" />
          <div className="h-6 bg-primary/20 rounded w-1/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const isNearLimit = stats.percentageUsed > 80;
  const isExceeded = stats.percentageUsed >= 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            API Key Analytics
          </h2>
          <p className="text-sm text-secondary mt-1">
            Monitor your API key usage and quotas
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {stats.activeKeys} active
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Keys */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs sm:text-sm font-medium mb-1">
                Total API Keys
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.totalKeys}
              </p>
            </div>
            <div className="bg-blue-500/10 p-2 sm:p-3 rounded-lg">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Active Keys */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs sm:text-sm font-medium mb-1">
                Active Keys
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.activeKeys}
              </p>
            </div>
            <div className="bg-green-500/10 p-2 sm:p-3 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Free Tier */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs sm:text-sm font-medium mb-1">
                Free Tier Keys
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.freeKeysCount}
              </p>
            </div>
            <div className="bg-yellow-500/10 p-2 sm:p-3 rounded-lg">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Premium Tier */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs sm:text-sm font-medium mb-1">
                Premium Keys
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.premiumKeysCount}
              </p>
            </div>
            <div className="bg-purple-500/10 p-2 sm:p-3 rounded-lg">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">
                Monthly Request Usage
              </h3>
              <span className="text-sm font-medium text-secondary">
                {stats.totalRequests} / {stats.monthlyLimit} requests
              </span>
            </div>
            <p className="text-xs sm:text-sm text-secondary">
              Free tier limit: {stats.monthlyLimit.toLocaleString()} requests
              per month
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-secondary/20 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isExceeded
                    ? "bg-red-500"
                    : isNearLimit
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${stats.percentageUsed}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary">
              <span>0%</span>
              <span>
                {Math.round(stats.percentageUsed)}%{isExceeded && " - EXCEEDED"}
                {isNearLimit && !isExceeded && " - Near Limit"}
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Warning */}
          {isExceeded && (
            <div className="mt-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600">
                <p className="font-medium">Monthly limit exceeded</p>
                <p className="text-xs mt-1">
                  Your free tier monthly request limit has been exceeded. New
                  requests will be rejected until next month.
                </p>
              </div>
            </div>
          )}

          {isNearLimit && !isExceeded && (
            <div className="mt-4 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Approaching monthly limit</p>
                <p className="text-xs mt-1">
                  You have used over 80% of your monthly request quota. Consider
                  upgrading to premium for higher limits.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Details Table (Responsive) */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          API Keys Overview
        </h3>
        <div className="min-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-secondary">
                  Tier
                </th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-secondary hidden sm:table-cell">
                  Status
                </th>
                <th className="text-right py-3 px-2 sm:px-4 font-medium text-secondary">
                  Requests
                </th>
                <th className="text-right py-3 px-2 sm:px-4 font-medium text-secondary hidden sm:table-cell">
                  Limit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {stats.freeKeysCount > 0 && (
                <tr>
                  <td className="py-3 px-2 sm:px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">
                      Free
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 hidden sm:table-cell text-secondary">
                    {stats.activeKeys > 0 ? "Active" : "Inactive"}
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-right text-foreground font-medium">
                    {stats.totalRequests.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-right text-secondary hidden sm:table-cell">
                    {stats.monthlyLimit.toLocaleString()}
                  </td>
                </tr>
              )}
              {stats.premiumKeysCount > 0 && (
                <tr>
                  <td className="py-3 px-2 sm:px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300">
                      Premium
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 hidden sm:table-cell text-secondary">
                    Not Available
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-right text-foreground font-medium">
                    -
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-right text-secondary hidden sm:table-cell">
                    500,000
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
