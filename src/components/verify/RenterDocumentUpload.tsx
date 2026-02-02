/**
 * Renter Document Upload Component
 * For uploading license images and selfie
 */

import { useState, useCallback } from "react";
import { Upload, CheckCircle, Loader2, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadRenterDocument } from "@/hooks/useRenterVerification";
import type { RenterDocumentType, RenterDocument } from "@/types/renter";

interface RenterDocumentUploadProps {
  renterId: string;
  documentType: RenterDocumentType;
  label: string;
  description: string;
  existingDocument?: RenterDocument;
  onUploaded?: (doc: RenterDocument) => void;
}

export default function RenterDocumentUpload({
  renterId,
  documentType,
  label,
  description,
  existingDocument,
  onUploaded,
}: RenterDocumentUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    existingDocument?.file_url || null
  );
  const uploadMutation = useUploadRenterDocument();

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload
      const result = await uploadMutation.mutateAsync({
        renterId,
        documentType,
        file,
      });

      if (result && onUploaded) {
        onUploaded(result);
      }
    },
    [renterId, documentType, uploadMutation, onUploaded]
  );

  const handleClear = () => {
    setPreview(null);
  };

  const isUploading = uploadMutation.isPending;
  const isUploaded = !!preview || !!existingDocument;
  const status = existingDocument?.status;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <p className="text-xs text-muted-foreground">{description}</p>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-colors",
          isUploaded
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-border hover:border-primary/50",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={label}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              {status === "approved" && (
                <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Approved
                </div>
              )}
              {status === "pending" && (
                <div className="bg-amber-500 text-white px-2 py-1 rounded text-xs">
                  Pending Review
                </div>
              )}
              {status === "rejected" && (
                <div className="bg-destructive text-white px-2 py-1 rounded text-xs">
                  Rejected
                </div>
              )}
              <Button
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault();
                  handleClear();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <FileImage className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">Click or drag to upload</p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
