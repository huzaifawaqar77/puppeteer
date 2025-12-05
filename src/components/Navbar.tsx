"use client";

import { Bell, User, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userName = user?.name || "User";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    }
  };

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

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-black/5 rounded-lg p-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-linear-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-40 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {userName}
                  </p>
                  <p className="text-xs text-secondary">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:text-foreground hover:bg-black/5 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
