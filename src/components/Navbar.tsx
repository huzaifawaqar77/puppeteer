"use client";

import { Bell, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const userName = user?.name || "User";

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Hamburger Menu - Mobile Only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-black/5 rounded-lg transition-colors shrink-0"
      >
        <Menu className="h-5 w-5 text-secondary" />
      </button>

      {/* Welcome Message */}
      <div className="flex-1 md:flex-none ml-2 md:ml-0">
        <h1 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-foreground truncate">
          Welcome back, {userName}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <button className="relative p-2 hover:bg-black/5 rounded-lg transition-colors">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
          {/* Orange Dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 hover:bg-black/5 rounded-lg p-1.5 transition-colors">
          <div className="w-8 h-8 bg-linear-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
        </button>
      </div>
    </header>
  );
}
