"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle,
  FileText,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";

type UploadStatus = "ready" | "uploading" | "completed" | "error";

type VaultFileUploadProps = {
  disabled?: boolean;
  targetKey: string;
  description?: string;
  uploadButtonLabel?: string;
  successMessage?: string;
  compact?: boolean;
  onUpload: (
    file: File,
    onProgress: (progress: number) => void
  ) => Promise<void>;
};

const ACCEPTED_TYPES = "application/pdf,image/*";

const isPdf = (file: File) =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name);

const isImage = (file: File) =>
  file.type.startsWith("image/") ||
  /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(file.name);

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${
    units[unitIndex]
  }`;
};

export function VaultFileUpload({
  disabled,
  targetKey,
  description,
  uploadButtonLabel = "upload",
  successMessage = "filed.",
  compact = false,
  onUpload,
}: VaultFileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("ready");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const filePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const chooseFile = (file?: File) => {
    if (!file) return;

    if (!isPdf(file) && !isImage(file)) {
      setError("only pdfs and images allowed in the vault.");
      setStatus("error");
      return;
    }

    setSelectedFile(file);
    setProgress(0);
    setStatus("ready");
    setError(null);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError("pick a file first.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      await onUpload(selectedFile, setProgress);
      setProgress(100);
      setStatus("completed");
    } catch (uploadError) {
      setStatus("error");
      setError(
        uploadError instanceof Error ? uploadError.message : "upload failed."
      );
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setProgress(0);
    setStatus("ready");
    setError(null);
    if (filePickerRef.current) {
      filePickerRef.current.value = "";
    }
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0]);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  };

  const selectedIsImage = selectedFile ? isImage(selectedFile) : false;
  const selectedIsPdf = selectedFile ? isPdf(selectedFile) : false;

  return (
    <div className="flex w-full flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDropFiles}
        onClick={() => filePickerRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            filePickerRef.current?.click();
          }
        }}
        className={`group flex w-full cursor-pointer flex-col items-start gap-2 rounded-md border border-dashed bg-background px-4 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 ${
          isDragging
            ? "border-foreground/60 bg-muted/40"
            : "border-border/60 hover:border-foreground/30 hover:bg-muted/20"
        } ${compact ? "min-h-24 py-4" : "min-h-32 py-5"}`}
      >
        <div className="flex items-center gap-2 text-foreground">
          <Upload className="size-4 text-muted-foreground" aria-hidden />
          <span>
            drop a file or{" "}
            <span className="text-[var(--text-highlight)] underline decoration-[var(--text-highlight)]/30 underline-offset-2 group-hover:decoration-[var(--text-highlight)]">
              browse
            </span>{" "}
            for <span className="font-mono text-xs">{targetKey}</span>
          </span>
        </div>
        <input
          ref={filePickerRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_TYPES}
          onChange={onFileInputChange}
          disabled={disabled}
        />
        <span className="meta-tag normal-case tracking-[0.06em]">
          {description ?? "pdfs and images."}
        </span>
      </div>

      {selectedFile && (
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-content-center rounded-md border border-border/60 bg-muted/30">
              {status === "uploading" ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : selectedIsImage ? (
                <ImageIcon className="size-4 text-muted-foreground" />
              ) : (
                <FileText className="size-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="select-none truncate text-[13px] text-foreground">
                  {selectedFile.name}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="meta-tag tabular-nums">
                    {status === "uploading" || status === "completed"
                      ? `${progress}%`
                      : formatBytes(selectedFile.size)}
                  </span>
                  {status !== "uploading" && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      aria-label="remove"
                      className="hover-dim rounded p-0.5 text-muted-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <Progress
                value={progress}
                className="mt-1.5 h-1 w-full bg-border/40"
              />
            </div>
          </div>

          {!compact && previewUrl && selectedIsImage && (
            <div className="overflow-hidden rounded-md border border-border/60 bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="selected file preview"
                className="max-h-80 w-full object-contain"
              />
            </div>
          )}

          {!compact && previewUrl && selectedIsPdf && (
            <div className="overflow-hidden rounded-md border border-border/60">
              <iframe
                src={previewUrl}
                title="selected pdf preview"
                className="h-80 w-full bg-muted/20"
              />
            </div>
          )}

          {status === "completed" && (
            <p className="meta-tag inline-flex items-center gap-1.5 normal-case text-foreground">
              <CheckCircle className="size-3.5" />
              {successMessage}
            </p>
          )}

          {error && (
            <p className="meta-tag normal-case text-destructive">{error}</p>
          )}

          <button
            type="button"
            onClick={uploadFile}
            disabled={disabled || status === "uploading"}
            className="group/btn mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] text-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <span className="tabular-nums">
              {status === "uploading" ? "uploading..." : uploadButtonLabel}
            </span>
            <ArrowUpRight
              className="size-3.5 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              aria-hidden
            />
          </button>
        </div>
      )}
    </div>
  );
}
