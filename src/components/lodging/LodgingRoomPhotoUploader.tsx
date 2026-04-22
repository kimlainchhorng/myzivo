/**
 * LodgingRoomPhotoUploader — thumbnail grid for room photos with cover selector.
 * Up to 8 photos. Tap ★ to set the cover photo (defaults to the first).
 */
import { useRef, useState } from "react";
import { ImagePlus, X, ArrowLeft, ArrowRight, Loader2, Star } from "lucide-react";
import { uploadStoreAsset } from "@/pages/admin/utils/uploadStoreAsset";
import { toast } from "sonner";

interface Props {
  storeId: string;
  photos: string[];
  onChange: (next: string[]) => void;
  coverIndex?: number;
  onCoverChange?: (index: number) => void;
  max?: number;
}

export function LodgingRoomPhotoUploader({
  storeId, photos, onChange,
  coverIndex = 0, onCoverChange,
  max = 8,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const safeCover = Math.min(Math.max(coverIndex, 0), Math.max(0, photos.length - 1));

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = max - photos.length;
    if (remaining <= 0) { toast.error(`Max ${max} photos`); return; }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const { publicUrl } = await uploadStoreAsset({
          storeId,
          file,
          surface: "room",
          filename: `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        });
        uploaded.push(publicUrl);
      }
      onChange([...photos, ...uploaded]);
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} added`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => {
    const next = photos.filter((_, i) => i !== idx);
    onChange(next);
    if (onCoverChange) {
      // shift cover down if a photo before it was removed
      if (idx < safeCover) onCoverChange(safeCover - 1);
      else if (idx === safeCover) onCoverChange(0);
    }
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...photos];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
    if (onCoverChange) {
      if (idx === safeCover) onCoverChange(target);
      else if (target === safeCover) onCoverChange(idx);
    }
  };

  const setCover = (idx: number) => {
    if (onCoverChange) onCoverChange(idx);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {photos.length}/{max} photos{onCoverChange ? " · tap ★ to set cover" : " · first is cover"}
        </span>
        {uploading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => {
          const isCover = i === safeCover;
          return (
            <div key={url + i} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/30 group">
              <img src={url} alt={`Room ${i + 1}`} className="h-full w-full object-cover" />

              {isCover && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-0.5">
                  <Star className="h-2 w-2 fill-current" /> Cover
                </div>
              )}

              {/* Set-as-cover star (hidden when already cover) */}
              {!isCover && onCoverChange && (
                <button
                  type="button"
                  onClick={() => setCover(i)}
                  aria-label="Set as cover"
                  title="Set as cover"
                  className="absolute top-1 left-1 h-5 w-5 rounded-full bg-background/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                >
                  <Star className="h-3 w-3 text-foreground" />
                </button>
              )}

              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove photo"
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/90 flex items-center justify-center shadow"
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
              <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="h-5 w-5 rounded-full bg-background/90 flex items-center justify-center disabled:opacity-30">
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1}
                  className="h-5 w-5 rounded-full bg-background/90 flex items-center justify-center disabled:opacity-30">
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
