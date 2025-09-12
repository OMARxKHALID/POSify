"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Loader2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "Drop an image here or click to browse",
  maxSize = 5 * 1024 * 1024,
  accept = "image/*",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const { uploadToCloudinary } = useCloudinary();
  const fileInputRef = useRef(null);

  // Update preview when value changes (for edit mode)
  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > maxSize) {
        setError(
          `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
        );
        return;
      }

      setError("");
      setIsUploading(true);

      try {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        const cloudinaryUrl = await uploadToCloudinary(file);
        onChange(cloudinaryUrl);

        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        setError(err?.message || "Failed to upload image");
        setPreview("");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadToCloudinary, onChange, maxSize]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFileUpload(files[0]);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFileUpload(files[0]);
    },
    [handleFileUpload]
  );

  const handleRemove = () => {
    setPreview("");
    setError("");
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    setPreview(urlInput.trim());
    onChange(urlInput.trim());
    setUrlInput("");
    setShowUrlInput(false);
    setError("");
  };

  const handleClick = (e) => {
    if (
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "INPUT" ||
      e.target.closest("button") ||
      e.target.closest("input")
    ) {
      return;
    }
    if (!disabled && !isUploading && !showUrlInput) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative cursor-pointer transition-colors",
          disabled && "cursor-not-allowed opacity-50",
          isUploading && "cursor-wait"
        )}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <Card
          className={cn(
            "border-2 border-dashed transition-colors",
            isDragOver && "border-primary bg-primary/5",
            preview && "border-solid border-border",
            error && "border-destructive bg-destructive/5"
          )}
        >
          <CardContent className="p-6">
            {preview ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {isUploading ? "Uploading..." : "Image uploaded"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isUploading ? "Please wait..." : "Click to change"}
                  </p>
                </div>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : showUrlInput ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Enter Image URL</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1"
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim() || disabled}
                  >
                    Add
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUrlInput(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-2">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {isUploading ? "Uploading..." : placeholder}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isUploading
                    ? "Please wait..."
                    : "Supports: JPG, PNG, GIF, WebP (max 5MB)"}
                </p>
                {!isUploading && !disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUrlInput(true);
                    }}
                    className="mt-2 flex items-center gap-2"
                  >
                    <Link className="h-4 w-4" />
                    Use Image URL
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
