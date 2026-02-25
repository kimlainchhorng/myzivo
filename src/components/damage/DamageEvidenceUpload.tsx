/**
 * Damage Evidence Upload Component
 * Multi-file upload for damage photos
 */

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  caption: string;
  uploading: boolean;
  uploaded: boolean;
}

interface DamageEvidenceUploadProps {
  imageType: "damage" | "before" | "after";
  onFilesSelected: (files: { file: File; caption: string }[]) => void;
  maxFiles?: number;
  required?: boolean;
}

export default function DamageEvidenceUpload({
  imageType,
  onFilesSelected,
  maxFiles = 10,
  required = false,
}: DamageEvidenceUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const remainingSlots = maxFiles - files.length;

      if (selectedFiles.length > remainingSlots) {
        toast.error(`You can only upload ${maxFiles} photos maximum`);
        return;
      }

      const validFiles = selectedFiles.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });

      const newFiles: UploadedFile[] = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        caption: "",
        uploading: false,
        uploaded: false,
      }));

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles.map((f) => ({ file: f.file, caption: f.caption })));

      // Reset input
      e.target.value = "";
    },
    [files, maxFiles, onFilesSelected]
  );

  const handleRemoveFile = useCallback(
    (id: string) => {
      const updatedFiles = files.filter((f) => f.id !== id);
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles.map((f) => ({ file: f.file, caption: f.caption })));
    },
    [files, onFilesSelected]
  );

  const handleCaptionChange = useCallback(
    (id: string, caption: string) => {
      const updatedFiles = files.map((f) =>
        f.id === id ? { ...f, caption } : f
      );
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles.map((f) => ({ file: f.file, caption: f.caption })));
    },
    [files, onFilesSelected]
  );

  const typeLabels = {
    damage: "Damage Photos",
    before: "Before Photos",
    after: "After Photos",
  };

  const typeDescriptions = {
    damage: "Upload clear photos showing the damage",
    before: "Upload photos from before the rental (if available)",
    after: "Upload photos showing the vehicle after the rental",
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {typeLabels[imageType]}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          {typeDescriptions[imageType]}
        </p>
      </div>

      {/* Upload area */}
      {files.length < maxFiles && (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id={`evidence-upload-${imageType}`}
          />
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-all duration-200">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 10MB each ({files.length}/{maxFiles} photos)
            </p>
          </div>
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group border rounded-xl overflow-hidden bg-muted"
            >
              {/* Image preview */}
              <div className="aspect-square relative">
                <img
                  src={file.preview}
                  alt="Evidence preview"
                  className="w-full h-full object-cover"
                />
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Upload status */}
                {file.uploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* Caption input */}
              <div className="p-2">
                <Input
                  placeholder="Add caption (optional)"
                  value={file.caption}
                  onChange={(e) => handleCaptionChange(file.id, e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && required && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          At least one photo is required
        </p>
      )}
    </div>
  );
}
