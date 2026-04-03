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
import {
  Loader2, Heart, MessageCircle, Share2, Store,
  Play, Volume2, VolumeX, RefreshCw, Send, X as XIcon, Eye,
  Copy, Link2, ShieldCheck, Search, ArrowLeft, UserCircle,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  view_count?: number;
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
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden snap-start flex-shrink-0">
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
          onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }}
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

// ── Share Sheet ──────────────────────────────────────────────────────────────

function ShareSheet({
  postId,
  caption,
  onClose,
}: {
  postId: string;
  caption: string;
  onClose: () => void;
}) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const shareUrl = `${window.location.origin}/feed?post=${postId}`;
  const shareText = encodeURIComponent(caption || "Check out this post!");
  const shareEncodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    { label: "WhatsApp", color: "#25D366", svg: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488 11.821 11.821 0 0012.05 0zm0 21.785a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 012.15 11.892C2.15 6.443 6.602 1.992 12.053 1.992a9.84 9.84 0 016.988 2.899 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.9-9.884 9.9z", url: `https://wa.me/?text=${shareText}%20${shareEncodedUrl}` },
    { label: "Telegram", color: "#0088CC", svg: "M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm5.091 8.104l-1.681 7.927c-.128.564-.46.701-.931.437l-2.57-1.894-1.24 1.193c-.137.137-.253.253-.519.253l.185-2.618 4.763-4.303c.207-.184-.045-.286-.321-.102l-5.889 3.71-2.537-.793c-.552-.172-.563-.552.115-.817l9.915-3.822c.459-.166.861.112.71.827z", url: `https://t.me/share/url?url=${shareEncodedUrl}&text=${shareText}` },
    { label: "Facebook", color: "#1877F2", svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", url: `https://www.facebook.com/sharer/sharer.php?u=${shareEncodedUrl}` },
    { label: "X", color: "#000000", svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", url: `https://x.com/intent/tweet?text=${shareText}&url=${shareEncodedUrl}` },
    { label: "Email", color: "#EA4335", svg: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z", url: `mailto:?subject=${shareText}&body=${shareEncodedUrl}` },
    { label: "SMS", color: "#34B7F1", svg: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z", url: `sms:?body=${shareText}%20${shareEncodedUrl}` },
  ];

  const moreShareOptions: Array<{ label: string; color: string; svg: string; url: string; copyMessage?: string }> = [
    { label: "TikTok", color: "#000000", svg: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", url: "__copy__", copyMessage: "Link copied! Paste it in TikTok" },
    { label: "Instagram", color: "#E4405F", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", url: "__copy__", copyMessage: "Link copied! Paste it in Instagram" },
    { label: "Snapchat", color: "#FFFC00", svg: "M12 0c-1.62 0-3.066.612-4.152 1.612C6.726 2.726 6.12 4.26 6.12 5.88c0 .66.108 1.32.264 1.956-.132.024-.276.036-.42.036-.384 0-.756-.108-1.08-.3a.636.636 0 00-.336-.096c-.264 0-.492.168-.564.42-.06.204-.012.408.12.564.516.588 1.2.96 1.944 1.14-.06.36-.18.708-.36 1.02-.36.636-.924 1.128-1.608 1.404a.648.648 0 00-.384.588c0 .24.132.456.336.576.66.384 1.38.576 2.1.612.072.324.156.66.264.984.06.18.252.3.444.3h.06c.468-.072 1.008-.156 1.536-.156.396 0 .78.048 1.14.192.516.204 1.044.54 1.74.54h.048c.696 0 1.224-.336 1.74-.54.36-.144.744-.192 1.14-.192.528 0 1.068.084 1.536.156h.06c.192 0 .384-.12.444-.3.108-.324.192-.66.264-.984.72-.036 1.44-.228 2.1-.612a.648.648 0 00.336-.576.648.648 0 00-.384-.588c-.684-.276-1.248-.768-1.608-1.404a3.588 3.588 0 01-.36-1.02c.744-.18 1.428-.552 1.944-1.14a.636.636 0 00.12-.564.588.588 0 00-.564-.42.636.636 0 00-.336.096c-.324.192-.696.3-1.08.3-.144 0-.288-.012-.42-.036.156-.636.264-1.296.264-1.956 0-1.62-.612-3.156-1.728-4.272C15.066.612 13.62 0 12 0z", url: `https://www.snapchat.com/scan?attachmentUrl=${shareEncodedUrl}` },
    { label: "LinkedIn", color: "#0A66C2", svg: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareEncodedUrl}` },
    { label: "Pinterest", color: "#E60023", svg: "M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z", url: `https://pinterest.com/pin/create/button/?url=${shareEncodedUrl}&description=${shareText}` },
    { label: "Reddit", color: "#FF4500", svg: "M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.462.342.342 0 00-.462 0c-.545.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.205-.095z", url: `https://reddit.com/submit?url=${shareEncodedUrl}&title=${shareText}` },
  ];

  const handleCopyLink = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.cssText = "position:fixed;opacity:0;left:-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Link copied!");
    } catch {
      toast.info("Long-press URL bar to copy");
    }
    onClose();
  };

  const handleOptionClick = (opt: { url: string; copyMessage?: string }) => {
    if (opt.url === "__copy__") {
      handleCopyLink();
      toast.success(opt.copyMessage || "Link copied!");
    } else {
      onClose();
      import("@/lib/openExternalUrl").then(({ openExternalUrl }) => openExternalUrl(opt.url));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-md bg-background rounded-t-2xl pb-6 pt-3 px-0 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-2" />

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h3 className="text-sm font-bold text-foreground">Share to</h3>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <XIcon className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 px-6 py-5">
          {shareOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleOptionClick(opt)}
              className="flex flex-col items-center gap-2 min-h-[48px]"
            >
              <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${opt.color}15` }}>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill={opt.color}><path d={opt.svg} /></svg>
              </div>
              <span className="text-[10px] font-medium text-foreground">{opt.label}</span>
            </button>
          ))}
          <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 min-h-[48px]">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
            </div>
            <span className="text-[10px] font-medium text-foreground">Copy link</span>
          </button>
          <button onClick={() => setShowMoreOptions(!showMoreOptions)} className="flex flex-col items-center gap-2 min-h-[48px]">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-medium text-foreground">{showMoreOptions ? "Less" : "More"}</span>
          </button>
        </div>

        <AnimatePresence>
          {showMoreOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-4 px-6 py-4 border-t border-border/20">
                {moreShareOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleOptionClick(opt)}
                    className="flex flex-col items-center gap-2 min-h-[48px]"
                  >
                    <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${opt.color}15` }}>
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={opt.color}><path d={opt.svg} /></svg>
                    </div>
                    <span className="text-[10px] font-medium text-foreground">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
export default function FeedPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [globalMuted, setGlobalMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userLikedPostIds, setUserLikedPostIds] = useState<Set<string>>(new Set());

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

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
    }
    queryClient.invalidateQueries({ queryKey: ["customer-feed"] });
  }, [userId, queryClient]);

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
      {/* Search button */}
      <button
        type="button"
        onClick={() => setShowSearch(true)}
        className="absolute top-3 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <Search className="w-5 h-5 text-white" />
      </button>

      {/* Search overlay */}
      {showSearch && (
        <FeedSearchOverlay onClose={() => setShowSearch(false)} onNavigate={navigate} />
      )}

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
              userId={userId}
              userLikedPostIds={userLikedPostIds}
              onToggleLike={handleToggleLike}
              onOpenComments={(id) => setCommentPostId(id)}
              onOpenShare={(id) => setSharePostId(id)}
            />
          </div>
        ))}
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
          shareUrl={`${window.location.origin}/feed?post=${sharePostId}`}
          shareText={posts.find((p) => p.id === sharePostId)?.caption || "Check out this post!"}
          onClose={() => setSharePostId(null)}
        />
      )}

      {/* Bottom navigation overlaid on top */}
      <ZivoMobileNav />
    </div>
  );
}
