"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileUploader } from "@/components/FileUploader";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Settings,
  Play,
  Save,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from "lucide-react";

// Define available operations and their default parameters
const AVAILABLE_OPERATIONS = [
  {
    id: "merge",
    name: "Merge PDFs",
    endpoint: "merge-pdfs",
    description: "Combine multiple PDFs into one",
    params: [],
  },
  {
    id: "split",
    name: "Split PDF",
    endpoint: "split-pdf",
    description: "Split PDF into separate pages",
    params: [
      {
        name: "splitType",
        type: "select",
        options: ["all", "pages"],
        default: "all",
        label: "Split Type",
      },
      {
        name: "pages",
        type: "text",
        default: "",
        label: "Pages (e.g. 1,3-5)",
        showIf: { param: "splitType", value: "pages" },
      },
    ],
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    endpoint: "rotate-pdf",
    description: "Rotate pages in the PDF",
    params: [
      {
        name: "angle",
        type: "select",
        options: ["90", "180", "270"],
        default: "90",
        label: "Rotation Angle",
      },
    ],
  },
  {
    id: "compress",
    name: "Compress PDF",
    endpoint: "compress-pdf",
    description: "Reduce PDF file size",
    params: [
      {
        name: "compressionLevel",
        type: "select",
        options: ["1", "2", "3"],
        default: "2",
        label: "Compression Level (1=Low, 3=High)",
      },
    ],
  },
  {
    id: "protect",
    name: "Protect PDF",
    endpoint: "protect-pdf",
    description: "Add password protection",
    params: [
      { name: "password", type: "password", default: "", label: "Password" },
    ],
  },
  {
    id: "watermark",
    name: "Add Watermark",
    endpoint: "add-watermark",
    description: "Add text watermark",
    params: [
      {
        name: "text",
        type: "text",
        default: "CONFIDENTIAL",
        label: "Watermark Text",
      },
      { name: "rotation", type: "number", default: "45", label: "Rotation" },
      {
        name: "opacity",
        type: "number",
        default: "0.5",
        label: "Opacity (0-1)",
      },
    ],
  },
  {
    id: "auto-rename",
    name: "Auto Rename",
    endpoint: "auto-rename",
    description: "Rename based on content",
    params: [
      {
        name: "useFirstTextAsFallback",
        type: "boolean",
        default: false,
        label: "Use First Text as Fallback",
      },
    ],
  },
  {
    id: "remove-blanks",
    name: "Remove Blanks",
    endpoint: "remove-blanks",
    description: "Remove blank pages",
    params: [
      { name: "threshold", type: "number", default: "10", label: "Threshold" },
      {
        name: "whitePercent",
        type: "number",
        default: "99.0",
        label: "White Percentage",
      },
    ],
  },
  {
    id: "pdf-to-pdfa",
    name: "PDF to PDF/A",
    endpoint: "pdf-to-pdfa",
    description: "Convert to archival format",
    params: [
      {
        name: "outputFormat",
        type: "select",
        options: ["pdfa-1b", "pdfa-2b", "pdfa-3b"],
        default: "pdfa-2b",
        label: "PDF/A Standard",
      },
    ],
  },
];

interface PipelineStep {
  id: string; // Unique ID for this step instance
  operationId: string;
  params: Record<string, any>;
}

export default function PipelineBuilderPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [pipelineName, setPipelineName] = useState("My Custom Pipeline");
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [selectedOperationId, setSelectedOperationId] = useState(
    AVAILABLE_OPERATIONS[0].id
  );
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [error, setError] = useState<string>("");

  const handleAddStep = () => {
    const operation = AVAILABLE_OPERATIONS.find(
      (op) => op.id === selectedOperationId
    );
    if (!operation) return;

    const defaultParams: Record<string, any> = {};
    operation.params.forEach((param) => {
      defaultParams[param.name] = param.default;
    });

    const newStep: PipelineStep = {
      id: Math.random().toString(36).substring(7),
      operationId: operation.id,
      params: defaultParams,
    };

    setSteps([...steps, newStep]);
    setEditingStepId(newStep.id);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id));
    if (editingStepId === id) setEditingStepId(null);
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];
    setSteps(newSteps);
  };

  const handleUpdateParams = (
    stepId: string,
    paramName: string,
    value: any
  ) => {
    setSteps(
      steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            params: { ...step.params, [paramName]: value },
          };
        }
        return step;
      })
    );
  };

  const handleExecutePipeline = async () => {
    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }
    if (steps.length === 0) {
      setError("Please add at least one operation to the pipeline");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      // Construct the JSON payload for Stirling PDF
      const pipelineJson = steps.map((step) => {
        const operation = AVAILABLE_OPERATIONS.find(
          (op) => op.id === step.operationId
        );
        return {
          operation: operation?.endpoint,
          parameters: step.params,
        };
      });

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("json", JSON.stringify(pipelineJson));
      if (user) formData.append("userId", user.$id);

      const response = await fetch("/api/pipeline", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Pipeline execution failed");

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const getOperationDetails = (opId: string) =>
    AVAILABLE_OPERATIONS.find((op) => op.id === opId);

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-transparent bg-clip-text">
            Visual Pipeline Builder
          </span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full border border-amber-200">
            BETA
          </span>
        </h1>
        <p className="text-secondary">
          Chain multiple PDF operations together to create powerful automated
          workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. File Selection */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">
                1
              </span>
              Input Files
            </h2>
            <FileUploader
              onFilesSelected={setFiles}
              accept={[".pdf"]}
              multiple={true}
              maxSize={50 * 1024 * 1024}
            />
            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs bg-secondary/10 text-foreground px-2 py-1 rounded border border-border"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. Pipeline Builder */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">
                2
              </span>
              Build Pipeline
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Pipeline Name
              </label>
              <input
                type="text"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <select
                  value={selectedOperationId}
                  onChange={(e) => setSelectedOperationId(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                >
                  {AVAILABLE_OPERATIONS.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddStep}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Step
              </button>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              {steps.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-secondary/5">
                  <p className="text-secondary">
                    No operations added yet. Add a step to start building.
                  </p>
                </div>
              ) : (
                steps.map((step, index) => {
                  const opDetails = getOperationDetails(step.operationId);
                  const isEditing = editingStepId === step.id;

                  return (
                    <div
                      key={step.id}
                      className={`border rounded-lg transition-all ${
                        isEditing
                          ? "border-primary shadow-glow-orange bg-primary/5"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/20 text-xs font-mono">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-medium text-foreground">
                              {opDetails?.name}
                            </h3>
                            <p className="text-xs text-secondary">
                              {opDetails?.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveStep(index, "up")}
                            disabled={index === 0}
                            className="p-2 hover:bg-secondary/10 rounded-lg disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveStep(index, "down")}
                            disabled={index === steps.length - 1}
                            className="p-2 hover:bg-secondary/10 rounded-lg disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setEditingStepId(isEditing ? null : step.id)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isEditing
                                ? "bg-primary/20 text-primary"
                                : "hover:bg-secondary/10"
                            }`}
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveStep(step.id)}
                            className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Configuration Panel */}
                      {isEditing &&
                        opDetails &&
                        opDetails.params.length > 0 && (
                          <div className="p-4 border-t border-border/50 bg-background/50 rounded-b-lg space-y-4">
                            {opDetails.params.map((param) => {
                              // Check visibility condition
                              if ("showIf" in param && param.showIf) {
                                if (
                                  step.params[param.showIf.param] !==
                                  param.showIf.value
                                )
                                  return null;
                              }

                              return (
                                <div key={param.name}>
                                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1.5">
                                    {param.label}
                                  </label>
                                  {param.type === "select" ? (
                                    <select
                                      value={step.params[param.name]}
                                      onChange={(e) =>
                                        handleUpdateParams(
                                          step.id,
                                          param.name,
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-2 bg-background border border-border rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    >
                                      {"options" in param && param.options
                                        ? param.options.map((opt: string) => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))
                                        : null}
                                    </select>
                                  ) : param.type === "boolean" ? (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={step.params[param.name]}
                                        onChange={(e) =>
                                          handleUpdateParams(
                                            step.id,
                                            param.name,
                                            e.target.checked
                                          )
                                        }
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                      />
                                      <span className="text-sm">Enabled</span>
                                    </label>
                                  ) : (
                                    <input
                                      type={param.type}
                                      value={step.params[param.name]}
                                      onChange={(e) =>
                                        handleUpdateParams(
                                          step.id,
                                          param.name,
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-2 bg-background border border-border rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-card sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Pipeline Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Operations:</span>
                <span className="font-medium">{steps.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Files:</span>
                <span className="font-medium">{files.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Est. Time:</span>
                <span className="font-medium">~{steps.length * 2 + 2}s</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-900">Success!</h3>
                </div>
                <a
                  href={result.url}
                  download={result.filename}
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Download Result
                </a>
              </div>
            )}

            <button
              onClick={handleExecutePipeline}
              disabled={processing || steps.length === 0 || files.length === 0}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" /> Run Pipeline
                </>
              )}
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="px-3 py-2 text-sm font-medium text-secondary hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Save className="h-4 w-4" /> Save
              </button>
              <button className="px-3 py-2 text-sm font-medium text-secondary hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors flex items-center justify-center gap-2">
                <MoreVertical className="h-4 w-4" /> Options
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
