/**
 * FeedPage — TikTok / Facebook Reels style full-screen vertical feed
 * Each post fills the entire viewport. Swipe up/down to navigate.
 * Videos auto-play when scrolled into view, pause when scrolled away.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UnifiedShareSheet from "@/components/shared/ShareSheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeStorePostMediaUrl } from "@/utils/normalizeStorePostMediaUrl";
import { useI18n } from "@/hooks/useI18n";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import NavBar from "@/components/home/NavBar";
import CreatePostModal from "@/components/social/CreatePostModal";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Heart from "lucide-react/dist/esm/icons/heart";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Store from "lucide-react/dist/esm/icons/store";
import Play from "lucide-react/dist/esm/icons/play";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Send from "lucide-react/dist/esm/icons/send";
import XIcon from "lucide-react/dist/esm/icons/x";
import Eye from "lucide-react/dist/esm/icons/eye";
import Copy from "lucide-react/dist/esm/icons/copy";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Search from "lucide-react/dist/esm/icons/search";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import UserCircle from "lucide-react/dist/esm/icons/user-circle";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Music from "lucide-react/dist/esm/icons/music";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import Radio from "lucide-react/dist/esm/icons/radio";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getPostShareUrl } from "@/lib/getPublicOrigin";
// videoRepair is heavy (FFmpeg WASM) — dynamic import only when needed

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
  view_count?: number;
  audio_name?: string | null;
  source?: "store" | "user";
  author_id?: string;
  author_name?: string;
  author_avatar?: string | null;
}

/* ── Scrolling music ticker ───────────────────────────────────── */
function MusicTicker({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="flex items-center gap-2 max-w-[65%] overflow-hidden active:opacity-70"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shrink-0 animate-[spin_3s_linear_infinite]">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
      <div className="overflow-hidden">
        <div className="whitespace-nowrap animate-[marquee_8s_linear_infinite] text-white text-xs font-medium drop-shadow">
          {name} &nbsp;&nbsp; • &nbsp;&nbsp; {name}
        </div>
      </div>
    </button>
  );
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
  userId,
  userLikedPostIds,
  onToggleLike,
  onOpenComments,
  onOpenShare,
  onOpenSound,
}: {
  post: FeedPost;
  isActive: boolean;
  globalMuted: boolean;
  onToggleMute: () => void;
  onNavigate: (slug: string) => void;
  userId: string | null;
  userLikedPostIds: Set<string>;
  onToggleLike: (postId: string, currentlyLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
  onOpenShare: (postId: string) => void;
  onOpenSound: (soundName: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isBlobLoading, setIsBlobLoading] = useState(false);
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [triedBlobFallback, setTriedBlobFallback] = useState(false);
  const [triedFFmpegRepair, setTriedFFmpegRepair] = useState(false);
  const [hasLoadedFrame, setHasLoadedFrame] = useState(false);
  const viewTracked = useRef(false);

  // Follow state
  const authorId = post.source === "user" ? post.author_id : null;
  const isSelf = !!userId && userId === authorId;
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check follow status on mount
  useEffect(() => {
    if (!userId || !authorId || isSelf) return;
    supabase.rpc("is_following" as any, { target_user_id: authorId })
      .then(({ data }: any) => { if (typeof data === "boolean") setIsFollowing(data); });
  }, [userId, authorId, isSelf]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !authorId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from("user_followers" as any).delete()
          .eq("follower_id", userId).eq("following_id", authorId);
        setIsFollowing(false);
      } else {
        await (supabase as any).from("user_followers").insert({
          follower_id: userId,
          following_id: authorId,
        });
        setIsFollowing(true);
        // Notify new follower
        try {
          const { data: sp } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", userId).single();
          await supabase.functions.invoke("send-push-notification", {
            body: { user_id: authorId, notification_type: "new_follower", title: "New Follower 🔔", body: `${sp?.full_name || "Someone"} started following you`, data: { type: "new_follower", follower_id: userId, avatar_url: sp?.avatar_url, action_url: `/user/${userId}` } },
          });
        } catch {}
      }
    } catch { /* ignore */ } finally {
      setFollowLoading(false);
    }
  };

  const liked = userLikedPostIds.has(post.id);

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
  const renderSrc = blobSrc || (isBlobLoading ? "" : sourceUrl);

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

  // Track view when post becomes active (once per post per session)
  useEffect(() => {
    if (!isActive || viewTracked.current) return;
    viewTracked.current = true;
    // Fire-and-forget view increment
    supabase.rpc("increment_store_post_view_count" as any, { p_post_id: post.id }).then(() => {});
  }, [isActive, post.id]);

  // Reset per-post playback state when source changes
  useEffect(() => {
    setIsPlaying(false);
    setHasPlaybackError(false);
    setIsRepairing(false);
    setIsBlobLoading(false);
    setTriedBlobFallback(false);
    setTriedFFmpegRepair(false);
    setHasLoadedFrame(false);
    viewTracked.current = false;
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

  useEffect(() => {
    if (!isVideoPost || blobSrc || triedBlobFallback || !sourceUrl) return;
    if (!/^https?:\/\//i.test(sourceUrl)) return;

    // Capacitor iOS WebView is more reliable with same-origin blob URLs for remote videos.
    void tryBlobFallback(sourceUrl);
  }, [blobSrc, isVideoPost, sourceUrl, triedBlobFallback]);

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

  const handleMuteToggle = () => {
    const video = videoRef.current;
    const nextMuted = !globalMuted;

    onToggleMute();

    if (!video) return;

    video.muted = nextMuted;
    video.defaultMuted = nextMuted;
    video.volume = 1;

    if (!nextMuted) {
      void video.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          toast.error("Tap video once to enable sound");
        });
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
    setIsBlobLoading(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("fetch failed");
      const blob = await resp.blob();
      setBlobSrc(URL.createObjectURL(new Blob([blob], { type: blob.type || "video/mp4" })));
      setHasPlaybackError(false);
    } catch {
      // Keep quiet here; FFmpeg repair is attempted next.
    } finally {
      setIsBlobLoading(false);
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
      const { repairVideoBlob } = await import("@/utils/videoRepair");
      const repairedUrl = await repairVideoBlob(blob);
      if (repairedUrl) {
        if (blobSrc) URL.revokeObjectURL(blobSrc);
        setBlobSrc(repairedUrl);
        setHasPlaybackError(false);
      } else {
        setHasPlaybackError(false);
      }
    } catch {
      setHasPlaybackError(false);
    } finally {
      setIsRepairing(false);
    }
  };

  const runRecovery = async () => {
    if (isBlobLoading) return;

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

    setHasPlaybackError(false);
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
        video.networkState === 3 /* NETWORK_STALLED is not in all TS typings */ ||
        (video.readyState >= HTMLMediaElement.HAVE_METADATA &&
          (video.videoWidth === 0 || video.videoHeight === 0));

      if (trulyStalled) {
        void runRecovery();
      }
    }, 6000);

    return () => window.clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isVideoPost, currentSrc, hasLoadedFrame, isRepairing, isBlobLoading]);

  return (
    <div className="relative w-full h-[100dvh] lg:h-full bg-black overflow-hidden snap-start flex-shrink-0">
      {/* Media */}
      {isVideoPost ? (
        <video
          ref={videoRef}
          key={currentSrc}
          src={renderSrc || undefined}
          poster={posterUrl ?? undefined}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop
          muted={globalMuted}
          preload={isActive ? "auto" : "none"}
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
            if (isBlobLoading) return;
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
      {isVideoPost && !hasPlaybackError && !isRepairing && !isBlobLoading && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-10"
          aria-label={isPlaying ? "Pause" : "Play"}
        />
      )}

      {/* Paused indicator */}
      {isVideoPost && !isPlaying && !hasPlaybackError && !isRepairing && !isBlobLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Converting overlay */}
      {(isRepairing || isBlobLoading) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/70">
          <RefreshCw className="w-10 h-10 text-white animate-spin" />
          <p className="text-sm text-white font-medium">{isBlobLoading ? "Loading video..." : "Converting video..."}</p>
        </div>
      )}

      {/* Playback error */}
      {hasPlaybackError && !isRepairing && !isBlobLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 px-8 text-center">
          <p className="text-sm font-semibold text-white">Video is loading slowly</p>
          <p className="text-xs text-white/70">
            Tap once to retry playback.
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
        <div className="flex items-center gap-2.5 mb-2.5">
          <button
            type="button"
            onClick={() => {
              if (post.source === "user" && post.author_id) {
                onNavigate(`__user__${post.author_id}`);
              } else if (post.store_slug) {
                onNavigate(post.store_slug);
              }
            }}
            className="flex items-center gap-2.5 active:opacity-70"
          >
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/80 bg-black/40">
                {(post.source === "user" ? post.author_avatar : post.store_logo) ? (
                  <img src={(post.source === "user" ? post.author_avatar : post.store_logo)!} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              {/* TikTok-style + badge on avatar */}
              {authorId && !isSelf && !isFollowing && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-black">
                  <span className="text-primary-foreground text-[10px] font-bold leading-none">+</span>
                </div>
              )}
            </div>
            <span className="text-white font-bold text-sm drop-shadow-lg">
              {post.source === "user" ? post.author_name : post.store_name}
            </span>
          </button>

          {/* Follow / Following button */}
          {authorId && !isSelf && (
            <button
              type="button"
              onClick={handleFollow}
              disabled={followLoading}
              className={cn(
                "px-3.5 py-1 rounded-md text-xs font-semibold transition-all active:scale-95 border backdrop-blur-sm",
                isFollowing
                  ? "bg-white/10 border-white/30 text-white"
                  : "bg-primary border-primary text-primary-foreground"
              )}
            >
              {followLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isFollowing ? (
                <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Following</span>
              ) : (
                "Follow"
              )}
            </button>
          )}
        </div>
        {post.caption && (
          <p className="text-white text-sm line-clamp-2 drop-shadow leading-snug mb-2">
            {post.caption}
          </p>
        )}

        {/* Music ticker */}
        <MusicTicker
          name={post.audio_name || `Original Sound - ${post.source === "user" ? post.author_name || "ZIVO" : post.store_name || "ZIVO"}`}
          onClick={() => {
            const soundLabel = post.audio_name || `Original Sound - ${post.source === "user" ? post.author_name || "ZIVO" : post.store_name || "ZIVO"}`;
            onOpenSound(soundLabel);
          }}
        />
      </div>

      {/* Right-side action buttons (TikTok-style) */}
      <div
        className="absolute right-3 z-30 flex flex-col items-center gap-5"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)" }}
      >
        {/* Mute/Unmute with sound wave */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }}
          className="flex flex-col items-center gap-1"
          aria-label={globalMuted ? "Unmute" : "Mute"}
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center relative overflow-hidden border border-white/10">
            {globalMuted ? (
              <VolumeX className="w-5 h-5 text-white/70" />
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-white z-10" />
                {/* Animated sound bars */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[2px]">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-[2px] bg-primary rounded-full"
                      style={{
                        animation: `soundbar 0.${4 + i}s ease-in-out infinite alternate`,
                        height: `${4 + i * 2}px`,
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </button>

        {/* Like */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleLike(post.id, liked); }}
          className="flex flex-col items-center gap-1"
          aria-label="Like"
        >
          <Heart
            className={cn(
              "w-9 h-9 drop-shadow-lg transition-transform active:scale-125",
              liked ? "text-destructive fill-destructive" : "text-white",
            )}
          />
          <span className="text-white text-xs font-semibold drop-shadow">
            {post.likes_count || 0}
          </span>
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenComments(post.id); }}
          className="flex flex-col items-center gap-1"
          aria-label="Comment"
        >
          <MessageCircle className="w-9 h-9 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            {post.comments_count || 0}
          </span>
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <Eye className="w-9 h-9 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            {post.view_count || 0}
          </span>
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenShare(post.id); }}
          className="flex flex-col items-center gap-1"
          aria-label="Share"
        >
          <Share2 className="w-9 h-9 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">Share</span>
        </button>
      </div>
    </div>
  );
}

// ── Comment Sheet ────────────────────────────────────────────────────────────

function CommentSheet({
  postId,
  userId,
  onClose,
}: {
  postId: string;
  userId: string | null;
  onClose: () => void;
}) {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if user has a verified account (phone_verified)
  const { data: isVerified } = useQuery({
    queryKey: ["user-verified", userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase
        .from("profiles")
        .select("phone_verified")
        .eq("user_id", userId)
        .single();
      return data?.phone_verified ?? false;
    },
    enabled: !!userId,
  });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      const { data: rawComments, error } = await supabase
        .from("store_post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (!rawComments || rawComments.length === 0) return [];

      // Fetch profiles from public_profiles view (no RLS restriction)
      const userIds = [...new Set(rawComments.map((c: any) => c.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      return rawComments.map((c: any) => ({
        ...c,
        profiles: profileMap.get(c.user_id) || null,
      }));
    },
  });

  const handleSubmit = async () => {
    if (!commentText.trim() || !userId) {
      if (!userId) toast.error("Please sign in to comment");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("store_post_comments").insert({
      post_id: postId,
      user_id: userId,
      content: commentText.trim(),
    });
    if (error) {
      toast.error("Failed to post comment");
    } else {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["customer-feed"] });
    }
    setSubmitting(false);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Sheet */}
      <div
        className="relative bg-background rounded-t-2xl max-h-[65vh] flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-foreground">Comments ({comments.length})</span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted"
          >
            <XIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((c: any) => {
              const prof = c.profiles;
              const name = prof?.full_name || "User";
              const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
              <div key={c.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                  {prof?.avatar_url ? (
                    <img src={prof.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{initials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground mb-0.5">{name}</p>
                  <p className="text-sm text-foreground">{c.content}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
          {!userId ? (
            <p className="text-center text-sm text-muted-foreground py-1">Sign in to comment</p>
          ) : !isVerified ? (
            <div className="flex items-center gap-2 justify-center py-1">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Only verified accounts can comment</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Add a comment..."
                className="flex-1 h-10 rounded-full bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!commentText.trim() || submitting}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



// ── Feed Search Overlay ──────────────────────────────────────────────────────

function FeedSearchOverlay({ onClose, onNavigate }: { onClose: () => void; onNavigate: (path: string) => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Search stores
  const { data: storeResults = [], isLoading: storesLoading } = useQuery({
    queryKey: ["feed-search-stores", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const { data } = await supabase
        .from("store_profiles")
        .select("id, name, logo_url, slug, category")
        .ilike("name", `%${debouncedQuery}%`)
        .limit(10);
      return data || [];
    },
    enabled: debouncedQuery.length >= 1,
  });

  // Search people — split words so "chhorng kim" matches "kimlain Chhorng"
  const { data: profileResults = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["feed-search-profiles", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const words = debouncedQuery.split(/\s+/).filter(Boolean);
      let q = supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url");
      for (const word of words) {
        q = q.ilike("full_name", `%${word}%`);
      }
      const { data } = await q.limit(10);
      return data || [];
    },
    enabled: debouncedQuery.length >= 1,
  });

  const isLoading = storesLoading || profilesLoading;
  const hasResults = storeResults.length > 0 || profileResults.length > 0;
  const hasQuery = debouncedQuery.length >= 1;

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col">
      {/* Search header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-muted/50">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shops, people..."
            className="w-full h-10 pl-9 pr-9 rounded-full bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <XIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!hasQuery && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
            <Search className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Search for shops, restaurants, or people</p>
          </div>
        )}

        {hasQuery && isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {hasQuery && !isLoading && !hasResults && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Search className="w-10 h-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No results for "{debouncedQuery}"</p>
          </div>
        )}

        {storeResults.length > 0 && (
          <div className="px-4 pt-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Shops</p>
            {storeResults.map((store: any) => (
              <button
                key={store.id}
                type="button"
                onClick={() => { onNavigate(`/grocery/shop/${store.slug}`); onClose(); }}
                className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-muted/30 border border-border/30 flex items-center justify-center overflow-hidden shrink-0">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold truncate">{store.name}</p>
                  {store.category && <p className="text-[11px] text-muted-foreground">{store.category}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {profileResults.length > 0 && (
          <div className="px-4 pt-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">People</p>
            {profileResults.map((person: any) => (
              <button
                key={person.id}
                type="button"
                onClick={() => { onNavigate(`/profile`); onClose(); }}
                className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-muted/30 border border-border/30 flex items-center justify-center overflow-hidden shrink-0">
                  {person.avatar_url ? (
                    <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold truncate">{person.full_name || "User"}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sound Overlay (bottom sheet over reels) ─────────────────── */
function SoundOverlay({
  soundName,
  onClose,
  onNavigateToReel,
  onUseSound,
  currentPosts,
}: {
  soundName: string;
  onClose: () => void;
  onNavigateToReel: (postId: string) => void;
  onUseSound: () => void;
  currentPosts: FeedPost[];
}) {
  // Check if this is a generated "Original Sound" name (not stored in DB)
  const isOriginalSound = soundName.startsWith("Original Sound - ");

  const { data: dbReels = [], isLoading } = useQuery({
    queryKey: ["sound-overlay-reels", soundName],
    queryFn: async () => {
      if (isOriginalSound) return []; // These aren't stored — we use currentPosts instead
      const db = supabase as any;
      const { data: storePosts } = await db
        .from("store_posts")
        .select("id, media_urls, media_type, view_count, store_profiles(store_name)")
        .eq("is_published", true)
        .eq("audio_name", soundName)
        .order("created_at", { ascending: false })
        .limit(30);

      const { data: userPosts } = await db
        .from("user_posts")
        .select("id, media_urls, media_type, profiles(display_name)")
        .eq("audio_name", soundName)
        .order("created_at", { ascending: false })
        .limit(30);

      return [
        ...(storePosts || []).map((p: any) => ({
          id: p.id, media_urls: p.media_urls || [], media_type: p.media_type,
          views: p.view_count || 0, author: p.store_profiles?.store_name || "Shop",
        })),
        ...(userPosts || []).map((p: any) => ({
          id: p.id, media_urls: p.media_urls || [], media_type: p.media_type,
          views: 0, author: p.profiles?.display_name || "User",
        })),
      ];
    },
    enabled: !isOriginalSound,
  });

  // For "Original Sound" names, pull matching reels from the already-loaded feed
  const reels = isOriginalSound
    ? currentPosts
        .filter((p) => {
          const label = p.audio_name || `Original Sound - ${p.store_name || "ZIVO"}`;
          return label === soundName;
        })
        .map((p) => ({
          id: p.id, media_urls: p.media_urls, media_type: p.media_type,
          views: p.view_count || 0, author: p.store_name || "User",
        }))
    : dbReels;

  const reelCount = reels.length;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      />
      {/* Centered modal — responsive */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-[61] flex items-center justify-center pointer-events-none p-4"
      >
        <div className="pointer-events-auto flex flex-col bg-background rounded-3xl overflow-hidden shadow-2xl border border-border/30 w-[94%] max-w-[480px] max-h-[75vh]">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Sound info header */}
          <div className="px-5 pt-2 pb-3 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-primary">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </motion.div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground leading-tight line-clamp-2">{soundName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {reelCount} reel{reelCount !== 1 ? "s" : ""} • Tap to watch
              </p>
            </div>
            <button onClick={onClose} className="p-2 -mr-1 rounded-full hover:bg-muted/60 transition-colors">
              <XIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Use this sound button */}
          <div className="px-5 pb-3">
            <button
              onClick={() => {
                onClose();
                onUseSound();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Music className="h-4 w-4" />
              Use this sound
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/40 mx-5" />

          {/* Reels grid */}
          <div className="flex-1 overflow-y-auto p-3 pb-safe">
            {isLoading && !isOriginalSound ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : reelCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
                  <Play className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No reels with this sound yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {reels.map((reel) => {
                  const thumb = (reel.media_urls || []).map((u: string) => normalizeStorePostMediaUrl(u)).filter(Boolean)[0];
                  return (
                    <button
                      key={reel.id}
                      onClick={() => onNavigateToReel(reel.id)}
                      className="relative aspect-[9/16] bg-muted/80 overflow-hidden group rounded-xl"
                    >
                      {thumb ? (
                        <>
                          <img
                            src={thumb}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Play className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                      {/* Gradient overlay at bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
                      {reel.views > 0 && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[11px] font-semibold drop-shadow-lg">
                          <Play className="h-3 w-3 fill-white" />
                          {reel.views > 1000 ? `${(reel.views / 1000).toFixed(1)}K` : reel.views}
                        </div>
                      )}
                      {reel.author && (
                        <div className="absolute bottom-2 right-2 text-white text-[9px] font-medium drop-shadow-lg truncate max-w-[60%] text-right">
                          @{reel.author}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Discover People Overlay ─────────────────────────────────────────────────
function DiscoverPeopleOverlay({ onClose, onNavigate }: { onClose: () => void; onNavigate: (path: string) => void }) {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["discover-people-reel", userId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, avatar_url, bio, is_verified")
        .neq("id", userId || "")
        .limit(20);
      return (data || []).sort(() => Math.random() - 0.5);
    },
    enabled: !!userId,
  });

  const handleFollow = async (profileId: string) => {
    if (!userId) return;
    try {
      await (supabase as any).from("user_followers").insert({
        follower_id: userId,
        following_id: profileId,
      });
      setFollowingIds((prev) => new Set([...prev, profileId]));
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-background flex flex-col"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30" style={{ paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.75rem), 0.75rem)' }}>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Discover People</h2>
          <p className="text-xs text-muted-foreground">Find people to follow on ZIVO</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((profile: any) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border/30 p-4 text-center"
              >
                <div onClick={() => { onClose(); onNavigate(`/user/${profile.id}`); }} className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-muted ring-2 ring-primary/10">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl bg-primary/10">
                        {profile.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || "User"}</p>
                  {profile.bio && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">{profile.bio}</p>
                  )}
                </div>
                <button
                  onClick={() => handleFollow(profile.id)}
                  disabled={followingIds.has(profile.id)}
                  className={`w-full mt-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    followingIds.has(profile.id)
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {followingIds.has(profile.id) ? "Following" : "Follow"}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}


export default function FeedPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [globalMuted, setGlobalMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [soundOverlayName, setSoundOverlayName] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [createWithAudio, setCreateWithAudio] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string | null } | null>(null);
  const [userLikedPostIds, setUserLikedPostIds] = useState<Set<string>>(new Set());

  // Get current user + profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || null;
      setUserId(uid);
      if (uid) {
        supabase.from("profiles").select("full_name, avatar_url").eq("id", uid).maybeSingle()
          .then(({ data: p }) => {
            if (p) setUserProfile({
              name: (p as any).full_name || "You",
              avatar: (p as any).avatar_url || null,
            });
          });
      }
    });
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["customer-feed"],
    queryFn: async () => {
      // Fetch store posts and user video posts in parallel
      const [{ data: postsData, error }, { data: userVideos }] = await Promise.all([
        supabase
          .from("store_posts")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(50),
        (supabase as any)
          .from("user_posts")
          .select("id, user_id, media_url, media_urls, media_type, caption, likes_count, comments_count, views_count, created_at, audio_name")
          .eq("is_published", true)
          .in("media_type", ["video", "reel"])
          .order("created_at", { ascending: false })
          .limit(30),
      ]);
      if (error) throw error;

      const storeIds = [...new Set((postsData || []).map((p: any) => p.store_id))];
      const userIds = [...new Set((userVideos || []).map((p: any) => p.user_id))];

      const [{ data: stores }, { data: profiles }] = await Promise.all([
        storeIds.length
          ? supabase.from("store_profiles").select("id, name, logo_url, slug").in("id", storeIds)
          : Promise.resolve({ data: [] as any[] }),
        userIds.length
          ? supabase.from("profiles").select("id, user_id, full_name, avatar_url").in("id", userIds as string[])
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const storeMap = new Map((stores || []).map((s: any) => [s.id, s]));
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      // Also map by user_id
      (profiles || []).forEach((p: any) => { if (p.user_id) profileMap.set(p.user_id, p); });

      const allPosts: FeedPost[] = [];

      // Store posts
      for (const post of postsData || []) {
        const store = storeMap.get(post.store_id);
        allPosts.push({
          ...post,
          source: "store",
          store_name: store?.name || "Store",
          store_logo: store?.logo_url,
          store_slug: store?.slug,
        });
      }

      // User video posts
      for (const post of userVideos || []) {
        const profile = profileMap.get(post.user_id);
        const urls: string[] = Array.isArray(post.media_urls) && post.media_urls.length > 0
          ? post.media_urls
          : post.media_url ? [post.media_url] : [];
        if (!urls.length) continue;
        allPosts.push({
          id: `u-${post.id}`,
          store_id: "",
          caption: post.caption,
          media_urls: urls,
          media_type: "video",
          is_published: true,
          created_at: post.created_at,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          view_count: post.views_count || 0,
          audio_name: post.audio_name || null,
          source: "user",
          author_id: post.user_id,
          author_name: profile?.full_name || "User",
          author_avatar: profile?.avatar_url || null,
        });
      }

      // Facebook-style algorithmic feed: blend engagement + recency + randomness
      const now = Date.now();
      const ONE_HOUR = 3_600_000;
      const seededRandom = (id: string) => {
        let h = 0;
        for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
        return ((h >>> 0) % 1000) / 1000;
      };
      const dayKey = Math.floor(now / 86_400_000);

      allPosts.forEach((item: any) => {
        const ageHours = (now - new Date(item.created_at).getTime()) / ONE_HOUR;
        const recencyScore = 1 / (1 + ageHours / 6);
        const totalEngagement = (item.likes_count || 0) + (item.comments_count || 0) * 2 + (item.view_count || 0) * 0.1;
        const engagementScore = Math.log2(1 + totalEngagement) / 10;
        const randomFactor = seededRandom(item.id + dayKey) * 0.15;
        item._feedScore = recencyScore * 0.45 + engagementScore * 0.3 + randomFactor;
      });

      allPosts.sort((a: any, b: any) => (b._feedScore || 0) - (a._feedScore || 0));
      return allPosts;
    },
  });

  // Fetch user's liked post IDs
  useEffect(() => {
    if (!userId || posts.length === 0) return;
    const postIds = posts.map((p) => p.id);
    supabase
      .from("store_post_likes")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", postIds)
      .then(({ data }) => {
        setUserLikedPostIds(new Set((data || []).map((d: any) => d.post_id)));
      });
  }, [userId, posts]);

  const handleToggleLike = useCallback(async (postId: string, currentlyLiked: boolean) => {
    if (!userId) {
      toast.error("Please sign in to like posts");
      return;
    }
    setUserLikedPostIds((prev) => {
      const next = new Set(prev);
      if (currentlyLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    if (currentlyLiked) {
      await supabase.from("store_post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    } else {
      await supabase.from("store_post_likes").insert({ post_id: postId, user_id: userId });
      // Push notification to post author
      const post = posts.find(p => p.id === postId);
      const authorId = post?.author_id;
      if (authorId && authorId !== userId) {
        try {
          const { data: sp } = await supabase.from("profiles").select("full_name").eq("user_id", userId).single();
          await supabase.functions.invoke("send-push-notification", {
            body: { user_id: authorId, notification_type: "post_liked", title: "New Like ❤️", body: `${sp?.full_name || "Someone"} liked your post`, data: { type: "post_liked", post_id: postId, liker_id: userId, action_url: `/feed?post=${postId}` } },
          });
        } catch {}
      }
    }
    queryClient.invalidateQueries({ queryKey: ["customer-feed"] });
  }, [userId, queryClient, posts]);

  // IntersectionObserver
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

  useEffect(() => {
    const sharedPostId = new URLSearchParams(location.search).get("post");
    if (!sharedPostId || posts.length === 0) return;

    const targetIndex = posts.findIndex((post) => post.id === sharedPostId);
    if (targetIndex < 0) return;

    setActiveIndex(targetIndex);
    requestAnimationFrame(() => {
      cardRefs.current[targetIndex]?.scrollIntoView({ block: "start" });
    });
  }, [posts, location.search]);

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
    <div className="fixed inset-0 bg-black lg:flex lg:flex-col">
      {/* Desktop NavBar */}
      <div className="hidden lg:block relative z-[1200] shrink-0">
        <NavBar />
      </div>
      {/* Discover + Search + Live buttons - hide on desktop */}
      <div className="absolute top-3 right-4 z-50 flex gap-2 lg:hidden" style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <button
          type="button"
          onClick={() => navigate("/live")}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <Radio className="w-5 h-5 text-red-400" />
        </button>
        <button
          type="button"
          onClick={() => setShowDiscover(true)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <UserPlus className="w-5 h-5 text-white" />
        </button>
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search overlay */}
      {showSearch && (
        <FeedSearchOverlay onClose={() => setShowSearch(false)} onNavigate={navigate} />
      )}

      {/* Discover People overlay */}
      <AnimatePresence>
        {showDiscover && (
          <DiscoverPeopleOverlay onClose={() => setShowDiscover(false)} onNavigate={navigate} />
        )}
      </AnimatePresence>

      {/* Snap-scroll reel container */}
      <div
        className="relative w-full h-full md:flex md:items-center md:justify-center md:gap-4 lg:flex-1 lg:min-h-0 lg:h-0"
      >
        {/* Phone-frame on tablet, full-width on desktop */}
        <div className="w-full h-full md:mx-auto md:rounded-2xl md:overflow-hidden md:shadow-2xl md:border md:border-white/10 md:h-[calc(100%-2rem)] md:w-auto md:aspect-[9/16] md:max-w-[420px] lg:max-w-[460px] xl:max-w-[500px]">
          <div
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={(el) => { cardRefs.current[index] = el; }}
                className="w-full h-full snap-start"
              >
                <ReelCard
                  post={post}
                  isActive={activeIndex === index}
                  globalMuted={globalMuted}
                  onToggleMute={() => setGlobalMuted((m) => !m)}
                  onNavigate={(slug) => slug.startsWith("__user__") ? navigate(`/user/${slug.replace("__user__", "")}`) : navigate(`/grocery/shop/${slug}`)}
                  userId={userId}
                  userLikedPostIds={userLikedPostIds}
                  onToggleLike={handleToggleLike}
                  onOpenComments={(id) => setCommentPostId(id)}
                  onOpenShare={(id) => setSharePostId(id)}
                  onOpenSound={(name) => setSoundOverlayName(name)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop up/down navigation buttons */}
        <div className="hidden md:flex flex-col gap-3 absolute right-8 top-1/2 -translate-y-1/2 z-50">
          <button
            onClick={() => {
              if (activeIndex > 0) {
                cardRefs.current[activeIndex - 1]?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            disabled={activeIndex === 0}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous reel"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              if (activeIndex < posts.length - 1) {
                cardRefs.current[activeIndex + 1]?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            disabled={activeIndex >= posts.length - 1}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next reel"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Comment sheet */}
      {commentPostId && (
        <CommentSheet
          postId={commentPostId}
          userId={userId}
          onClose={() => setCommentPostId(null)}
        />
      )}

      {/* Share sheet */}
      {sharePostId && (
        <UnifiedShareSheet
          shareUrl={getPostShareUrl(sharePostId)}
          shareText={posts.find((p) => p.id === sharePostId)?.caption || "Check out this post!"}
          onClose={() => setSharePostId(null)}
        />
      )}

      {/* Sound overlay */}
      <AnimatePresence>
        {soundOverlayName && (
          <SoundOverlay
            soundName={soundOverlayName}
            onClose={() => setSoundOverlayName(null)}
            onNavigateToReel={(postId) => {
              setSoundOverlayName(null);
              navigate(`/reels/${postId}`);
            }}
            onUseSound={() => {
              const name = soundOverlayName;
              setSoundOverlayName(null);
              setCreateWithAudio(name);
            }}
            currentPosts={posts}
          />
        )}
      </AnimatePresence>

      {/* Create post modal with pre-filled audio */}
      <AnimatePresence>
        {createWithAudio && userId && (
          <CreatePostModal
            userId={userId}
            userProfile={userProfile}
            onClose={() => setCreateWithAudio(null)}
            onCreated={() => {
              setCreateWithAudio(null);
              toast.success("Reel posted with sound!");
            }}
            initialAudioName={createWithAudio}
          />
        )}
      </AnimatePresence>

      {/* Bottom navigation overlaid on top */}
      <ZivoMobileNav />
    </div>
  );
}
