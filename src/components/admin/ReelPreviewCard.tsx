import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

interface ReelPreviewCardProps {
  url: string;
  isVideo: boolean;
  onRemove: () => void;
}

export default function ReelPreviewCard({ url, isVideo, onRemove }: ReelPreviewCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const video = videoRef.current;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }, [isVideo, url]);

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
        <div className="relative h-full w-full bg-foreground/5">
          <video
            ref={videoRef}
            src={url}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            controls
            playsInline
            preload="metadata"
            onLoadedData={() => {
              if (!videoRef.current) return;
              void videoRef.current.play().catch(() => undefined);
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/40 to-transparent" />
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