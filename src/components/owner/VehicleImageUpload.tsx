/**
 * Vehicle Image Upload Component
 * Multi-image upload with preview and reordering
 */

import { useState, useCallback } from "react";
import { Upload, X, GripVertical, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUploadVehicleImage } from "@/hooks/useP2PVehicle";
import { toast } from "sonner";

interface VehicleImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  vehicleId?: string;
  maxImages?: number;
}

export function VehicleImageUpload({
  images,
  onImagesChange,
  vehicleId,
  maxImages = 10,
}: VehicleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const uploadImage = useUploadVehicleImage();

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const remaining = maxImages - images.length;
      if (files.length > remaining) {
        toast.error(`You can only upload ${remaining} more image(s)`);
        return;
      }

      setUploading(true);
      const newUrls: string[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        try {
          const url = await uploadImage.mutateAsync({ file, vehicleId });
          newUrls.push(url);
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }

      if (newUrls.length > 0) {
        onImagesChange([...images, ...newUrls]);
      }
      setUploading(false);
      
      // Reset input
      e.target.value = "";
    },
    [images, maxImages, vehicleId, uploadImage, onImagesChange]
  );

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <Card
            key={url}
            className={cn(
              "relative aspect-[4/3] overflow-hidden group",
              index === 0 && "md:col-span-2 md:row-span-2"
            )}
          >
            <img
              src={url}
              alt={`Vehicle image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {index > 0 && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => moveImage(index, index - 1)}
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Primary badge */}
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
                Primary
              </div>
            )}
          </Card>
        ))}

        {/* Upload button */}
        {images.length < maxImages && (
          <Card className="aspect-[4/3] border-dashed border-2 hover:border-primary/50 transition-all duration-200 cursor-pointer">
            <label className="flex flex-col items-center justify-center h-full cursor-pointer p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {uploading ? (
                <div className="animate-pulse">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground text-center">
                    Add photos
                  </span>
                  <span className="text-xs text-muted-foreground/60 mt-1">
                    {images.length}/{maxImages}
                  </span>
                </>
              )}
            </label>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        First image will be the primary photo. Drag to reorder. Max 5MB per image.
      </p>
    </div>
  );
}
