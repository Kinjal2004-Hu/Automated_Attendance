import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload, X, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface FaceUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  currentCount?: number;
}

export function FaceUpload({
  onUpload,
  maxFiles = 3,
  currentCount = 0,
}: FaceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return "Invalid file format. Please upload JPG, PNG, or WebP images.";
    }

    if (file.size > maxSize) {
      return "File size exceeds 10MB limit.";
    }

    return null;
  };

  // Handle files
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const filesArray = Array.from(files);
      const remainingSlots = maxFiles - currentCount - uploadedFiles.length;

      if (remainingSlots <= 0) {
        setError(`Maximum ${maxFiles} photos reached.`);
        return;
      }

      // Validate all files
      const validated: File[] = [];
      for (const file of filesArray.slice(0, remainingSlots)) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        validated.push(file);
      }

      setUploadedFiles([...uploadedFiles, ...validated]);
      onUpload(validated);
    },
    [maxFiles, currentCount, uploadedFiles, onUpload]
  );

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  return (
    <Card className="w-full p-4">
      <div className="space-y-4">
        {/* Title */}
        <div className="text-sm font-medium text-gray-700">
          Photos {currentCount + uploadedFiles.length} of {maxFiles}
        </div>

        {/* Upload Area */}
        {currentCount + uploadedFiles.length < maxFiles && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-400"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
              id="file-input"
            />

            <label htmlFor="file-input" className="cursor-pointer space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div className="space-y-1">
                <p className="font-medium text-gray-700">
                  Drag and drop or click to select
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG or WebP (Max 10MB each)
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">
              Selected Photos
            </p>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-gray-500 text-center">
          Upload clear photos of your face from different angles for better
          recognition accuracy.
        </p>
      </div>
    </Card>
  );
}
