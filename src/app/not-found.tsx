"use client";

import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-in-left {
          from { transform: translateX(-100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-bounce-soft {
          animation: bounce-soft 3s ease-in-out infinite;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
      `}</style>

      {/* Floating background spheres */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
      <div
        className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />

      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          {/* 404 Number with animation */}
          <div className="mb-8 animate-slide-in-left">
            <div className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl relative">
              4
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20 blur-xl -z-10" />
            </div>
          </div>

          {/* Animated circle in middle */}
          <div className="relative w-48 h-48 mb-8 animate-slide-in-right">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin-slow" />
            {/* Middle ring */}
            <div
              className="absolute inset-4 border-2 border-transparent border-b-pink-400 border-l-blue-400 rounded-full animate-spin-slow"
              style={{
                animationDirection: "reverse",
                animationDuration: "15s",
              }}
            />
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl md:text-7xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent animate-bounce-soft">
                0
              </div>
            </div>
          </div>

          {/* Last 4 */}
          <div
            className="mb-8 animate-slide-in-left"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-pink-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl relative">
              4
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-blue-400 to-purple-400 opacity-20 blur-xl -z-10" />
            </div>
          </div>

          {/* Decorative elements */}
          <div
            className="absolute top-1/4 left-10 text-4xl md:text-6xl animate-float opacity-30"
            style={{ animationDelay: "1s" }}
          >
            📄
          </div>
          <div
            className="absolute top-1/3 right-10 text-4xl md:text-6xl animate-float opacity-30"
            style={{ animationDelay: "2s" }}
          >
            ❌
          </div>
          <div
            className="absolute bottom-1/3 left-1/4 text-4xl md:text-6xl animate-float opacity-30"
            style={{ animationDelay: "3s" }}
          >
            🔍
          </div>
          <div
            className="absolute bottom-1/4 right-1/4 text-4xl md:text-6xl animate-float opacity-30"
            style={{ animationDelay: "1.5s" }}
          >
            ⚠️
          </div>

          {/* Text content */}
          <div
            className="relative mt-12 mb-12 max-w-2xl animate-slide-in-right"
            style={{ animationDelay: "0.4s" }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-2">
              Oops! The page you're looking for seems to have wandered off.
            </p>
            <p className="text-base md:text-lg text-slate-400">
              It might have been moved, deleted, or never existed in the first
              place.
            </p>
          </div>

          {/* Action buttons */}
          <div
            className="relative flex flex-col sm:flex-row gap-4 mb-8 animate-slide-in-right"
            style={{ animationDelay: "0.6s" }}
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2 text-white">
                <Home className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </div>
            </Link>

            <Link
              href="/tools"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-800" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2 text-white">
                <span>View All Tools</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Error code info */}
          <div
            className="relative text-center text-slate-400 text-sm animate-pulse"
            style={{ animationDelay: "0.8s" }}
          >
            <p>Error Code: 404</p>
            <p className="text-xs mt-1">Resource not available</p>
          </div>
        </div>
      </div>

      {/* Animated dots in corners */}
      <div
        className="absolute top-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"
        style={{ animationDuration: "2s" }}
      />
      <div
        className="absolute bottom-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse"
        style={{ animationDuration: "3s", animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"
        style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
      />
    </div>
  );
}
