/**
 * KYC Document Upload Component
 * Drag-and-drop document upload with preview
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDocumentType, getDocumentSignedUrl } from "@/lib/kyc";
import type { KYCDocument } from "@/lib/kyc";

interface KYCDocumentUploadProps {
  documentType: string;
  label?: string;
  description?: string;
  existingDocument?: KYCDocument;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  isUploading?: boolean;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function KYCDocumentUpload({
  documentType,
  label,
  description,
  existingDocument,
  onUpload,
  onRemove,
  isUploading = false,
  accept = "image/*,.pdf",
  maxSizeMB = 10,
  className,
}: KYCDocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayLabel = label || formatDocumentType(documentType);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    const allowedTypes = accept.split(",").map(t => t.trim());
    const isAllowed = allowedTypes.some(type => {
      if (type === "image/*") return file.type.startsWith("image/");
      if (type === ".pdf") return file.type === "application/pdf";
      return file.type === type;
    });

    if (!isAllowed) {
      return "File type not allowed";
    }

    return null;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }, [onUpload, maxSizeMB, accept]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }

    // Reset input
    e.target.value = "";
  }, [onUpload, maxSizeMB, accept]);

  const handlePreview = async () => {
    if (!existingDocument?.url) return;

    setIsLoadingPreview(true);
    try {
      const url = await getDocumentSignedUrl(existingDocument.url);
      if (url) {
        setPreviewUrl(url);
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Error loading preview:", err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleRemove = async () => {
    if (onRemove) {
      await onRemove();
    }
  };

  const isImage = existingDocument?.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">
        {displayLabel}
      </label>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <AnimatePresence mode="wait">
        {existingDocument ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative border rounded-xl p-4 bg-green-500/10 border-green-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                {isImage ? (
                  <Image className="w-5 h-5 text-green-500" />
                ) : (
                  <FileText className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {existingDocument.fileName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Uploaded</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handlePreview}
                  disabled={isLoadingPreview}
                  className="h-8 w-8"
                >
                  {isLoadingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                
                {onRemove && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleRemove}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all",
              isDragOver 
                ? "border-primary bg-primary/10" 
                : "border-muted hover:border-primary/50 hover:bg-muted/50",
              isUploading && "pointer-events-none opacity-60",
              error && "border-destructive"
            )}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            ) : (
              <Upload className={cn(
                "w-8 h-8 mb-2",
                isDragOver ? "text-primary" : "text-muted-foreground"
              )} />
            )}

            <p className="text-sm font-medium text-center">
              {isUploading 
                ? "Uploading..." 
                : isDragOver 
                ? "Drop file here" 
                : "Drag & drop or click to upload"
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, or PDF up to {maxSizeMB}MB
            </p>
          </motion.label>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-destructive text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

export default KYCDocumentUpload;
