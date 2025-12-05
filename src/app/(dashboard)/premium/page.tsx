import Link from "next/link";
import {
  FileCode,
  Crown,
  Globe,
  FileText,
  BookMarked,
  Layers as MergeIcon,
  Split,
  Lock,
  Layers,
  FileJson,
  Image as ImageIcon,
  Zap,
  FileUp,
} from "lucide-react";

const premiumTools = [
  // Chromium Tools - Web Conversion
  {
    category: "Web Conversion",
    tools: [
      {
        name: "URL to PDF",
        description:
          "Convert any website URL into a PDF document with advanced formatting options.",
        href: "/premium/url-to-pdf",
        icon: Globe,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        name: "HTML to PDF",
        description:
          "Transform HTML files or code into professionally formatted PDFs.",
        href: "/premium/html-to-pdf",
        icon: FileCode,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
      },
      {
        name: "Markdown to PDF",
        description:
          "Convert Markdown files with full formatting support to PDF.",
        href: "/premium/markdown-to-pdf",
        icon: BookMarked,
        color: "text-violet-500",
        bgColor: "bg-violet-500/10",
      },
      {
        name: "Screenshots",
        description:
          "Capture website screenshots as PNG, JPEG, or WebP images.",
        href: "/premium/screenshots",
        icon: ImageIcon,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
      },
    ],
  },
  // LibreOffice Tools
  {
    category: "Office Conversion",
    tools: [
      {
        name: "Office to PDF",
        description:
          "Convert Word, Excel, PowerPoint, and other office documents to PDF.",
        href: "/premium/office-to-pdf",
        icon: FileUp,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      },
    ],
  },
  // PDF Operations
  {
    category: "PDF Operations",
    tools: [
      {
        name: "Merge PDFs",
        description: "Combine multiple PDF files into a single document.",
        href: "/premium/merge-pdfs",
        icon: MergeIcon,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
      },
      {
        name: "Split PDFs",
        description:
          "Extract specific pages from PDFs or split by page ranges.",
        href: "/premium/split-pdfs",
        icon: Split,
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
      },
      {
        name: "Encrypt PDF",
        description: "Add password protection to PDF files for security.",
        href: "/premium/encrypt-pdf",
        icon: Lock,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
      },
      {
        name: "Flatten PDF",
        description: "Remove form fields and flatten interactive PDFs.",
        href: "/premium/flatten-pdf",
        icon: Layers,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
      },
      {
        name: "PDF to PDF/A",
        description: "Convert PDFs to PDF/A format for long-term archival.",
        href: "/premium/pdf-to-pdfa",
        icon: Zap,
        color: "text-lime-500",
        bgColor: "bg-lime-500/10",
      },
      {
        name: "PDF Metadata",
        description: "Read and write metadata information in PDF files.",
        href: "/premium/pdf-metadata",
        icon: FileJson,
        color: "text-teal-500",
        bgColor: "bg-teal-500/10",
      },
    ],
  },
];

export default function PremiumPage() {
  return (
    <div className="container mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 shadow-lg shrink-0">
          <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Premium Tools</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Advanced PDF operations powered by Gotenberg.
          </p>
        </div>
      </div>

      {premiumTools.map((category) => (
        <div key={category.category} className="space-y-3 sm:space-y-4 lg:space-y-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            {category.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {category.tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg ${tool.bgColor}`}>
                    <tool.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${tool.color}`} />
                  </div>
                  <div className="px-2 py-0.5 sm:py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-medium border border-yellow-200">
                    Premium
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
