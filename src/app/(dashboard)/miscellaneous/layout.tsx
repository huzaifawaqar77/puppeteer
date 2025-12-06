"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const miscTools = [
  {
    name: "Text Formatter",
    href: "/miscellaneous/text-formatter",
    description: "Format text data into structured JSON using AI",
  },
];

export default function MiscellaneousLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isMainPage = pathname === "/miscellaneous";

  return (
    <div className="space-y-6">
      {!isMainPage && (
        <Link href="/miscellaneous">
          <Button variant="ghost" className="gap-2 text-secondary hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Miscellaneous
          </Button>
        </Link>
      )}
      {children}
    </div>
  );
}
