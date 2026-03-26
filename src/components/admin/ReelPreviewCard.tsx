import { useRef } from "react";
import { Trash2 } from "lucide-react";

interface ReelPreviewCardProps {
  url: string;
  isVideo: boolean;
  onRemove: () => void;
}

export default function ReelPreviewCard({ url, isVideo, onRemove }: ReelPreviewCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <div
      className="relative group rounded-lg overflow-hidden border border-border bg-card"
      style={{ aspectRatio: isVideo ? "9 / 16" : "1 / 1" }}
    >
      {isVideo ? (
        <div className="relative h-full w-full bg-muted/10">
          <video
            ref={videoRef}
            src={url}
            className="h-full w-full object-contain"
            controls
            playsInline
            preload="auto"
          />
        </div>
      ) : (
        <img src={url} alt="Post preview" className="h-full w-full object-cover" />
      )}

      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-1 right-1 z-10 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Remove media"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}