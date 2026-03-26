import { useEffect, useRef, useState } from "react";
import { Play, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelPreviewCardProps {
  url: string;
  isVideo: boolean;
  onRemove: () => void;
}

export default function ReelPreviewCard({ url, isVideo, onRemove }: ReelPreviewCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(isVideo);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const video = videoRef.current;
    video.currentTime = 0;
    void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [isVideo, url]);

  const toggleVideo = () => {
    if (!videoRef.current || !isVideo) return;

    if (videoRef.current.paused) {
      void videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }

    videoRef.current.pause();
    setIsPlaying(false);
  };

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
        <div role="button" tabIndex={0} onClick={toggleVideo} onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleVideo();
          }
        }} className="relative h-full w-full cursor-pointer bg-foreground/5">
          <video
            ref={videoRef}
            src={url}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/40 to-transparent" />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200",
              isPlaying ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm">
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            </div>
          </div>
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