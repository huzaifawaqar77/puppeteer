"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  GitBranch,
  Clock,
  Code,
  BarChart3,
  Settings,
  LogOut,
  Crown,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Pipelines", href: "/pipelines/builder", icon: GitBranch },
  { name: "History", href: "/history", icon: Clock },
  { name: "API", href: "/api-docs", icon: Code },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Premium", href: "/premium", icon: Crown },
];

const bottomNav = [{ name: "Settings", href: "/settings", icon: Settings }];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    // Logout logic here
    window.location.href = "/login";
  };

  return (
    <aside className="w-60 h-full bg-sidebar border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 flex-1">
          <div className="relative w-10 h-10 shrink-0">
            <div className="absolute inset-0 bg-linear-to-br from-primary via-orange-400 to-primary opacity-80 rounded-lg blur-sm"></div>
            <div className="relative bg-linear-to-br from-primary to-orange-500 rounded-lg w-full h-full flex items-center justify-center text-white font-bold text-xl shadow-glow-orange">
              O
            </div>
          </div>
          <span className="text-xl font-bold text-foreground">OmniPDF</span>
        </Link>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-secondary" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative
                    ${
                      active
                        ? "text-primary bg-primary/5"
                        : "text-secondary hover:text-foreground hover:bg-black/5"
                    }
                  `}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-glow-orange"></div>
                  )}
                  <item.icon
                    className={`h-5 w-5 ${
                      active
                        ? "text-primary"
                        : "text-secondary group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-border"></div>

      {/* Bottom Navigation */}
      <div className="p-3 space-y-1">
        {bottomNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  active
                    ? "text-primary bg-primary/5"
                    : "text-secondary hover:text-foreground hover:bg-black/5"
                }
              `}
            >
              <item.icon
                className={`h-5 w-5 ${
                  active
                    ? "text-primary"
                    : "text-secondary group-hover:text-foreground"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary hover:text-foreground hover:bg-black/5 transition-all"
        >
          <LogOut className="h-5 w-5 text-secondary group-hover:text-foreground" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
