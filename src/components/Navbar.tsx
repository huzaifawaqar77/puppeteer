"use client";

import { Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const userName = user?.name || "User";

  return (
    <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-between">
      {/* Welcome Message */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Welcome back, {userName}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 hover:bg-black/5 rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-secondary" />
          {/* Orange Dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 hover:bg-black/5 rounded-lg p-1.5 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
        </button>
      </div>
    </header>
  );
}
