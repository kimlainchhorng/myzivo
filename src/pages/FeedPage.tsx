/**
 * FeedPage — Social media style feed showing store posts (photos & videos)
 * Customers can browse content posted by stores
 */
import { useQuery } from "@tanstack/react-query";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import ffmpegCoreUrl from "@ffmpeg/core?url";
import ffmpegWasmUrl from "@ffmpeg/core/wasm?url";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { Loader2, Heart, MessageCircle, Share2, Store, Play, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FeedPost {
  id: string;
  store_id: string;
  caption: string | null;
  media_urls: string[];
  media_type: string;
  is_published: boolean;
  created_at: string;
  store_name?: string;
  store_logo?: string;
  store_slug?: string;
}

let feedFFmpegInstance: FFmpeg | null = null;
let feedFFmpegLoadPromise: Promise<FFmpeg> | null = null;

async function ensureFeedFFmpegLoaded() {
  if (feedFFmpegInstance) return feedFFmpegInstance;

  if (!feedFFmpegLoadPromise) {
    feedFFmpegLoadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: ffmpegCoreUrl,
        wasmURL: ffmpegWasmUrl,
      });
      feedFFmpegInstance = ffmpeg;
      return ffmpeg;
    })().catch((error) => {
      feedFFmpegLoadPromise = null;
      throw error;
    });
  }

  return feedFFmpegLoadPromise;
}

async function transcodeFeedVideoForPlayback(sourceUrl: string) {
  const ffmpeg = await ensureFeedFFmpegLoaded();
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error("Failed to fetch source video");

  const blob = await response.blob();
  const inputName = `feed-input-${crypto.randomUUID()}.mp4`;
  const outputName = `feed-output-${crypto.randomUUID()}.mp4`;

  await ffmpeg.writeFile(inputName, await fetchFile(blob));

  try {
    await ffmpeg.exec([
      "-i", inputName,
      "-movflags", "+faststart",
      "-pix_fmt", "yuv420p",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-profile:v", "baseline",
      "-level", "3.0",
      "-c:a", "aac",
      "-profile:a", "aac_low",
      "-b:a", "128k",
      "-ar", "44100",
      "-ac", "2",
      "-y",
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    if (!(data instanceof Uint8Array)) {
      throw new Error("Failed to read converted video");
    }

    return URL.createObjectURL(new Blob([data], { type: "video/mp4" }));
  } finally {
    await Promise.allSettled([
      ffmpeg.deleteFile(inputName),
      ffmpeg.deleteFile(outputName),
    ]);
  }
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

function FeedMediaCarousel({ urls, mediaType }: { urls: string[]; mediaType: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const autoplayAfterRecoveryRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState(urls[0] ?? "");
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [hasRecoveredVideo, setHasRecoveredVideo] = useState(false);

  const isVideo = (url: string) => /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url) || /\.(mp4|mov|webm|avi|mkv)/i.test(url);

  const cleanupObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const ensureVisibleFrame = (video: HTMLVideoElement) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    const targetTime = Math.min(1, Math.max(video.duration * 0.1, 0.25));
    if (Math.abs(video.currentTime - targetTime) < 0.01) return;

    try {
      video.currentTime = targetTime;
    } catch {
      // Ignore seek failures on restrictive browsers.
    }
  };

  const capturePosterFrame = (video: HTMLVideoElement) => {
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const nextPoster = canvas.toDataURL("image/jpeg", 0.82);
      setPosterUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return nextPoster;
      });
    } catch {
      // Ignore poster extraction failures and fall back to video surface.
    }
  };

  const playCurrentVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    ensureVisibleFrame(video);

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      if (!hasRecoveredVideo) {
        void recoverVideoForPlayback(true);
      }
    }
  };

  const pauseVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void playCurrentVideo();
    } else {
      pauseVideo();
    }
  };

  const recoverVideoForPlayback = async (autoplayAfterRecovery = false) => {
    const sourceUrl = urls[activeIndex] ?? "";
    if (!sourceUrl || !isVideo(sourceUrl) || hasRecoveredVideo || isMediaLoading) return;

    try {
      setIsMediaLoading(true);
      autoplayAfterRecoveryRef.current = autoplayAfterRecovery;
      toast.info("Preparing this video for playback...");
      const fixedUrl = await transcodeFeedVideoForPlayback(sourceUrl);
      cleanupObjectUrl();
      objectUrlRef.current = fixedUrl;
      setResolvedSrc(fixedUrl);
      setHasRecoveredVideo(true);
    } catch {
      autoplayAfterRecoveryRef.current = false;
      toast.error("This video format is not supported on this device.");
    } finally {
      setIsMediaLoading(false);
    }
  };

  useEffect(() => {
    setIsPlaying(false);
    setIsMuted(true);
    setPosterUrl(null);
    setHasRecoveredVideo(false);
    autoplayAfterRecoveryRef.current = false;
    cleanupObjectUrl();
    setResolvedSrc(urls[activeIndex] ?? "");
    setIsMediaLoading(false);
  }, [activeIndex, urls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo(urls[activeIndex])) return;

    video.pause();
    video.currentTime = 0;
    video.muted = true;
    video.load();
  }, [activeIndex, resolvedSrc, urls]);

  useEffect(() => {
    return () => {
      cleanupObjectUrl();
    };
  }, []);

  return (
    <div className="relative bg-muted">
      <div className={cn("overflow-hidden bg-black", isVideo(urls[activeIndex]) ? "aspect-[9/16]" : "aspect-square")}>
        {isVideo(urls[activeIndex]) ? (
          <div className="relative w-full h-full">
            <video
              key={resolvedSrc}
              ref={videoRef}
              src={resolvedSrc}
              poster={posterUrl ?? undefined}
              className="w-full h-full object-cover"
              playsInline
              loop
              muted
              preload="metadata"
              onClick={toggleVideo}
              onLoadedMetadata={(event) => {
                event.currentTarget.muted = isMuted;
                ensureVisibleFrame(event.currentTarget);
              }}
              onLoadedData={(event) => {
                ensureVisibleFrame(event.currentTarget);
                capturePosterFrame(event.currentTarget);
                if (autoplayAfterRecoveryRef.current) {
                  autoplayAfterRecoveryRef.current = false;
                  void event.currentTarget.play().catch(() => {
                    setIsPlaying(false);
                  });
                }
              }}
              onPlay={(event) => {
                setIsMuted(event.currentTarget.muted);
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                setIsPlaying(false);
                if (!hasRecoveredVideo) {
                  void recoverVideoForPlayback(false);
                }
              }}
            />
            <button
              type="button"
              onClick={toggleVideo}
              className="absolute inset-0 z-10"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            />
            {!isPlaying && !isMediaLoading && (
              <button
                type="button"
                onClick={toggleVideo}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"
                aria-label="Play video"
              >
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-foreground ml-0.5" fill="currentColor" />
                </div>
              </button>
            )}
            {isMediaLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-foreground/10 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-background" />
              </div>
            )}
            <button
              type="button"
              onClick={toggleMute}
              className="absolute right-3 bottom-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <img
            src={urls[activeIndex]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Dots indicator */}
      {urls.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                i === activeIndex
                  ? "bg-white w-4 shadow-md"
                  : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["customer-feed"],
    queryFn: async () => {
      // Fetch posts with store info
      const { data: postsData, error } = await supabase
        .from("store_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      // Get unique store IDs
      const storeIds = [...new Set((postsData || []).map((p: any) => p.store_id))];
      if (storeIds.length === 0) return [];

      const { data: stores } = await supabase
        .from("store_profiles")
        .select("id, name, logo_url, slug")
        .in("id", storeIds);

      const storeMap = new Map((stores || []).map((s: any) => [s.id, s]));

      return (postsData || []).map((post: any) => {
        const store = storeMap.get(post.store_id);
        return {
          ...post,
          store_name: store?.name || "Store",
          store_logo: store?.logo_url,
          store_slug: store?.slug,
        } as FeedPost;
      });
    },
  });

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-center h-12 max-w-lg mx-auto px-4">
          <h1 className="text-lg font-bold text-foreground tracking-tight">{t("nav.feed")}</h1>
        </div>
      </div>

      {/* Feed content */}
      <div className="max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <Store className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-medium text-foreground mb-1">{t("feed.no_posts")}</p>
            <p className="text-sm text-muted-foreground">{t("feed.no_posts_desc")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-background"
                >
                  {/* Post header - store info */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => post.store_slug && navigate(`/grocery/shop/${post.store_slug}`)}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-muted border border-border/50 flex-shrink-0">
                      {post.store_logo ? (
                        <img src={post.store_logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{post.store_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(post.created_at)}</span>
                  </div>

                  {/* Media */}
                  <FeedMediaCarousel urls={post.media_urls} mediaType={post.media_type} />

                  {/* Actions */}
                  <div className="px-4 pt-3 pb-1 flex items-center gap-5">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="touch-manipulation active:scale-90 transition-transform"
                    >
                      <Heart
                        className={cn(
                          "w-6 h-6 transition-colors",
                          likedPosts.has(post.id)
                            ? "text-red-500 fill-red-500"
                            : "text-foreground"
                        )}
                      />
                    </button>
                    <button className="touch-manipulation active:scale-90 transition-transform">
                      <MessageCircle className="w-6 h-6 text-foreground" />
                    </button>
                    <button className="touch-manipulation active:scale-90 transition-transform">
                      <Share2 className="w-6 h-6 text-foreground" />
                    </button>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <div className="px-4 pb-3 pt-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold mr-1.5">{post.store_name}</span>
                        {post.caption}
                      </p>
                    </div>
                  )}

                  {!post.caption && <div className="pb-2" />}
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
