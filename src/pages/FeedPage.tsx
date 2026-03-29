/**
 * FeedPage — TikTok / Facebook Reels style full-screen vertical feed
 * Each post fills the entire viewport. Swipe up/down to navigate.
 * Videos auto-play when scrolled into view, pause when scrolled away.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStorePostMediaUrl } from "@/utils/normalizeStorePostMediaUrl";
import { useI18n } from "@/hooks/useI18n";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import {
  Loader2, Heart, MessageCircle, Share2, Store,
  Play, Volume2, VolumeX, RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { repairVideoBlob } from "@/utils/videoRepair";

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
  likes_count?: number;
  comments_count?: number;
}

function looksPlayableVideoElement(video: HTMLVideoElement) {
  const hasDuration = Number.isFinite(video.duration) && video.duration > 0;
  const hasDimensions = video.videoWidth > 0 && video.videoHeight > 0;
  const hasDecodedFrame = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

  return hasDuration && hasDimensions && hasDecodedFrame;
}

// ── Individual reel card ──────────────────────────────────────────────────────

function ReelCard({
  post,
  isActive,
  globalMuted,
  onToggleMute,
  onNavigate,
}: {
  post: FeedPost;
  isActive: boolean;
  globalMuted: boolean;
  onToggleMute: () => void;
  onNavigate: (slug: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [triedBlobFallback, setTriedBlobFallback] = useState(false);
  const [triedFFmpegRepair, setTriedFFmpegRepair] = useState(false);
  const [hasLoadedFrame, setHasLoadedFrame] = useState(false);
  const [liked, setLiked] = useState(false);

  const normalizedUrls = useMemo(
    () => (post.media_urls || []).map((u) => normalizeStorePostMediaUrl(u)).filter(Boolean),
    [post.media_urls],
  );
  const firstUrl = normalizedUrls[0] || "";
  const detectedVideoUrl = normalizedUrls.find((url) => /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url));
  const isVideoPost = post.media_type === "video" || Boolean(detectedVideoUrl);
  const sourceUrl = detectedVideoUrl || firstUrl;

  // Must be defined before effects that reference it
  const currentSrc = blobSrc || sourceUrl;

  // Auto-play / pause when active changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoPost) return;

    if (isActive) {
      video.muted = globalMuted;
      void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, isVideoPost]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-attempt play whenever the video source changes (e.g. after blob/repair recovery).
  // When <video key={currentSrc}> remounts with a new src the isActive effect above
  // does NOT re-run (its deps are unchanged), so this dedicated effect fills that gap.
  // globalMuted is intentionally excluded — mute sync is handled by its own effect.
  useEffect(() => {
    if (!isActive || !isVideoPost || !currentSrc) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = globalMuted;
    void video.play().then(() => setIsPlaying(true)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc]);

  // Reset per-post playback state when source changes
  useEffect(() => {
    setIsPlaying(false);
    setHasPlaybackError(false);
    setIsRepairing(false);
    setTriedBlobFallback(false);
    setTriedFFmpegRepair(false);
    setHasLoadedFrame(false);
    if (blobSrc) {
      URL.revokeObjectURL(blobSrc);
      setBlobSrc(null);
    }
  }, [post.id, sourceUrl]);

  // Sync global mute toggle
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = globalMuted;
  }, [globalMuted]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (blobSrc) URL.revokeObjectURL(blobSrc);
    };
  }, [blobSrc]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const capturePoster = (video: HTMLVideoElement) => {
    if (video.videoWidth === 0) return;
    // Skip the black frame that exists before the seek settles at a real position.
    if (video.currentTime < 0.5) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      setPosterUrl(canvas.toDataURL("image/jpeg", 0.8));
    } catch (err) {
      // On CORS canvas taint, fall back to blob so the next capture succeeds.
      if (err instanceof DOMException && err.name === "SecurityError") {
        void tryBlobFallback(blobSrc ?? sourceUrl ?? "");
      }
    }
  };

  const tryBlobFallback = async (url: string) => {
    if (triedBlobFallback) return;
    setTriedBlobFallback(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("fetch failed");
      const blob = await resp.blob();
      setBlobSrc(URL.createObjectURL(new Blob([blob], { type: blob.type || "video/mp4" })));
      setHasPlaybackError(false);
    } catch {
      // Keep quiet here; FFmpeg repair is attempted next.
    }
  };

  const tryFFmpegRepair = async (url: string) => {
    if (triedFFmpegRepair) return;
    setTriedFFmpegRepair(true);
    setIsRepairing(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("fetch failed");
      const blob = await resp.blob();
      const repairedUrl = await repairVideoBlob(blob);
      if (repairedUrl) {
        if (blobSrc) URL.revokeObjectURL(blobSrc);
        setBlobSrc(repairedUrl);
        setHasPlaybackError(false);
      } else {
        setHasPlaybackError(true);
      }
    } catch {
      setHasPlaybackError(true);
    } finally {
      setIsRepairing(false);
    }
  };

  const runRecovery = async () => {
    if (!sourceUrl) {
      setHasPlaybackError(true);
      return;
    }

    if (!triedBlobFallback) {
      await tryBlobFallback(sourceUrl);
      return;
    }

    if (!triedFFmpegRepair) {
      await tryFFmpegRepair(sourceUrl);
      return;
    }

    setHasPlaybackError(true);
  };

  // Stall detection: fires once after 6 s if the video has not shown a frame.
  // triedBlobFallback / triedFFmpegRepair are intentionally NOT in the dep array —
  // including them caused stacked timers that prematurely set hasPlaybackError=true
  // (as early as 5.4 s) before async recovery finished on slow connections.
  // The stall condition avoids false positives for videos that are merely buffering.
  useEffect(() => {
    if (!isActive || !isVideoPost || !currentSrc || hasLoadedFrame || isRepairing) return;

    const timeoutId = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;

      // Only recover when the network has truly stalled, or when metadata is loaded
      // but dimensions are zero (the iOS black-frame bug). Do NOT trigger while the
      // browser is still buffering normally (NETWORK_LOADING).
      const trulyStalled =
        video.networkState === HTMLMediaElement.NETWORK_STALLED ||
        (video.readyState >= HTMLMediaElement.HAVE_METADATA &&
          (video.videoWidth === 0 || video.videoHeight === 0));

      if (trulyStalled) {
        void runRecovery();
      }
    }, 6000);

    return () => window.clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isVideoPost, currentSrc, hasLoadedFrame, isRepairing]);

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden snap-start flex-shrink-0">
      {/* Media */}
      {isVideoPost ? (
        <video
          ref={videoRef}
          key={currentSrc}
          src={currentSrc}
          poster={posterUrl ?? undefined}
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop
          muted
          preload={isActive ? "auto" : "metadata"}
          onLoadedData={(e) => {
            setHasLoadedFrame(true);
            setHasPlaybackError(false);
            capturePoster(e.currentTarget);
            if (isActive) {
              e.currentTarget.muted = globalMuted;
              void e.currentTarget.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }}
          onCanPlay={(e) => {
            if (!looksPlayableVideoElement(e.currentTarget)) return;
            setHasLoadedFrame(true);
            setHasPlaybackError(false);
            // Don't capture here — the seek from onLoadedMetadata hasn't finished yet.
            if (isActive) {
              e.currentTarget.muted = globalMuted;
              void e.currentTarget.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }}
          onLoadedMetadata={(e) => {
            // Seek to 10% of duration, at least 1.5 s, capped at 3 s — skips dark iPhone intros.
            const dur = e.currentTarget.duration;
            if (Number.isFinite(dur) && dur > 0) {
              const t = Math.min(3, Math.max(dur * 0.1, 1.5));
              try { e.currentTarget.currentTime = t; } catch { /* ignore */ }
            }
          }}
          onSeeked={(e) => {
            capturePoster(e.currentTarget);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={async () => {
            setIsPlaying(false);
            await runRecovery();
          }}
        />
      ) : (
        <img
          src={firstUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading={isActive ? "eager" : "lazy"}
        />
      )}

      {/* Tap-to-play/pause */}
      {isVideoPost && !hasPlaybackError && !isRepairing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-10"
          aria-label={isPlaying ? "Pause" : "Play"}
        />
      )}

      {/* Paused indicator */}
      {isVideoPost && !isPlaying && !hasPlaybackError && !isRepairing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Converting overlay */}
      {isRepairing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/70">
          <RefreshCw className="w-10 h-10 text-white animate-spin" />
          <p className="text-sm text-white font-medium">Converting video\u2026</p>
        </div>
      )}

      {/* Playback error */}
      {hasPlaybackError && !isRepairing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 px-8 text-center">
          <p className="text-sm font-semibold text-white">Video needs to be fixed</p>
          <p className="text-xs text-white/70">
            Go to Store Admin \u2192 Feed Posts \u2192 tap &quot;Fix Video&quot;
          </p>
        </div>
      )}

      {/* Gradient for readability */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/65 via-transparent to-black/10" />

      {/* Bottom-left: store info + caption */}
      <div
        className="absolute bottom-0 left-0 right-16 z-30 px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      >
        <button
          type="button"
          onClick={() => post.store_slug && onNavigate(post.store_slug)}
          className="flex items-center gap-2.5 mb-2.5 active:opacity-70"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 bg-black/40 flex-shrink-0">
            {post.store_logo ? (
              <img src={post.store_logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <span className="text-white font-bold text-sm drop-shadow-lg">{post.store_name}</span>
        </button>
        {post.caption && (
          <p className="text-white text-sm line-clamp-3 drop-shadow leading-snug">
            {post.caption}
          </p>
        )}
      </div>

      {/* Right-side action buttons (TikTok-style) */}
      <div
        className="absolute right-3 z-30 flex flex-col items-center gap-5"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)" }}
      >
        {/* Mute/Unmute */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          className="flex flex-col items-center gap-1"
          aria-label={globalMuted ? "Unmute" : "Mute"}
        >
          <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center">
            {globalMuted
              ? <VolumeX className="w-5 h-5 text-white" />
              : <Volume2 className="w-5 h-5 text-white" />
            }
          </div>
        </button>

        {/* Like */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setLiked((l) => !l); }}
          className="flex flex-col items-center gap-1"
          aria-label="Like"
        >
          <Heart
            className={cn(
              "w-9 h-9 drop-shadow-lg transition-transform active:scale-125",
              liked ? "text-red-500 fill-red-500" : "text-white",
            )}
          />
          <span className="text-white text-xs font-semibold drop-shadow">
            {(post.likes_count || 0) + (liked ? 1 : 0)}
          </span>
        </button>

        {/* Comment */}
        <button type="button" className="flex flex-col items-center gap-1" aria-label="Comment">
          <MessageCircle className="w-9 h-9 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            {post.comments_count || 0}
          </span>
        </button>

        {/* Share */}
        <button type="button" className="flex flex-col items-center gap-1" aria-label="Share">
          <Share2 className="w-9 h-9 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">Share</span>
        </button>
      </div>
    </div>
  );
}

// Main FeedPage

export default function FeedPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [globalMuted, setGlobalMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["customer-feed"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("store_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

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

  // IntersectionObserver: set activeIndex when a card is 60% visible
  useEffect(() => {
    if (posts.length === 0) return;
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveIndex(index);
          }
        },
        { threshold: 0.6 },
      );
      obs.observe(card);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [posts.length]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Loader2 className="h-9 w-9 animate-spin text-white" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
        <Store className="h-14 w-14 text-white/20" />
        <p className="text-white font-semibold">{t("feed.no_posts")}</p>
        <p className="text-white/50 text-sm text-center px-8">{t("feed.no_posts_desc")}</p>
        <ZivoMobileNav />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Snap-scroll reel container */}
      <div
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            ref={(el) => { cardRefs.current[index] = el; }}
            className="w-full h-[100dvh] snap-start"
          >
            <ReelCard
              post={post}
              isActive={activeIndex === index}
              globalMuted={globalMuted}
              onToggleMute={() => setGlobalMuted((m) => !m)}
              onNavigate={(slug) => navigate(`/grocery/shop/${slug}`)}
            />
          </div>
        ))}
      </div>

      {/* Bottom navigation overlaid on top */}
      <ZivoMobileNav />
    </div>
  );
}
