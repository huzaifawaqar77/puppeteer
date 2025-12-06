"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight, Type } from "lucide-react";

const miscTools = [
  {
    title: "Text Formatter",
    description: "Convert unstructured text into perfectly formatted JSON data",
    icon: Type,
    href: "/miscellaneous/text-formatter",
    color: "from-blue-500 to-cyan-500",
    badge: "AI-Powered",
  },
];

export default function MiscellaneousPage() {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Miscellaneous Tools</h1>
        <p className="text-secondary">
          Explore specialized tools for unique text processing tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {miscTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.title} href={tool.href}>
              <Card className="p-6 bg-background border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${tool.color} rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {tool.title}
                </h3>
                <p className="text-secondary text-sm mb-4">
                  {tool.description}
                </p>

                <div className="flex items-center text-primary text-sm font-semibold">
                  Use Tool
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Coming Soon */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-foreground mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-background/50 border border-dashed border-border opacity-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <Type className="h-6 w-6 text-secondary" />
              </div>
              <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full">
                Coming Soon
              </span>
            </div>
            <h3 className="text-lg font-bold text-secondary">
              Batch Text Formatter
            </h3>
          </Card>
        </div>
      </div>
    </div>
  );
}
