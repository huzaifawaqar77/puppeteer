"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface ToolCardProps {
  name: string;
  description: string;
  icon: ReactNode;
  href: string;
  color?: string;
  featured?: boolean;
}

export default function ToolCard({
  name,
  description,
  icon,
  href,
  color = "from-blue-500 to-cyan-500",
  featured = false,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className={`
        group relative overflow-hidden rounded-xl bg-card border transition-all duration-300
        hover:-translate-y-1 hover:shadow-glow-orange
        ${featured ? "border-primary/50 shadow-card" : "border-border shadow-card"}
      `}
    >
      {/* Background Gradient on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
      
      {/* Featured Border Gradient */}
      {featured && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-orange-400/20 to-primary/20 rounded-xl -z-10"></div>
      )}

      {/* Card Content */}
      <div className="relative p-6">
        <div className="text-primary mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-secondary">
          {description}
        </p>
      </div>
    </Link>
  );
}
