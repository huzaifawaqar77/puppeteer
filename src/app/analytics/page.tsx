"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { Query } from "appwrite";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ProcessingJob {
  $id: string;
  operationType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
}

interface AnalyticsData {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  processingJobs: number;
  operationStats: { [key: string]: number };
  statusStats: { [key: string]: number };
  dailyStats: { date: string; jobs: number }[];
  operationChart: { name: string; value: number }[];
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  async function loadAnalytics() {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.processingJobs,
        [
          Query.equal("userId", user?.$id || ""),
          Query.orderDesc("startedAt"),
          Query.limit(1000),
        ]
      );

      const jobs = response.documents as unknown as ProcessingJob[];

      // Calculate statistics
      const totalJobs = jobs.length;
      const completedJobs = jobs.filter((j) => j.status === "COMPLETED").length;
      const failedJobs = jobs.filter((j) => j.status === "FAILED").length;
      const processingJobs = jobs.filter(
        (j) => j.status === "PROCESSING" || j.status === "PENDING"
      ).length;

      // Operation statistics
      const operationStats: { [key: string]: number } = {};
      jobs.forEach((job) => {
        operationStats[job.operationType] =
          (operationStats[job.operationType] || 0) + 1;
      });

      // Status statistics
      const statusStats: { [key: string]: number } = {
        COMPLETED: completedJobs,
        FAILED: failedJobs,
        PROCESSING: processingJobs,
      };

      // Daily statistics (last 30 days)
      const dailyStats: { [key: string]: number } = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dailyStats[dateStr] = 0;
      }

      jobs.forEach((job) => {
        const dateStr = job.startedAt.split("T")[0];
        if (dailyStats[dateStr] !== undefined) {
          dailyStats[dateStr]++;
        }
      });

      const dailyChartData = Object.entries(dailyStats).map(([date, jobs]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        jobs,
      }));

      // Operation chart data
      const operationChartData = Object.entries(operationStats)
        .map(([name, value]) => ({
          name: name.replace(/([A-Z])/g, " $1").trim(),
          value,
        }))
        .sort((a, b) => b.value - a.value);

      setAnalytics({
        totalJobs,
        completedJobs,
        failedJobs,
        processingJobs,
        operationStats,
        statusStats,
        dailyStats: dailyChartData,
        operationChart: operationChartData,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-secondary">Failed to load analytics</p>
      </div>
    );
  }

  const successRate =
    analytics.totalJobs > 0
      ? Math.round((analytics.completedJobs / analytics.totalJobs) * 100)
      : 0;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-secondary">
          Track your PDF processing statistics and insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Jobs */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium mb-1">
                Total Jobs
              </p>
              <p className="text-3xl font-bold text-foreground">
                {analytics.totalJobs}
              </p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-foreground">
                {analytics.completedJobs}
              </p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium mb-1">Failed</p>
              <p className="text-3xl font-bold text-foreground">
                {analytics.failedJobs}
              </p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium mb-1">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-foreground">
                {successRate}%
              </p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Daily Activity (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyStats}>
              <defs>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#999", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: "#999", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #444",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="jobs"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorJobs)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Operation Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Operations Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.operationChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.operationChart.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #444",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Processing Status Overview
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(analytics.statusStats).map(
              ([status, count]) => ({
                status,
                count,
              })
            )}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="status" tick={{ fill: "#999", fontSize: 12 }} />
            <YAxis tick={{ fill: "#999", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #444",
                borderRadius: "8px",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Operations */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Top Operations
        </h3>
        <div className="space-y-3">
          {analytics.operationChart.slice(0, 5).map((op, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-foreground font-medium">{op.name}</span>
              </div>
              <span className="text-primary font-bold">{op.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
