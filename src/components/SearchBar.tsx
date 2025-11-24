"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchResult {
  type: "tool" | "file" | "pipeline";
  name: string;
  description?: string;
  href: string;
}

const allTools: SearchResult[] = [
  { type: "tool", name: "Add Image", description: "Insert images into PDFs", href: "/tools/add-image" },
  { type: "tool", name: "Add Text", description: "Add text content to PDFs", href: "/tools/add-text" },
  { type: "tool", name: "Auto Split", description: "Automatically split PDFs", href: "/tools/auto-split" },
  { type: "tool", name: "Compare PDFs", description: "Compare two PDF documents", href: "/tools/compare" },
  { type: "tool", name: "Compress PDF", description: "Reduce PDF file size", href: "/tools/compress" },
  { type: "tool", name: "Adjust Contrast", description: "Modify PDF contrast", href: "/tools/contrast" },
  { type: "tool", name: "Convert PDF", description: "Convert PDF to other formats", href: "/tools/convert" },
  { type: "tool", name: "Crop PDF", description: "Crop PDF pages", href: "/tools/crop" },
  { type: "tool", name: "Detect Blank Pages", description: "Find and remove blank pages", href: "/tools/detect-blank-pages" },
  { type: "tool", name: "Extract Images", description: "Extract all images from PDF", href: "/tools/extract-images" },
  { type: "tool", name: "Flatten PDF", description: "Flatten form fields and annotations", href: "/tools/flatten" },
  { type: "tool", name: "Get PDF Info", description: "View PDF metadata and properties", href: "/tools/get-info" },
  { type: "tool", name: "HTML to PDF", description: "Convert HTML to PDF", href: "/tools/html-to-pdf" },
  { type: "tool", name: "Images to PDF", description: "Convert images to PDF", href: "/tools/img-to-pdf" },
  { type: "tool", name: "Linearize PDF", description: "Optimize for web viewing", href: "/tools/linearize" },
  { type: "tool", name: "Markdown to PDF", description: "Convert Markdown to PDF", href: "/tools/markdown-to-pdf" },
  { type: "tool", name: "Merge PDFs", description: "Combine multiple PDFs into one", href: "/tools/merge" },
  { type: "tool", name: "Edit Metadata", description: "Modify PDF metadata", href: "/tools/metadata" },
  { type: "tool", name: "Multi-Page Layout", description: "Arrange multiple pages per sheet", href: "/tools/multi-page-layout" },
  { type: "tool", name: "OCR PDF", description: "Make scanned documents searchable", href: "/tools/ocr" },
  { type: "tool", name: "Overlay PDF", description: "Overlay one PDF onto another", href: "/tools/overlay" },
  { type: "tool", name: "Add Page Numbers", description: "Insert page numbers", href: "/tools/page-numbers" },
  { type: "tool", name: "PDF to CSV", description: "Extract tables to CSV", href: "/tools/pdf-to-csv" },
  { type: "tool", name: "PDF to HTML", description: "Convert PDF to HTML", href: "/tools/pdf-to-html" },
  { type: "tool", name: "PDF to Text", description: "Extract text from PDF", href: "/tools/pdf-to-text" },
  { type: "tool", name: "PDF to XML", description: "Convert PDF to XML", href: "/tools/pdf-to-xml" },
  { type: "tool", name: "Protect PDF", description: "Add password protection", href: "/tools/protect" },
  { type: "tool", name: "Remove Pages", description: "Delete specific pages", href: "/tools/remove-pages" },
  { type: "tool", name: "Repair PDF", description: "Fix corrupted PDFs", href: "/tools/repair" },
  { type: "tool", name: "Rotate PDF", description: "Rotate PDF pages", href: "/tools/rotate" },
  { type: "tool", name: "Sanitize PDF", description: "Remove sensitive information", href: "/tools/sanitize" },
  { type: "tool", name: "Sign PDF", description: "Digitally sign documents", href: "/tools/sign" },
  { type: "tool", name: "Split PDF", description: "Split PDF into multiple files", href: "/tools/split" },
  { type: "tool", name: "Unlock PDF", description: "Remove password protection", href: "/tools/unlock" },
  { type: "tool", name: "URL to PDF", description: "Convert webpage to PDF", href: "/tools/url-to-pdf" },
  { type: "tool", name: "Add Watermark", description: "Add watermark to PDF", href: "/tools/watermark" },
  { type: "pipeline", name: "Visual Pipeline Builder", description: "Chain multiple operations", href: "/pipelines/builder" },
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allTools.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResults(filtered);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tool":
        return "bg-primary/10 text-primary";
      case "file":
        return "bg-blue-50 text-blue-700";
      case "pipeline":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 36+ tools (e.g., 'OCR', 'Merge', 'Compress', 'Watermark')..."
          className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary/60 focus:border-primary focus:shadow-glow-orange transition-all"
        />
      </div>

      {/* Dropdown Results */}
      {showResults && filteredResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-card-hover overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="py-2">
            {filteredResults.map((result, index) => (
              <a
                key={index}
                href={result.href}
                className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors"
                onClick={() => setShowResults(false)}
              >
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(result.type)}`}>
                  {result.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                  {result.description && (
                    <p className="text-xs text-secondary truncate">{result.description}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && query.length > 0 && filteredResults.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-card-hover p-4 z-50">
          <p className="text-sm text-secondary text-center">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
