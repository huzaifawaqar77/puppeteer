"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxSize?: number; // in MB
  accept?: string[];
  multiple?: boolean;
}

export function FileUploader({
  onFilesSelected,
  maxSize = 100,
  accept = ["application/pdf"],
  multiple = false,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (fileList: FileList | null): File[] => {
    if (!fileList) return [];
    
    const filesArray = Array.from(fileList);
    const validFiles: File[] = [];
    
    for (const file of filesArray) {
      // Check file type - handle both extensions (.pdf) and MIME types (application/pdf)
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = accept.includes("*/*") || 
                         accept.includes(file.type) || 
                         accept.some(acceptedType => 
                           acceptedType.startsWith('.') && acceptedType.toLowerCase() === fileExtension
                         );
      
      if (!isValidType) {
        setError(`File type ${file.type} is not supported. Accepted types: ${accept.join(', ')}`);
        continue;
      }
      
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        setError(`File ${file.name} exceeds ${maxSize}MB limit`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      setError("");

      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        setFiles(multiple ? [...files, ...validFiles] : validFiles);
        onFilesSelected(validFiles);
      }
    },
    [files, multiple, onFilesSelected, maxSize, accept]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError("");
    
    const validFiles = validateFiles(e.target.files);
    if (validFiles.length > 0) {
      setFiles(multiple ? [...files, ...validFiles] : validFiles);
      onFilesSelected(validFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 text-center transition-all",
          dragActive
            ? "border-primary bg-primary/10"
            : "border-white/20 bg-white/5 hover:border-primary/50 hover:bg-white/10"
        )}
      >
        <input
          type="file"
          id="file-upload"
          accept={accept.join(",")}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className={cn(
          "mx-auto h-12 w-12 transition-colors",
          dragActive ? "text-primary" : "text-gray-500"
        )} />
        
        <p className="mt-4 text-sm font-medium text-gray-400">
          Drop files here or click to browse
        </p>
        <p className="mt-2 text-xs text-gray-500">
          {accept.includes("application/pdf") || accept.includes(".pdf") ? "PDF" : "Files"} up to {maxSize}MB
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileIcon className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
