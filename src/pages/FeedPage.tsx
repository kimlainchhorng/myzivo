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
import { Loader2, Heart, MessageCircle, Share2, Store, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLoadPromiseRef = useRef<Promise<FFmpeg> | null>(null);
  const compatibilityCacheRef = useRef<Map<string, string>>(new Map());
  const pendingPlayRef = useRef(false);
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState(urls[0] ?? "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparingFallback, setIsPreparingFallback] = useState(false);

  const isVideo = (url: string) => /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url) || /\.(mp4|mov|webm|avi|mkv)/i.test(url);

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

  const ensureFFmpegLoaded = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    if (!ffmpegLoadPromiseRef.current) {
      ffmpegLoadPromiseRef.current = (async () => {
        const ffmpeg = new FFmpeg();
        await ffmpeg.load({
          coreURL: ffmpegCoreUrl,
          wasmURL: ffmpegWasmUrl,
        });
        ffmpegRef.current = ffmpeg;
        return ffmpeg;
      })().catch((error) => {
        ffmpegLoadPromiseRef.current = null;
        throw error;
      });
    }

    return ffmpegLoadPromiseRef.current;
  };

  const createCompatibilitySrc = async (sourceUrl: string) => {
    const cached = compatibilityCacheRef.current.get(sourceUrl);
    if (cached) return cached;

    const ffmpeg = await ensureFFmpegLoaded();
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error("Unable to fetch video for compatibility playback.");
    }

    const inputName = `feed-video-${activeIndex}.mp4`;
    const outputName = `feed-video-${activeIndex}-compat.mp4`;

    await ffmpeg.writeFile(inputName, await fetchFile(await response.blob()));

    try {
      await ffmpeg.exec([
        "-i", inputName,
        "-movflags", "+faststart",
        "-pix_fmt", "yuv420p",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-profile:v", "baseline",
        "-level", "3.0",
        "-an",
        "-y",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Failed to build compatible video.");
      }

      const objectUrl = URL.createObjectURL(new Blob([data], { type: "video/mp4" }));
      compatibilityCacheRef.current.set(sourceUrl, objectUrl);
      return objectUrl;
    } finally {
      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName),
      ]);
    }
  };

  const playCurrentVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    ensureVisibleFrame(video);

    try {
      await video.play();
      video.controls = false;
      setIsPlaying(true);
    } catch {
      try {
        setIsPreparingFallback(true);
        pendingPlayRef.current = true;
        const compatibleSrc = await createCompatibilitySrc(urls[activeIndex]);
        setResolvedVideoSrc(compatibleSrc);
      } catch {
        video.controls = true;
        setIsPlaying(false);
      } finally {
        setIsPreparingFallback(false);
      }
    }
  };

  const pauseVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.controls = true;
    setIsPlaying(false);
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

  useEffect(() => {
    const nextSource = urls[activeIndex] ?? "";
    setResolvedVideoSrc(compatibilityCacheRef.current.get(nextSource) ?? nextSource);
    setIsPlaying(false);
    setIsPreparingFallback(false);
    pendingPlayRef.current = false;
  }, [activeIndex, urls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.controls = true;
    video.currentTime = 0;
    video.load();
  }, [resolvedVideoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !pendingPlayRef.current) return;

    pendingPlayRef.current = false;
    ensureVisibleFrame(video);
    video.play().then(() => {
      video.controls = false;
      setIsPlaying(true);
    }).catch(() => {
      video.controls = true;
      setIsPlaying(false);
    });
  }, [resolvedVideoSrc]);

  useEffect(() => {
    return () => {
      compatibilityCacheRef.current.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      compatibilityCacheRef.current.clear();
    };
  }, []);

  return (
    <div className="relative bg-muted">
      <div className="aspect-square overflow-hidden">
        {isVideo(urls[activeIndex]) ? (
          <div className="relative w-full h-full">
            <video
              key={resolvedVideoSrc}
              ref={videoRef}
              src={resolvedVideoSrc}
              className="w-full h-full object-cover"
              playsInline
              loop
              muted
              controls
              preload="metadata"
              onLoadedMetadata={(event) => {
                event.currentTarget.controls = true;
                ensureVisibleFrame(event.currentTarget);
              }}
              onPlay={(event) => {
                event.currentTarget.controls = false;
                setIsPlaying(true);
              }}
              onPause={(event) => {
                event.currentTarget.controls = true;
                setIsPlaying(false);
              }}
            />
            {!isPlaying && !isPreparingFallback && (
              <button
                type="button"
                onClick={toggleVideo}
                className="absolute inset-0 flex items-center justify-center bg-black/20"
                aria-label="Play video"
              >
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-foreground ml-0.5" fill="currentColor" />
                </div>
              </button>
            )}
            {isPreparingFallback && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm font-medium">Preparing video…</span>
              </div>
            )}
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
