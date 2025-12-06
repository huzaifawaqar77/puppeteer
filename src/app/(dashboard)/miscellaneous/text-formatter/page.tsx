"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Copy,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface FormattingResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

export default function TextFormatterPage() {
  const [inputText, setInputText] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<FormattingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to format");
      return;
    }

    if (!description.trim()) {
      setError("Please provide formatting instructions");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/text-formatter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          instructions: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to format text");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (result?.data) {
      const json = JSON.stringify(result.data, null, 2);
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadResult = () => {
    if (result?.data) {
      const json = JSON.stringify(result.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "formatted_data.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Text Formatter</h1>
        <p className="text-secondary">
          Paste text and describe how you want it formatted as JSON. AI will
          structure the data according to your requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card className="p-6 bg-background border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Input Text
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here... (medical records, invoices, documents, etc.)"
              className="w-full h-64 p-4 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-secondary resize-none"
            />
          </Card>

          <Card className="p-6 bg-background border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Formatting Instructions
            </h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Extract patient name, diagnosis, allergies, medications, and visit dates in JSON format"
              className="w-full h-32 p-4 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-secondary resize-none"
            />
          </Card>

          <Button
            onClick={handleFormat}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-5 w-5" />
                Format with AI
              </>
            )}
          </Button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <Card className="p-6 bg-background border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Formatted Output
              </h2>
              {result?.success && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyResult}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-black/5"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    onClick={handleDownloadResult}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-black/5"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-600">Error</h3>
                  <p className="text-sm text-red-500/80">{error}</p>
                </div>
              </div>
            )}

            {result?.success ? (
              <pre className="bg-input border border-border rounded-lg p-4 text-sm overflow-auto max-h-96 text-foreground font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <div className="bg-input border border-border rounded-lg p-8 flex items-center justify-center min-h-96 text-secondary">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Processing your text...</p>
                  </div>
                ) : (
                  <p className="text-center">
                    Your formatted JSON output will appear here
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Example */}
      <Card className="p-6 bg-blue-500/5 border border-blue-500/20">
        <h3 className="font-semibold text-foreground mb-3">💡 Example</h3>
        <p className="text-sm text-secondary mb-3">
          <strong>Input Text:</strong> "Patient John Doe, 45 years old, diagnosed
          with Type 2 Diabetes and hypertension. Allergic to Penicillin. Currently
          on Metformin 500mg twice daily and Lisinopril 10mg once daily. Last visit
          on 2024-12-01 for routine checkup."
        </p>
        <p className="text-sm text-secondary">
          <strong>Instructions:</strong> Extract and format as patient record with
          name, age, diagnoses, allergies, medications, and last visit date
        </p>
      </Card>
    </div>
  );
}
