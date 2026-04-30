/**
 * FeedPage — TikTok / Facebook Reels style full-screen vertical feed
 * Each post fills the entire viewport. Swipe up/down to navigate.
 * Videos auto-play when scrolled into view, pause when scrolled away.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
const UnifiedShareSheet = lazy(() => import("@/components/shared/ShareSheet"));
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeStorePostMediaUrl } from "@/utils/normalizeStorePostMediaUrl";
import { useI18n } from "@/hooks/useI18n";
const ZivoMobileNav = lazy(() => import("@/components/app/ZivoMobileNav"));
const NavBar = lazy(() => import("@/components/home/NavBar"));
import SEOHead from "@/components/SEOHead";
import VerifiedBadge from "@/components/VerifiedBadge";
import { isBlueVerified } from "@/lib/verification";
const CreatePostModal = lazy(() => import("@/components/social/CreatePostModal"));
const FeedSidebar = lazy(() => import("@/components/social/FeedSidebar"));
const SafeCaption = lazy(() => import("@/components/social/SafeCaption"));
const SuggestedUsersCarousel = lazy(() => import("@/components/social/SuggestedUsersCarousel"));
const FeedSkeleton = lazy(() => import("@/components/social/FeedSkeleton"));
const NewPostsPill = lazy(() => import("@/components/social/NewPostsPill"));
const PostActionsMenu = lazy(() => import("@/components/social/PostActionsMenu"));
const TrendingHashtags = lazy(() => import("@/components/social/TrendingHashtags"));
const ReactionPicker = lazy(() => import("@/components/social/ReactionPicker"));
const CommentPreview = lazy(() => import("@/components/social/CommentPreview"));
const ReactionSummary = lazy(() => import("@/components/social/ReactionSummary"));
const ReelsPreviewRow = lazy(() => import("@/components/social/ReelsPreviewRow"));
const RepostDialog = lazy(() => import("@/components/social/RepostDialog"));
const PostInsights = lazy(() => import("@/components/social/PostInsights"));
const MentionPicker = lazy(() => import("@/components/social/MentionPicker"));
import { detectMention, applyMention } from "@/components/social/MentionPicker";
import { postHasHashtag } from "@/components/social/TrendingHashtags";
import { usePostActions, type PostActionTarget } from "@/hooks/usePostActions";
import { usePostReactions } from "@/hooks/usePostReactions";
import { usePostReposts } from "@/hooks/usePostReposts";
import { usePostViewTracking } from "@/hooks/usePostViewTracking";
import type { ReactionEmoji } from "@/components/social/ReactionPicker";
import { topicForUserSync } from "@/lib/security/channelName";
import { confirmContentSafe } from "@/lib/security/contentLinkValidation";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Heart from "lucide-react/dist/esm/icons/heart";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Repeat2 from "lucide-react/dist/esm/icons/repeat-2";
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
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import Flag from "lucide-react/dist/esm/icons/flag";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Music from "lucide-react/dist/esm/icons/music";
import Gauge from "lucide-react/dist/esm/icons/gauge";
import PictureInPicture from "lucide-react/dist/esm/icons/picture-in-picture-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import Radio from "lucide-react/dist/esm/icons/radio";
import Plane from "lucide-react/dist/esm/icons/plane";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import UtensilsCrossed from "lucide-react/dist/esm/icons/utensils-crossed";
import Car from "lucide-react/dist/esm/icons/car";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getPostShareUrl } from "@/lib/getPublicOrigin";
import { shouldSendLikeNotification } from "@/lib/social/likeNotificationGuard";
import { formatDistanceToNow } from "date-fns";
import { useOwnerStoreProfile } from "@/hooks/useOwnerStoreProfile";
import { useLodgeRooms } from "@/hooks/lodging/useLodgeRooms";
import { useLodgePropertyProfile } from "@/hooks/lodging/useLodgePropertyProfile";
import { getLodgingCompletion } from "@/lib/lodging/lodgingCompletion";
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
  shares_count?: number;
  reposts_count?: number;
  view_count?: number;
  audio_name?: string | null;
  source?: "store" | "user";
  author_id?: string;
  author_name?: string;
  author_avatar?: string | null;
  author_is_verified?: boolean;
  store_is_verified?: boolean;
  location?: string | null;
}

/* ── Scrolling music ticker ───────────────────────────────────── */
/**
 * IntersectionObserver-based sentinel rendered at the end of the feed.
 * When it scrolls into view, fires `onReachEnd` (debounced via isFetching).
 * Renders a small "Loading more…" indicator while the next page is in flight.
 */
function InfiniteScrollSentinel({
  isFetching,
  onReachEnd,
}: {
  isFetching: boolean;
  onReachEnd: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastFiredAt = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetching) {
          // Throttle to once per second
          const now = Date.now();
          if (now - lastFiredAt.current < 1000) return;
          lastFiredAt.current = now;
          onReachEnd();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isFetching, onReachEnd]);

  return (
    <div ref={ref} className="w-full h-full snap-start flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-3 text-white/60">
        {isFetching ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin" />
            <span className="text-sm">Loading more…</span>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronDown className="h-6 w-6" />
            </div>
            <span className="text-sm">You've reached the end — pull down to refresh</span>
          </>
        )}
      </div>
    </div>
  );
}

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
  onOpenActions,
  currentReaction,
  onSetReaction,
  onOpenRepost,
  isReposted,
  shouldPreload = false,
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
  onOpenActions?: () => void;
  currentReaction?: ReactionEmoji | null;
  onSetReaction?: (emoji: ReactionEmoji) => void;
  onOpenRepost?: () => void;
  isReposted?: boolean;
  /** True when this reel is the next one in the snap-scroller, so its
   *  video can begin loading before the user actually swipes. */
  shouldPreload?: boolean;
}) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isBlobLoading, setIsBlobLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  // Long-press → open reaction picker instead of plain like
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track view: counts after the post stays active in the viewport for 1.5s
  const rawPostId = post.id.startsWith("u-") ? post.id.slice(2) : post.id;
  usePostViewTracking(rawPostId, post.source ?? "store", isActive);
  const [videoProgress, setVideoProgress] = useState(0); // 0..1
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [showLikeBurst, setShowLikeBurst] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [authorIsLive, setAuthorIsLive] = useState(false);
  const [isHoldingFastForward, setIsHoldingFastForward] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const fastForwardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextClickRef = useRef(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const wasPlayingBeforeScrub = useRef(false);
  const lastTapRef = useRef(0);
  const savingBookmarkRef = useRef(false);

  const formatVideoTime = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
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

  // Auto-pause when the tab/window becomes hidden (Page Visibility API).
  // Without this, videos keep playing in background tabs and burn battery.
  // Only the active reel is touched — inactive ones are already paused.
  useEffect(() => {
    if (!isActive || !isVideoPost) return;
    const handleVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        if (!video.paused) {
          video.pause();
          setIsPlaying(false);
        }
      } else {
        // Tab back in focus — resume only if user hasn't manually paused.
        if (video.paused && !isScrubbing) {
          void video.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isActive, isVideoPost, isScrubbing]);

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

  // Track view when post becomes active (once per post per session).
  // User reels are stored in user_posts and need a separate RPC because
  // the column is named views_count (vs. store_posts.view_count).
  useEffect(() => {
    if (!isActive || viewTracked.current) return;
    viewTracked.current = true;
    if (post.source === "user") {
      const rawId = post.id.startsWith("u-") ? post.id.slice(2) : post.id;
      supabase.rpc("increment_user_post_view_count" as any, { p_post_id: rawId }).then(() => {});
    } else {
      supabase.rpc("increment_store_post_view_count" as any, { p_post_id: post.id }).then(() => {});
    }
  }, [isActive, post.id, post.source]);

  // Cleanup: if the user unmounts mid-hold, kill the timer + reset speed.
  useEffect(() => {
    return () => {
      if (fastForwardTimerRef.current) clearTimeout(fastForwardTimerRef.current);
      const v = videoRef.current;
      if (v) { try { v.playbackRate = 1.0; } catch {} }
    };
  }, []);

  // Apply the user's chosen playback speed whenever it changes (and not
  // currently in a long-press fast-forward, which temporarily overrides).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isHoldingFastForward) return;
    try { v.playbackRate = playbackSpeed; } catch {}
  }, [playbackSpeed, isHoldingFastForward, currentSrc]);

  // Live ring: check if the author has an active live stream when this reel
  // becomes active. Only fires for active reels to avoid spamming the DB
  // with N queries per feed page.
  useEffect(() => {
    if (!isActive || !post.author_id) { setAuthorIsLive(false); return; }
    let alive = true;
    (supabase as any)
      .from("live_streams")
      .select("id", { count: "exact", head: true })
      .eq("user_id", post.author_id)
      .eq("status", "live")
      .then(({ count }: any) => {
        if (alive) setAuthorIsLive((count || 0) > 0);
      });
    return () => { alive = false; };
  }, [isActive, post.author_id]);

  // Realtime engagement bumps for the active reel. When other viewers like
  // or comment on the post you're watching, the right-column counters
  // animate up without requiring a refetch. Only subscribes for the active
  // reel so we don't open one channel per off-screen card.
  const [liveLikesCount, setLiveLikesCount] = useState(post.likes_count || 0);
  const [liveCommentsCount, setLiveCommentsCount] = useState(post.comments_count || 0);
  useEffect(() => {
    setLiveLikesCount(post.likes_count || 0);
    setLiveCommentsCount(post.comments_count || 0);
  }, [post.id, post.likes_count, post.comments_count]);
  useEffect(() => {
    if (!isActive) return;
    const isUser = post.source === "user";
    const rawId = post.id.startsWith("u-") ? post.id.slice(2) : post.id;
    const likesTable = isUser ? "post_likes" : "store_post_likes";
    const channel = supabase
      .channel(`reel-engagement-${post.id}`)
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: likesTable, filter: `post_id=eq.${rawId}` },
        () => setLiveLikesCount((n) => n + 1),
      )
      .on(
        "postgres_changes" as any,
        { event: "DELETE", schema: "public", table: likesTable, filter: `post_id=eq.${rawId}` },
        () => setLiveLikesCount((n) => Math.max(0, n - 1)),
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "post_comments", filter: `post_id=eq.${rawId}` },
        () => setLiveCommentsCount((n) => n + 1),
      )
      .on(
        "postgres_changes" as any,
        { event: "DELETE", schema: "public", table: "post_comments", filter: `post_id=eq.${rawId}` },
        () => setLiveCommentsCount((n) => Math.max(0, n - 1)),
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [isActive, post.id, post.source]);

  // Load existing bookmark state for this post
  useEffect(() => {
    if (!userId) { setSaved(false); return; }
    let alive = true;
    (supabase as any)
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", post.id)
      .maybeSingle()
      .then(({ data }: any) => { if (alive && data) setSaved(true); });
    return () => { alive = false; };
  }, [userId, post.id]);

  const handleSaveToggle = async () => {
    if (!userId) {
      toast.error("Please sign in to save reels");
      return;
    }
    if (savingBookmarkRef.current) return;
    savingBookmarkRef.current = true;
    const next = !saved;
    setSaved(next);
    try {
      if (next) {
        const { error } = await (supabase as any).from("bookmarks").upsert(
          {
            user_id: userId,
            item_id: post.id,
            item_type: "post",
            title: post.caption || `Reel by ${post.source === "user" ? post.author_name : post.store_name}`,
            collection_name: "Reels",
          },
          { onConflict: "user_id,item_id", ignoreDuplicates: true },
        );
        if (error && !String(error.message || "").toLowerCase().includes("duplicate")) throw error;
        toast.success("Saved");
      } else {
        await (supabase as any).from("bookmarks").delete().eq("user_id", userId).eq("item_id", post.id);
        toast.success("Removed from saved");
      }
    } catch {
      setSaved(!next);
      toast.error("Couldn't update saved");
    } finally {
      savingBookmarkRef.current = false;
    }
  };

  // Double-tap on the video to like — TikTok signature interaction.
  // Wraps the existing tap-to-toggle: if two taps land within 280ms,
  // we skip the play/pause and fire a like instead.
  const handleVideoClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      lastTapRef.current = 0;
      if (!liked) onToggleLike(post.id, false);
      setShowDoubleTapHeart(true);
      window.setTimeout(() => setShowDoubleTapHeart(false), 700);
      return;
    }
    lastTapRef.current = now;
    togglePlay();
  };

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
          preload={isActive ? "auto" : shouldPreload ? "metadata" : "none"}
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
              setVideoDuration(dur);
              const t = Math.min(3, Math.max(dur * 0.1, 1.5));
              try { e.currentTarget.currentTime = t; } catch { /* ignore */ }
            }
          }}
          onDurationChange={(e) => {
            // Some streams emit duration after metadata; pick it up here too.
            const dur = e.currentTarget.duration;
            if (Number.isFinite(dur) && dur > 0) setVideoDuration(dur);
          }}
          onSeeked={(e) => {
            capturePoster(e.currentTarget);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (Number.isFinite(v.duration) && v.duration > 0) {
              setVideoProgress(Math.min(1, v.currentTime / v.duration));
            }
          }}
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

      {/* Tap-to-play/pause · double-tap-to-like · long-press-to-2x.
          - Pointer down starts a 350ms timer that, on fire, kicks the
            video to 2× speed and shows the FF badge.
          - Pointer up before the timer fires falls through to the click
            handler (single/double-tap detection).
          - Pointer up after the timer fires resets to 1× and suppresses
            the click so we don't toggle play/pause on release. */}
      {isVideoPost && !hasPlaybackError && !isRepairing && !isBlobLoading && (
        <button
          type="button"
          onClick={(e) => {
            if (suppressNextClickRef.current) {
              suppressNextClickRef.current = false;
              return;
            }
            handleVideoClick();
          }}
          onPointerDown={() => {
            if (fastForwardTimerRef.current) clearTimeout(fastForwardTimerRef.current);
            fastForwardTimerRef.current = setTimeout(() => {
              const v = videoRef.current;
              if (!v) return;
              try { v.playbackRate = 2.0; } catch {}
              setIsHoldingFastForward(true);
              suppressNextClickRef.current = true;
            }, 350);
          }}
          onPointerUp={() => {
            if (fastForwardTimerRef.current) {
              clearTimeout(fastForwardTimerRef.current);
              fastForwardTimerRef.current = null;
            }
            if (isHoldingFastForward) {
              const v = videoRef.current;
              if (v) { try { v.playbackRate = playbackSpeed; } catch {} }
              setIsHoldingFastForward(false);
            }
          }}
          onPointerCancel={() => {
            if (fastForwardTimerRef.current) {
              clearTimeout(fastForwardTimerRef.current);
              fastForwardTimerRef.current = null;
            }
            if (isHoldingFastForward) {
              const v = videoRef.current;
              if (v) { try { v.playbackRate = playbackSpeed; } catch {} }
              setIsHoldingFastForward(false);
            }
          }}
          onPointerLeave={() => {
            // If the user drags off the video while holding, treat as cancel.
            if (fastForwardTimerRef.current) {
              clearTimeout(fastForwardTimerRef.current);
              fastForwardTimerRef.current = null;
            }
            if (isHoldingFastForward) {
              const v = videoRef.current;
              if (v) { try { v.playbackRate = playbackSpeed; } catch {} }
              setIsHoldingFastForward(false);
            }
          }}
          className="absolute inset-0 z-10"
          aria-label={isPlaying ? "Pause" : "Play"}
        />
      )}

      {/* 2× fast-forward badge — pulses while the user holds */}
      <AnimatePresence>
        {isHoldingFastForward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md flex items-center gap-1.5 pointer-events-none"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 84px)" }}
          >
            <span className="text-white text-sm font-bold tabular-nums">2×</span>
            <span className="text-white text-xs">▶▶</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double-tap heart burst */}
      <AnimatePresence>
        {showDoubleTapHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <Heart className="w-32 h-32 text-white fill-destructive drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

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
            <span className="text-white font-bold text-sm sm:text-[15px] lg:text-base drop-shadow-lg inline-flex items-center gap-1">
              {post.source === "user" ? post.author_name : post.store_name}
              {(post.source === "user" ? isBlueVerified(post.author_is_verified) : isBlueVerified(post.store_is_verified)) && (
                <VerifiedBadge size={16} />
              )}
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
        {/* Posted-time + location row */}
        {(post.location || post.created_at) && (
          <div className="flex items-center gap-2 mb-1.5 text-white/80 text-[11px] drop-shadow">
            {post.created_at && (() => {
              try {
                return <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>;
              } catch { return null; }
            })()}
            {post.location && post.created_at && <span className="text-white/50">·</span>}
            {post.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{post.location}</span>
              </span>
            )}
          </div>
        )}
        {post.caption && (() => {
          const isLong = post.caption.length > 90;
          return (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (isLong) setCaptionExpanded((v) => !v); }}
              className={cn(
                "block w-full text-left text-white text-sm sm:text-[15px] lg:text-base drop-shadow leading-snug mb-2",
                !captionExpanded && "line-clamp-2",
                isLong ? "cursor-pointer" : "cursor-default",
              )}
              aria-expanded={captionExpanded}
            >
              <Suspense fallback={<span>{post.caption}</span>}>
                <SafeCaption text={post.caption} />
              </Suspense>
              {isLong && (
                <span className="text-white/70 ml-1 font-semibold">
                  {captionExpanded ? " less" : " …more"}
                </span>
              )}
            </button>
          );
        })()}

        {/* Hashtag chips — extracted from caption, rendered as primary-colored
            pills below the caption so they're easier to tap on a tall reel.
            Deduped + capped at 6 to avoid clutter. */}
        {post.caption && (() => {
          const matches = post.caption.match(/#[a-zA-Z0-9_]{2,30}/g);
          if (!matches || matches.length === 0) return null;
          const seen = new Set<string>();
          const tags = matches.filter((t) => {
            const k = t.toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          }).slice(0, 6);
          return (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/explore?tag=${encodeURIComponent(tag.slice(1))}`);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold active:scale-95 transition-transform"
                >
                  {tag}
                </button>
              ))}
            </div>
          );
        })()}

        {/* Reaction summary + top comment preview */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <Suspense fallback={null}>
            <CommentPreview
              postId={rawPostId}
              source={post.source ?? "store"}
              totalCount={post.comments_count ?? 0}
              onOpen={() => onOpenComments(post.id)}
            />
          </Suspense>
          <Suspense fallback={null}>
            <ReactionSummary postId={rawPostId} source={post.source ?? "store"} />
          </Suspense>
        </div>

        {/* "View N comments" inline link — Instagram/TikTok pattern.
            Opens the existing comment sheet without forcing a trip to the
            right column. */}
        {(post.comments_count || 0) > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenComments(post.id); }}
            className="block text-white/80 text-xs font-medium drop-shadow mb-2 active:opacity-70"
          >
            View {post.comments_count === 1
              ? "1 comment"
              : `all ${post.comments_count! > 999 ? `${(post.comments_count! / 1000).toFixed(1)}k` : post.comments_count} comments`}
          </button>
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

      {/* Right-side action buttons (TikTok-style) — responsive scale.
          - mobile (<sm):  9 px / 36 px / 44 px hit, gap-4
          - tablet (≥sm):  10 px / 40 px / 44 px hit, gap-5
          - desktop (≥lg): 11 px / 44 px / 48 px hit, gap-6 */}
      <div
        className="absolute right-2 sm:right-3 lg:right-4 z-30 flex flex-col items-center gap-4 sm:gap-5 lg:gap-6"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)" }}
      >
        {/* Author avatar with follow badge — TikTok-style.
            When the author is live, the avatar's ring turns red + pulses,
            and a tap routes to the live stream instead of the profile. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (authorIsLive && post.author_id) {
              navigate(`/live/${post.author_id}`);
              return;
            }
            if (post.source === "user" && post.author_id) {
              onNavigate(`__user__${post.author_id}`);
            } else if (post.store_slug) {
              onNavigate(post.store_slug);
            }
          }}
          className={cn(
            "relative mb-1",
            authorIsLive && "after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-red-500 after:animate-ping after:pointer-events-none"
          )}
          aria-label={authorIsLive
            ? `${post.source === "user" ? post.author_name : post.store_name} is live — tap to watch`
            : `View ${post.source === "user" ? post.author_name : post.store_name}'s profile`}
        >
          <div className={cn(
            "w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-black/40 border-2",
            authorIsLive ? "border-red-500" : "border-white",
          )}>
            {(post.source === "user" ? post.author_avatar : post.store_logo) ? (
              <img
                src={(post.source === "user" ? post.author_avatar : post.store_logo)!}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-base font-bold">
                {((post.source === "user" ? post.author_name : post.store_name) || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          {/* LIVE pill — replaces the follow badge while streaming */}
          {authorIsLive && (
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none border-2 border-black">
              LIVE
            </span>
          )}
          {/* + button when not yet following — suppressed while LIVE pill is showing */}
          {!authorIsLive && authorId && !isSelf && !isFollowing && !followLoading && (
            <span
              onClick={(e) => { e.stopPropagation(); void handleFollow(e as any); }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-black cursor-pointer"
            >
              <span className="text-primary-foreground text-sm font-bold leading-none">+</span>
            </span>
          )}
          {/* Checkmark when following */}
          {!authorIsLive && authorId && !isSelf && isFollowing && (
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-black">
              <UserCheck className="w-3 h-3 text-white" strokeWidth={3} />
            </span>
          )}
          {/* Loading spinner during follow toggle */}
          {!authorIsLive && authorId && !isSelf && followLoading && (
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-black">
              <Loader2 className="w-3 h-3 text-primary-foreground animate-spin" />
            </span>
          )}
        </button>

        {/* Mute/Unmute with sound wave */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }}
          className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px]"
          aria-label={globalMuted ? "Unmute" : "Mute"}
        >
          <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center relative overflow-hidden border border-white/10">
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

        {/* Like / Reaction (long-press for emoji picker) */}
        <div className="relative">
          {onSetReaction && (
            <Suspense fallback={null}>
              <ReactionPicker
                open={showReactionPicker}
                onClose={() => setShowReactionPicker(false)}
                onPick={(emoji) => onSetReaction(emoji)}
              />
            </Suspense>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              // Burst only when transitioning unliked → liked (matches TikTok)
              if (!liked) {
                setShowLikeBurst(true);
                window.setTimeout(() => setShowLikeBurst(false), 600);
              }
              onToggleLike(post.id, liked);
            }}
            onPointerDown={(e) => {
              if (!onSetReaction) return;
              e.stopPropagation();
              if (longPressTimer.current) clearTimeout(longPressTimer.current);
              longPressTimer.current = setTimeout(() => setShowReactionPicker(true), 350);
            }}
            onPointerUp={() => {
              if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
            }}
            onPointerLeave={() => {
              if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
            }}
            onContextMenu={(e) => { e.preventDefault(); if (onSetReaction) setShowReactionPicker(true); }}
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px]"
            aria-label={currentReaction ? `Reacted ${currentReaction}` : "Like"}
          >
            {currentReaction ? (
              <span className="text-3xl drop-shadow-lg leading-none transition-transform active:scale-125" aria-hidden>
                {currentReaction}
              </span>
            ) : (
              <Heart
                className={cn(
                  "w-9 h-9 lg:w-10 lg:h-10 drop-shadow-lg transition-transform active:scale-125",
                  liked ? "text-destructive fill-destructive" : "text-white",
                )}
              />
            )}
            <motion.span
              key={liveLikesCount}
              initial={{ scale: 1.3, color: "#ef4444" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ duration: 0.3 }}
              className="text-xs font-semibold drop-shadow tabular-nums"
            >
              {liveLikesCount > 999 ? `${(liveLikesCount / 1000).toFixed(1)}k` : liveLikesCount}
            </motion.span>
          </button>
        </div>

        {/* Comment */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenComments(post.id); }}
          className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px]"
          aria-label="Comment"
          title="Comments"
        >
          <MessageCircle className="w-9 h-9 lg:w-10 lg:h-10 text-white drop-shadow-lg" />
          <motion.span
            key={liveCommentsCount}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-white text-xs font-semibold drop-shadow tabular-nums"
          >
            {liveCommentsCount > 999 ? `${(liveCommentsCount / 1000).toFixed(1)}k` : liveCommentsCount}
          </motion.span>
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <Eye className="w-9 h-9 lg:w-10 lg:h-10 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            {post.view_count || 0}
          </span>
        </div>

        {/* Repost */}
        {onOpenRepost && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenRepost(); }}
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px]"
            aria-label={isReposted ? "Reposted" : "Repost"}
          >
            <Repeat2 className={cn(
              "w-9 h-9 drop-shadow-lg",
              isReposted ? "text-emerald-400 fill-emerald-400/20" : "text-white",
            )} />
            <span className="text-white text-xs font-semibold drop-shadow">
              {(post.reposts_count || 0) > 0
                ? (post.reposts_count! > 999 ? `${(post.reposts_count! / 1000).toFixed(1)}k` : post.reposts_count)
                : isReposted ? "Reposted" : "Repost"}
            </span>
          </button>
        )}

        {/* Share */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenShare(post.id); }}
          className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px]"
          aria-label="Share"
        >
          <Share2 className="w-9 h-9 lg:w-10 lg:h-10 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            {(post.shares_count || 0) > 0
              ? (post.shares_count! > 999 ? `${(post.shares_count! / 1000).toFixed(1)}k` : post.shares_count)
              : "Share"}
          </span>
        </button>

        {/* Save / Bookmark */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleSaveToggle(); }}
          className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px]"
          aria-label={saved ? "Remove from saved" : "Save reel"}
        >
          <Bookmark
            className={cn(
              "w-9 h-9 drop-shadow-lg transition-transform active:scale-125",
              saved ? "text-amber-400 fill-amber-400" : "text-white",
            )}
          />
          <span className="text-white text-xs font-semibold drop-shadow">
            {saved ? "Saved" : "Save"}
          </span>
        </button>

        {/* More options (3-dot) → opens unified PostActionsMenu */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenActions) onOpenActions();
            else setShowMoreMenu(true);
          }}
          className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px]"
          aria-label="More options"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <MoreHorizontal className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* Rotating sound disk — TikTok-signature album art. Spins only while
            the video is playing; tap to open the sound's reels feed. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const soundLabel = post.audio_name || `Original Sound - ${post.source === "user" ? post.author_name || "ZIVO" : post.store_name || "ZIVO"}`;
            onOpenSound(soundLabel);
          }}
          className="mt-1"
          aria-label="Sound details"
        >
          <div
            className={cn(
              "w-11 h-11 rounded-full overflow-hidden border-2 border-black bg-gradient-to-br from-zinc-700 via-zinc-900 to-black flex items-center justify-center",
              isActive && isPlaying && "animate-[spin_5s_linear_infinite]",
            )}
          >
            {(post.source === "user" ? post.author_avatar : post.store_logo) ? (
              <img
                src={(post.source === "user" ? post.author_avatar : post.store_logo)!}
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <Music className="w-4 h-4 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Scrub timecode — appears in the center of the screen while dragging
          the progress bar so the user can land on a specific moment. */}
      <AnimatePresence>
        {isScrubbing && videoDuration > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-md flex items-baseline gap-1 pointer-events-none"
            style={{ top: "40%" }}
          >
            <span className="text-white text-2xl font-bold tabular-nums">
              {formatVideoTime(videoProgress * videoDuration)}
            </span>
            <span className="text-white/50 text-sm tabular-nums">
              / {formatVideoTime(videoDuration)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video progress bar — drag-to-seek (TikTok style).
          The wrapper is a tall invisible touch target so users can grab it
          easily, while the visible bar stays thin (or grows when scrubbing). */}
      {isVideoPost && !hasPlaybackError && (
        <div
          ref={progressBarRef}
          className="absolute inset-x-0 bottom-0 z-25 h-6 flex items-end touch-none select-none"
          onPointerDown={(e) => {
            if (!progressBarRef.current || !videoRef.current) return;
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            const rect = progressBarRef.current.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            wasPlayingBeforeScrub.current = !videoRef.current.paused;
            videoRef.current.pause();
            setIsScrubbing(true);
            setVideoProgress(ratio);
            if (Number.isFinite(videoRef.current.duration)) {
              videoRef.current.currentTime = ratio * videoRef.current.duration;
            }
          }}
          onPointerMove={(e) => {
            if (!isScrubbing || !progressBarRef.current || !videoRef.current) return;
            const rect = progressBarRef.current.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setVideoProgress(ratio);
            if (Number.isFinite(videoRef.current.duration)) {
              videoRef.current.currentTime = ratio * videoRef.current.duration;
            }
          }}
          onPointerUp={(e) => {
            (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
            setIsScrubbing(false);
            if (wasPlayingBeforeScrub.current) {
              void videoRef.current?.play().catch(() => {});
            }
          }}
          onPointerCancel={() => {
            setIsScrubbing(false);
            if (wasPlayingBeforeScrub.current) {
              void videoRef.current?.play().catch(() => {});
            }
          }}
        >
          <div
            className={cn(
              "relative w-full bg-white/15 transition-[height] duration-150",
              isScrubbing ? "h-1" : "h-0.5",
            )}
          >
            <div
              className="absolute inset-y-0 left-0 bg-white/90"
              style={{ width: `${videoProgress * 100}%` }}
            />
            {isScrubbing && (
              <div
                className="absolute -top-1.5 w-4 h-4 -ml-2 rounded-full bg-white shadow-lg"
                style={{ left: `${videoProgress * 100}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* Like-tap heart burst — single-tap on the like button (right column).
          Distinct from the double-tap-on-video burst — this one is small + on
          the side. */}
      <AnimatePresence>
        {showLikeBurst && (
          <motion.div
            initial={{ scale: 0, opacity: 1, y: 0 }}
            animate={{ scale: 1.1, opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute right-6 z-40 pointer-events-none"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 270px)" }}
          >
            <Heart className="w-12 h-12 text-destructive fill-destructive drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* More-options bottom sheet */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="fixed inset-0 z-[80] bg-black/60"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[81] bg-background rounded-t-2xl pb-[env(safe-area-inset-bottom,16px)]"
            >
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="px-2 py-2 space-y-0.5">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    const url = `${window.location.origin}/reels/${post.id}`;
                    try {
                      const ta = document.createElement("textarea");
                      ta.value = url;
                      ta.style.cssText = "position:fixed;opacity:0;left:-9999px";
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand("copy");
                      document.body.removeChild(ta);
                      toast.success("Link copied");
                    } catch { toast.info("Long-press URL bar to copy"); }
                  }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl"
                >
                  <Link2 className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Copy link</span>
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); setShowSpeedPicker(true); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl"
                >
                  <Gauge className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground flex-1 text-left">Playback speed</span>
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums">{playbackSpeed}×</span>
                </button>
                <button
                  onClick={async () => {
                    setShowMoreMenu(false);
                    const v = videoRef.current;
                    if (!v) return;
                    try {
                      const doc = document as any;
                      if (doc.pictureInPictureElement) {
                        await doc.exitPictureInPicture();
                      } else if ((v as any).requestPictureInPicture) {
                        await (v as any).requestPictureInPicture();
                      } else {
                        toast.error("Picture-in-picture isn't supported on this device");
                      }
                    } catch {
                      toast.error("Couldn't open picture-in-picture");
                    }
                  }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl"
                >
                  <PictureInPicture className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Picture-in-picture</span>
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); toast.success("You'll see fewer reels like this"); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl"
                >
                  <EyeOff className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Not interested</span>
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); toast.success("Thanks — we'll review this reel"); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl"
                >
                  <Flag className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Report</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Speed-picker bottom sheet */}
      <AnimatePresence>
        {showSpeedPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSpeedPicker(false)}
              className="fixed inset-0 z-[80] bg-black/60"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[81] bg-background rounded-t-2xl pb-[env(safe-area-inset-bottom,16px)]"
            >
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>
              <p className="px-5 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Playback speed</p>
              <div className="px-2 pb-2 grid grid-cols-4 gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((rate) => {
                  const active = Math.abs(playbackSpeed - rate) < 0.01;
                  return (
                    <button
                      key={rate}
                      onClick={() => { setPlaybackSpeed(rate); setShowSpeedPicker(false); }}
                      className={cn(
                        "py-3 rounded-xl text-sm font-bold tabular-nums transition-all active:scale-95",
                        active ? "bg-primary text-primary-foreground" : "bg-muted/40 text-foreground hover:bg-muted",
                      )}
                    >
                      {rate}×
                    </button>
                  );
                })}
              </div>
              <p className="px-5 pb-3 text-[11px] text-muted-foreground">
                Tip: tap and hold the video for a quick 2× boost.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Speed badge — shown in the corner whenever playback isn't 1× and
          user isn't actively long-pressing (the FF badge takes over then). */}
      {playbackSpeed !== 1.0 && !isHoldingFastForward && (
        <div
          className="absolute right-3 z-30 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm pointer-events-none"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 80px)" }}
        >
          <span className="text-white text-[11px] font-bold tabular-nums">{playbackSpeed}×</span>
        </div>
      )}
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
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
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
    if (!confirmContentSafe(commentText, "comment")) return;
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
                  <p className="text-sm text-foreground">
                    <Suspense fallback={<span>{c.content}</span>}>
                      <SafeCaption text={c.content} />
                    </Suspense>
                  </p>
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
            <div className="relative flex gap-2">
              {/* @-mention autocomplete (anchors above the input) */}
              <Suspense fallback={null}>
                <MentionPicker
                  query={mentionQuery}
                  onSelect={(r) => {
                    if (!inputRef.current) return;
                    const caret = inputRef.current.selectionStart ?? commentText.length;
                    const handle = r.username || r.fullName || "";
                    if (!handle) return;
                    const next = applyMention(commentText, caret, handle);
                    setCommentText(next.value);
                    setMentionQuery(null);
                    requestAnimationFrame(() => {
                      inputRef.current?.focus();
                      inputRef.current?.setSelectionRange(next.caret, next.caret);
                    });
                  }}
                  onClose={() => setMentionQuery(null)}
                />
              </Suspense>
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  const caret = e.target.selectionStart ?? e.target.value.length;
                  setMentionQuery(detectMention(e.target.value, caret));
                }}
                onKeyDown={(e) => {
                  // Picker handles Enter while open; only submit when no picker
                  if (e.key === "Enter" && mentionQuery == null) handleSubmit();
                }}
                placeholder="Add a comment..."
                className="flex-1 h-11 sm:h-10 rounded-full bg-muted px-4 text-base sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!commentText.trim() || submitting}
                className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
                aria-label="Send comment"
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
                onClick={() => { onNavigate(`/user/${person.id}`); onClose(); }}
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
        .select("id, media_urls, media_type, profiles(full_name, username)")
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
          views: 0, author: p.profiles?.full_name || p.profiles?.username || "User",
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
      <SEOHead
        title="ZIVO Feed – Short Videos, Reels & Stories"
        description="Watch and share short videos, reels, and stories from creators around the world. Like, comment, follow, and discover trending content on ZIVO."
        canonical="/feed"
      />
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
      <div data-testid="feed-discover-header" className="flex items-center gap-3 px-4 py-3 border-b border-border/30" style={{ paddingTop: 'var(--zivo-safe-top-sticky)' }}>
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
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">
                      <Suspense fallback={<span>{profile.bio}</span>}>
                        <SafeCaption text={profile.bio} />
                      </Suspense>
                    </p>
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
  // On `/reels` we render the TikTok-style hero — hide the desktop side rails
  // so the video can fill the viewport. `/feed` keeps the 3-column layout.
  const isReelsRoute = location.pathname.startsWith("/reels");
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
  const [feedMode, setFeedMode] = useState<"foryou" | "following">("foryou");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  // Post actions (bookmark / mute / block / report) + 3-dot menu
  const postActions = usePostActions(userId);
  const [actionsTarget, setActionsTarget] = useState<{ target: PostActionTarget; authorName?: string; shareUrl?: string } | null>(null);
  // Realtime new-posts banner
  const [newPostsCount, setNewPostsCount] = useState(0);
  // Pull-to-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef<number | null>(null);
  const [pullDelta, setPullDelta] = useState(0);
  // Trending-hashtag chip filter
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  // Multi-emoji reactions
  const reactions = usePostReactions(userId);
  // Reposts
  const reposts = usePostReposts(userId);
  const [repostTarget, setRepostTarget] = useState<{
    postId: string; source: "store" | "user"; authorName?: string; preview?: string | null;
  } | null>(null);
  // Author-only insights drawer
  const [insightsTarget, setInsightsTarget] = useState<{
    postId: string; source: "store" | "user";
  } | null>(null);
  // Infinite scroll — multiplier on the base page size
  const [pageMultiplier, setPageMultiplier] = useState(1);
  // Posts the user just blocked, removed from view immediately
  const [hiddenAuthorIds, setHiddenAuthorIds] = useState<Set<string>>(new Set());
  const { data: ownerStore } = useOwnerStoreProfile();
  const lodgingRooms = useLodgeRooms(ownerStore?.isLodging ? ownerStore.id : "");
  const lodgingProfile = useLodgePropertyProfile(ownerStore?.isLodging ? ownerStore.id : "");
  const lodgingCompletion = ownerStore?.isLodging ? getLodgingCompletion({ rooms: lodgingRooms.data || [], profile: lodgingProfile.data, addons: [], housekeepingCount: 0, maintenanceReady: true, reportsReady: Boolean((lodgingRooms.data || []).length) }) : null;

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

  // First-visit swipe-up hint — auto-dismisses after 3 s and on any user
  // interaction (scroll, key press, click). Persisted in localStorage so
  // returning users don't see it again.
  useEffect(() => {
    try {
      if (localStorage.getItem("zivo_reel_onboarded") === "1") return;
    } catch { /* private mode etc. — just show the hint */ }
    setShowSwipeHint(true);
    const dismiss = () => {
      setShowSwipeHint(false);
      try { localStorage.setItem("zivo_reel_onboarded", "1"); } catch {}
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("click", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchstart", dismiss);
    };
    window.addEventListener("keydown", dismiss);
    window.addEventListener("click", dismiss);
    window.addEventListener("wheel", dismiss, { passive: true });
    window.addEventListener("touchstart", dismiss, { passive: true });
    const timer = window.setTimeout(dismiss, 3500);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("click", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchstart", dismiss);
    };
  }, []);

  // Followed user IDs — drives the "Following" tab filter
  useEffect(() => {
    if (!userId) { setFollowingIds(new Set()); return; }
    let alive = true;
    (supabase as any)
      .from("user_followers")
      .select("following_id")
      .eq("follower_id", userId)
      .then(({ data }: any) => {
        if (!alive) return;
        setFollowingIds(new Set((data || []).map((r: any) => r.following_id)));
      });
    return () => { alive = false; };
  }, [userId]);

  const { data: posts = [], isLoading, isFetching } = useQuery({
    queryKey: ["customer-feed", userId, pageMultiplier],
    queryFn: async () => {
      // Pull the muted/blocked author list first so we can filter the feed
      // server-side. Defence-in-depth: client also filters in case RLS isn't
      // wired for these tables yet (the migration is included in this branch).
      let mutedAuthorIds = new Set<string>();
      if (userId) {
        const { data: safety } = await (supabase as any)
          .from("user_safety_actions")
          .select("target_user_id, action")
          .eq("user_id", userId);
        mutedAuthorIds = new Set((safety ?? []).map((s: any) => s.target_user_id));
      }

      // Fetch store posts and user video posts in parallel.
      // Page size grows with `pageMultiplier` so "load more" reveals additional content.
      const STORE_PAGE = 50;
      const USER_PAGE  = 30;
      const [{ data: postsData, error }, { data: userVideos }] = await Promise.all([
        supabase
          .from("store_posts")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(STORE_PAGE * pageMultiplier),
        (supabase as any)
          .from("user_posts")
          .select("id, user_id, media_url, media_urls, media_type, caption, likes_count, comments_count, shares_count, views_count, created_at, audio_name, location")
          .eq("is_published", true)
          .in("media_type", ["video", "reel"])
          .order("created_at", { ascending: false })
          .limit(USER_PAGE * pageMultiplier),
      ]);
      if (error) throw error;

      // Strip muted/blocked authors from user video posts
      const filteredUserVideos = (userVideos ?? []).filter(
        (p: any) => !mutedAuthorIds.has(p.user_id)
      );

      const storeIds = [...new Set((postsData || []).map((p: any) => p.store_id))];
      const userIds = [...new Set(filteredUserVideos.map((p: any) => p.user_id))];

      const [{ data: stores }, { data: profiles }] = await Promise.all([
        storeIds.length
          ? supabase.from("store_profiles").select("id, name, logo_url, slug, is_verified").in("id", storeIds)
          : Promise.resolve({ data: [] as any[] }),
        userIds.length
          ? supabase.from("profiles").select("id, user_id, full_name, username, avatar_url, is_verified").or(`user_id.in.(${(userIds as string[]).join(",")}),id.in.(${(userIds as string[]).join(",")})`)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const storeMap = new Map((stores || []).map((s: any) => [s.id, s]));
      const profileMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => {
        if (p.id) profileMap.set(p.id, p);
        if (p.user_id) profileMap.set(p.user_id, p);
      });

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
          store_is_verified: (store as any)?.is_verified === true,
        });
      }

      // User video posts (already filtered for muted/blocked authors above)
      for (const post of filteredUserVideos) {
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
          shares_count: post.shares_count || 0,
          view_count: post.views_count || 0,
          audio_name: post.audio_name || null,
          source: "user",
          author_id: post.user_id,
          author_name: profile?.full_name || profile?.username || "User",
          author_avatar: profile?.avatar_url || null,
          author_is_verified: !!profile?.is_verified,
          location: post.location || null,
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

  // Posts shown in the snap-scroller — filtered by For You / Following + hashtag.
  // Memoized so cardRefs / activeIndex stay aligned with what's rendered.
  const visiblePosts = useMemo(() => {
    let list = posts;
    if (feedMode === "following" && userId) {
      list = list.filter((p) => p.author_id && followingIds.has(p.author_id));
    }
    if (selectedHashtag) {
      list = list.filter((p) => postHasHashtag(p.caption, selectedHashtag));
    }
    if (hiddenAuthorIds.size > 0) {
      list = list.filter((p) => !p.author_id || !hiddenAuthorIds.has(p.author_id));
    }
    return list;
  }, [posts, feedMode, userId, followingIds, selectedHashtag, hiddenAuthorIds]);

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

  // ── Realtime: count new posts that arrive while user is mid-feed ────────────
  // Channel name is opaque (per security guidance) — uses topicForUserSync so
  // the leaked topic-name metadata doesn't reveal the user ID.
  useEffect(() => {
    const channelName = userId ? topicForUserSync(userId, "feed-new-posts") : "feed-new-posts:anon";
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_posts" }, (payload: any) => {
        // Skip the user's own posts (they'll see them via the optimistic update)
        if (payload?.new?.user_id === userId) return;
        if (payload?.new?.is_published === false) return;
        setNewPostsCount((c) => c + 1);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "store_posts" }, (payload: any) => {
        if (payload?.new?.is_published === false) return;
        setNewPostsCount((c) => c + 1);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Tapping the pill: scroll to top, refetch, clear count
  const handleShowNewPosts = useCallback(() => {
    setNewPostsCount(0);
    queryClient.invalidateQueries({ queryKey: ["customer-feed"] });
    cardRefs.current[0]?.scrollIntoView({ behavior: "smooth" });
    setActiveIndex(0);
  }, [queryClient]);

  // ── Pull-to-refresh: simple touch-driven swipe-down at the top ─────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only begin pull if we're already at the top of the scroll container
    const scroller = (e.currentTarget as HTMLDivElement);
    if (scroller.scrollTop > 0) return;
    pullStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (pullStartY.current == null) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) setPullDelta(Math.min(delta, 120));
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullStartY.current == null) return;
    const triggered = pullDelta > 70;
    pullStartY.current = null;
    setPullDelta(0);
    if (triggered && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await queryClient.invalidateQueries({ queryKey: ["customer-feed"] });
        setNewPostsCount(0);
        toast.success("Feed refreshed");
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [pullDelta, isRefreshing, queryClient]);

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
      // Push notification to post author — once per post per session.
      const post = posts.find(p => p.id === postId);
      const authorId = post?.author_id;
      if (authorId && authorId !== userId && shouldSendLikeNotification(postId)) {
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

  // Keyboard shortcuts for the reel viewer (desktop power-user).
  // Skipped while typing in any input/textarea so we don't hijack typing.
  // - Space / K  → play / pause active reel
  // - M          → toggle mute
  // - L          → like / unlike active reel
  // - ↓ / J      → next reel
  // - ↑          → previous reel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const currentPost = visiblePosts[activeIndex];
      const currentCard = cardRefs.current[activeIndex];

      switch (e.key) {
        case " ":
        case "k":
        case "K": {
          e.preventDefault();
          const video = currentCard?.querySelector("video");
          if (video) {
            if (video.paused) void video.play().catch(() => {});
            else video.pause();
          }
          break;
        }
        case "m":
        case "M": {
          e.preventDefault();
          setGlobalMuted((m) => !m);
          break;
        }
        case "l":
        case "L": {
          if (!currentPost || !userId) return;
          e.preventDefault();
          handleToggleLike(currentPost.id, userLikedPostIds.has(currentPost.id));
          break;
        }
        case "ArrowDown":
        case "j":
        case "J": {
          if (activeIndex < visiblePosts.length - 1) {
            e.preventDefault();
            cardRefs.current[activeIndex + 1]?.scrollIntoView({ behavior: "smooth" });
          }
          break;
        }
        case "ArrowUp": {
          if (activeIndex > 0) {
            e.preventDefault();
            cardRefs.current[activeIndex - 1]?.scrollIntoView({ behavior: "smooth" });
          }
          break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, visiblePosts, userId, userLikedPostIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // IntersectionObserver — re-attach when the visible list changes (e.g.
  // toggling For You / Following) so we observe the freshly-rendered cards
  // instead of stale DOM nodes from the previous list.
  useEffect(() => {
    if (visiblePosts.length === 0) return;
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
  }, [visiblePosts.length]);

  useEffect(() => {
    const sharedPostId = new URLSearchParams(location.search).get("post");
    if (!sharedPostId || visiblePosts.length === 0) return;

    // Index into the rendered list — using full posts here would point past
    // the cardRefs array when Following filters the feed down.
    const targetIndex = visiblePosts.findIndex((post) => post.id === sharedPostId);
    if (targetIndex < 0) return;

    setActiveIndex(targetIndex);
    requestAnimationFrame(() => {
      cardRefs.current[targetIndex]?.scrollIntoView({ block: "start" });
    });
  }, [visiblePosts, location.search]);

  if (isLoading) {
    return (
      <Suspense fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <Loader2 className="h-9 w-9 animate-spin text-white" />
        </div>
      }>
        <FeedSkeleton />
      </Suspense>
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

  // Following tab with no matching reels — distinct empty state.
  if (feedMode === "following" && visiblePosts.length === 0 && userId) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50 px-8 text-center">
        <UserPlus className="h-14 w-14 text-white/20" />
        <p className="text-white font-semibold">No reels from people you follow</p>
        <p className="text-white/50 text-sm">Follow creators to see their reels here, or switch back to For You to discover new ones.</p>
        <button
          onClick={() => setFeedMode("foryou")}
          className="mt-2 px-5 py-2 rounded-full bg-white text-black text-sm font-bold active:scale-95 transition-transform"
        >
          Back to For You
        </button>
        <button
          onClick={() => setShowDiscover(true)}
          className="text-white/70 text-sm underline"
        >
          Discover creators
        </button>
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
      {/* For You / Following tabs — TikTok-style top center segmented control */}
      {userId && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center gap-5 sm:gap-6 lg:gap-8"
          style={{ top: 'var(--zivo-safe-top-overlay)' }}
        >
          {(["foryou", "following"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setFeedMode(mode);
                setActiveIndex(0);
                requestAnimationFrame(() => cardRefs.current[0]?.scrollIntoView({ block: "start" }));
              }}
              className={cn(
                "relative py-2 px-1 min-h-[44px] text-sm sm:text-[15px] lg:text-base font-bold transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] active:scale-95",
                feedMode === mode ? "text-white" : "text-white/60",
              )}
            >
              {mode === "foryou" ? "For You" : "Following"}
              {feedMode === mode && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 lg:w-8 h-0.5 lg:h-1 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Trending hashtags chip row */}
      <Suspense fallback={null}>
        <TrendingHashtags
          posts={posts}
          selected={selectedHashtag}
          onSelect={(tag) => {
            setSelectedHashtag(tag);
            setActiveIndex(0);
            requestAnimationFrame(() => cardRefs.current[0]?.scrollIntoView({ block: "start" }));
          }}
        />
      </Suspense>

      {/* Discover + Search + Live buttons - hide on desktop */}
      <div data-testid="feed-floating-actions" className="absolute right-3 sm:right-4 z-50 flex gap-2 sm:gap-2.5 lg:hidden" style={{ top: 'var(--zivo-safe-top-overlay)' }}>
        <button
          type="button"
          onClick={() => navigate("/live")}
          aria-label="Watch live"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform border border-white/10"
        >
          <Radio className="w-5 h-5 text-red-400" />
        </button>
        <button
          type="button"
          onClick={() => setShowDiscover(true)}
          aria-label="Discover people"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform border border-white/10"
        >
          <UserPlus className="w-5 h-5 text-white" />
        </button>
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          aria-label="Search"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform border border-white/10"
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
        className="relative w-full h-full md:flex md:items-stretch md:justify-center md:gap-6 lg:flex-1 lg:min-h-0 lg:h-0 lg:px-6 xl:px-10"
      >
        {/* Desktop LEFT rail — navigation + services.
            Hidden on `/reels` so the TikTok-style hero can fill the viewport. */}
        {!isReelsRoute && (
          <aside className="hidden lg:flex lg:flex-col lg:w-[260px] xl:w-[300px] shrink-0 h-full overflow-y-auto py-6 pr-2 bg-background/40 backdrop-blur-sm border-r border-border/20 rounded-r-2xl">
            <Suspense fallback={<div className="h-32" />}>
              <FeedSidebar />
            </Suspense>
          </aside>
        )}

        {/* Phone-frame on tablet, full-width on desktop.
            On `/reels` we widen the frame since the side rails are hidden. */}
        <div className={cn(
          "w-full h-full md:mx-auto md:rounded-2xl md:overflow-hidden md:shadow-2xl md:border md:border-white/10 md:h-[calc(100%-2rem)] md:w-auto md:aspect-[9/16] md:max-w-[420px] lg:my-4",
          isReelsRoute ? "lg:max-w-[520px] xl:max-w-[560px]" : "lg:max-w-[460px] xl:max-w-[500px]",
        )}>
          <div
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory relative"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              transform: pullDelta > 0 ? `translateY(${pullDelta}px)` : undefined,
              transition: pullDelta === 0 ? "transform 200ms ease-out" : undefined,
            } as React.CSSProperties}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Pull-to-refresh indicator */}
            {(pullDelta > 0 || isRefreshing) && (
              <div
                className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 flex items-center justify-center"
                style={{ top: Math.max(20, pullDelta - 30) }}
              >
                <div
                  className={cn(
                    "rounded-full bg-white/15 backdrop-blur-md p-2 transition-transform",
                    isRefreshing && "animate-spin",
                  )}
                  style={{ transform: !isRefreshing ? `rotate(${pullDelta * 3}deg)` : undefined }}
                >
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            {/* New posts pill */}
            <Suspense fallback={null}>
              <NewPostsPill count={newPostsCount} onClick={handleShowNewPosts} />
            </Suspense>

            {/* Empty state when a hashtag filter or Following tab returns no results */}
            {visiblePosts.length === 0 && (selectedHashtag || (feedMode === "following" && userId)) && (
              <div className="w-full h-full snap-start flex flex-col items-center justify-center px-8 text-center bg-black">
                <div className="text-5xl mb-4">{selectedHashtag ? "🔍" : "👥"}</div>
                <p className="text-white font-semibold text-lg mb-1">
                  {selectedHashtag ? `No posts tagged #${selectedHashtag}` : "Your following feed is empty"}
                </p>
                <p className="text-white/60 text-sm max-w-xs">
                  {selectedHashtag
                    ? "Try clearing the filter or swipe back to the full feed."
                    : "Follow some creators or shops and their posts will show up here."}
                </p>
                <button
                  onClick={() => {
                    if (selectedHashtag) setSelectedHashtag(null);
                    else setShowDiscover(true);
                  }}
                  className="mt-5 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white"
                >
                  {selectedHashtag ? "Clear filter" : "Discover people"}
                </button>
              </div>
            )}

            {visiblePosts.map((post, index) => (
              <div key={post.id} className="contents">
                {/* Inject the reels preview after the 4th card */}
                {index === 4 && (
                  <div className="w-full h-full snap-start">
                    <Suspense fallback={<div className="h-full w-full bg-black" />}>
                      <ReelsPreviewRow />
                    </Suspense>
                  </div>
                )}
                <div
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className="w-full h-full snap-start"
                >
                  <ReelCard
                    post={post}
                    isActive={activeIndex === index}
                    shouldPreload={index === activeIndex + 1 || index === activeIndex - 1}
                    globalMuted={globalMuted}
                    onToggleMute={() => setGlobalMuted((m) => !m)}
                    onNavigate={(slug) => slug.startsWith("__user__") ? navigate(`/user/${slug.replace("__user__", "")}`) : navigate(`/grocery/shop/${slug}`)}
                    userId={userId}
                    userLikedPostIds={userLikedPostIds}
                    onToggleLike={handleToggleLike}
                    onOpenComments={(id) => setCommentPostId(id)}
                    onOpenShare={(id) => setSharePostId(id)}
                    onOpenSound={(name) => setSoundOverlayName(name)}
                    onOpenActions={() => {
                      const rawId = post.id.startsWith("u-") ? post.id.slice(2) : post.id;
                      setActionsTarget({
                        target: {
                          postId: rawId,
                          source: post.source ?? "store",
                          authorId: post.author_id ?? undefined,
                        },
                        authorName: post.author_name ?? post.store_name,
                        shareUrl: getPostShareUrl(post.id),
                      });
                    }}
                    currentReaction={(() => {
                      const rawId = post.id.startsWith("u-") ? post.id.slice(2) : post.id;
                      return reactions.reactionFor(rawId, post.source ?? "store");
                    })()}
                    onSetReaction={(emoji) => {
                      const rawId = post.id.startsWith("u-") ? post.id.slice(2) : post.id;
                      void reactions.setReaction(rawId, post.source ?? "store", emoji);
                    }}
                    onOpenRepost={() => {
                      const rawId = post.id.startsWith("u-") ? post.id.slice(2) : post.id;
                      setRepostTarget({
                        postId: rawId,
                        source: post.source ?? "store",
                        authorName: post.author_name ?? post.store_name,
                        preview: post.caption,
                      });
                    }}
                    isReposted={(() => {
                      const rawId = post.id.startsWith("u-") ? post.id.slice(2) : post.id;
                      return reposts.isReposted(rawId, post.source ?? "store");
                    })()}
                  />
                </div>
              </div>
            ))}

            {/* Infinite-scroll sentinel: when the user reaches the last card,
                bump the page multiplier so the next refetch loads more. */}
            {visiblePosts.length > 0 && (
              <InfiniteScrollSentinel
                isFetching={isFetching}
                onReachEnd={() => setPageMultiplier((m) => m + 1)}
              />
            )}
          </div>
        </div>

        {/* Desktop RIGHT rail — suggested people + trending.
            Hidden on `/reels` so the TikTok-style hero can fill the viewport.
            Hotel Admin / Run QA are operator tools — never shown on the
            consumer reels page; on `/feed` they only render for lodging owners. */}
        {!isReelsRoute && (
          <aside className="hidden lg:flex lg:flex-col lg:w-[300px] xl:w-[340px] shrink-0 h-full overflow-y-auto py-6 px-3 bg-background/40 backdrop-blur-sm border-l border-border/20 rounded-l-2xl gap-4">
            {ownerStore?.isLodging && lodgingCompletion && (
              <div className="rounded-xl border border-primary/30 bg-card/70 p-3">
                <div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-semibold text-foreground">Hotel / Resort Admin</h3><p className="mt-0.5 text-xs text-muted-foreground truncate">{ownerStore.name}</p></div><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{lodgingCompletion.percent}%</span></div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${lodgingCompletion.percent}%` }} /></div>
                <p className="mt-2 text-[11px] text-muted-foreground">Next: {lodgingCompletion.nextBestAction.actionLabel}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><button onClick={() => navigate(`/admin/stores/${ownerStore.id}?tab=lodge-overview`)} className="rounded-lg bg-primary px-2 py-2 font-semibold text-primary-foreground">Open Hotel Admin</button><button onClick={() => navigate("/admin/lodging/qa-checklist")} className="rounded-lg bg-muted px-2 py-2 font-semibold text-foreground">Run QA</button><button onClick={() => navigate("/admin/lodging/qa-checklist")} className="col-span-2 rounded-lg bg-muted px-2 py-2 font-semibold text-foreground">View QA Report</button></div>
              </div>
            )}
            <div className="px-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Suggested for you</h3>
              <Suspense fallback={<div className="h-40" />}>
                <SuggestedUsersCarousel variant="inline" />
              </Suspense>
            </div>
            <div className="mt-2 rounded-xl border border-border/30 bg-card/40 p-3">
              <h3 className="text-sm font-semibold text-foreground mb-2">Quick links</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button onClick={() => navigate("/flights")} className="px-2 py-2 rounded-lg bg-muted/40 hover:bg-muted text-foreground text-left flex items-center gap-2"><Plane className="w-4 h-4 text-primary shrink-0" /> Flights</button>
                <button onClick={() => navigate("/hotels")} className="px-2 py-2 rounded-lg bg-muted/40 hover:bg-muted text-foreground text-left flex items-center gap-2"><Building2 className="w-4 h-4 text-primary shrink-0" /> Hotels</button>
                <button onClick={() => navigate("/eats")} className="px-2 py-2 rounded-lg bg-muted/40 hover:bg-muted text-foreground text-left flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-primary shrink-0" /> Eats</button>
                <button onClick={() => navigate("/rides")} className="px-2 py-2 rounded-lg bg-muted/40 hover:bg-muted text-foreground text-left flex items-center gap-2"><Car className="w-4 h-4 text-primary shrink-0" /> Rides</button>
                <button onClick={() => navigate("/jobs")} className="px-2 py-2 rounded-lg bg-muted/40 hover:bg-muted text-foreground text-left flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary shrink-0" /> Jobs</button>
                <button onClick={() => navigate("/shop")} className="px-2 py-2 rounded-lg bg-muted/40 hover:bg-muted text-foreground text-left flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-primary shrink-0" /> Shop</button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/70 mt-auto px-1 pt-4">© ZIVO LLC · hizivo.com</p>
          </aside>
        )}

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
              if (activeIndex < visiblePosts.length - 1) {
                cardRefs.current[activeIndex + 1]?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            disabled={activeIndex >= visiblePosts.length - 1}
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

      {/* 3-dot post actions menu (save / mute / block / report / why) */}
      <Suspense fallback={null}>
        {actionsTarget && (
          <PostActionsMenu
            open={!!actionsTarget}
            onClose={() => setActionsTarget(null)}
            target={actionsTarget.target}
            authorName={actionsTarget.authorName}
            shareUrl={actionsTarget.shareUrl}
            isBookmarked={postActions.isBookmarked(actionsTarget.target)}
            onToggleBookmark={() => postActions.toggleBookmark(actionsTarget.target)}
            onMute={() => {
              if (actionsTarget.target.authorId) {
                setHiddenAuthorIds((prev) => new Set(prev).add(actionsTarget.target.authorId!));
              }
              postActions.muteAuthor(actionsTarget.target);
            }}
            onBlock={() => {
              if (actionsTarget.target.authorId) {
                setHiddenAuthorIds((prev) => new Set(prev).add(actionsTarget.target.authorId!));
              }
              postActions.blockAuthor(actionsTarget.target);
            }}
            onReport={(reason) => postActions.reportPost(actionsTarget.target, reason)}
            isOwnPost={!!userId && actionsTarget.target.source === "user" && actionsTarget.target.authorId === userId}
            onViewInsights={() => setInsightsTarget({ postId: actionsTarget.target.postId, source: actionsTarget.target.source })}
          />
        )}
      </Suspense>

      {/* Author-only insights drawer */}
      <Suspense fallback={null}>
        {insightsTarget && (
          <PostInsights
            open={!!insightsTarget}
            onClose={() => setInsightsTarget(null)}
            postId={insightsTarget.postId}
            source={insightsTarget.source}
          />
        )}
      </Suspense>

      {/* Repost dialog */}
      <Suspense fallback={null}>
        {repostTarget && (
          <RepostDialog
            open={!!repostTarget}
            onClose={() => setRepostTarget(null)}
            authorName={repostTarget.authorName}
            postPreview={repostTarget.preview}
            alreadyReposted={reposts.isReposted(repostTarget.postId, repostTarget.source)}
            onConfirm={async (quoteText) => {
              const nowReposted = await reposts.toggleRepost(
                repostTarget.postId,
                repostTarget.source,
                quoteText,
              );
              toast.success(nowReposted ? "Reposted to your profile" : "Repost removed");
            }}
          />
        )}
      </Suspense>

      {/* Share sheet */}
      {sharePostId && (() => {
        const sharePost = posts.find((p) => p.id === sharePostId);
        const sharePostSource = sharePost?.source ?? "store";
        const sharePostRawId = sharePostId.startsWith("u-") ? sharePostId.slice(2) : sharePostId;
        return (
          <UnifiedShareSheet
            shareUrl={getPostShareUrl(sharePostId)}
            shareText={sharePost?.caption || "Check out this post!"}
            onClose={() => {
              // Log the share so the count actually moves. Channel is "other"
              // because the unified sheet doesn't tell us which target was used;
              // we'll segment in a future improvement.
              (supabase as any).rpc("record_post_share", {
                _post_id: sharePostRawId,
                _source: sharePostSource,
                _channel: "other",
              }).catch(() => { /* fire-and-forget */ });
              setSharePostId(null);
            }}
          />
        );
      })()}

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

      {/* First-visit swipe-up hint — animated chevron + label, dismisses on
          any interaction or after 3.5 s. */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
            className="absolute left-1/2 -translate-x-1/2 z-[55] pointer-events-none flex flex-col items-center gap-2"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 140px)" }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg"
            >
              <ChevronUp className="w-7 h-7 text-white" strokeWidth={2.5} />
            </motion.div>
            <span className="text-white text-xs font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
              Swipe up for more
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation overlaid on top */}
      <ZivoMobileNav />
    </div>
  );
}
