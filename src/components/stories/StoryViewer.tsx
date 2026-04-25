/**
 * StoryViewer — Shared fullscreen story viewer (Facebook/TikTok-class).
 * Used by ChatStories, ProfileStories, and FeedStoryRing.
 *
 * Behavior:
 * - Auto-progressing 5s image / playback-driven video
 * - Tap left/right to navigate, hold to pause, swipe down to close
 * - Like, comment, send actions (right-side stack)
 * - Owner: viewers list + delete
 * - Records views in story_views; comments in story_comments
 */
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  invalidateAllStoryCaches,
  collectStoryStorageKeys,
  sweepStoryStoragePrefix,
  STORIES_BUCKET,
} from "@/lib/storiesCache";
import StoryForwardSheet from "@/components/stories/StoryForwardSheet";
import X from "lucide-react/dist/esm/icons/x";
import Eye from "lucide-react/dist/esm/icons/eye";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Heart from "lucide-react/dist/esm/icons/heart";
import Send from "lucide-react/dist/esm/icons/send";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Pause from "lucide-react/dist/esm/icons/pause";
import Play from "lucide-react/dist/esm/icons/play";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";
import Music from "lucide-react/dist/esm/icons/music";
import BarChart2 from "lucide-react/dist/esm/icons/bar-chart-2";
import Facebook from "lucide-react/dist/esm/icons/facebook";
import AtSign from "lucide-react/dist/esm/icons/at-sign";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import Download from "lucide-react/dist/esm/icons/download";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import { getPublicOrigin } from "@/lib/getPublicOrigin";

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption?: string;
  audioUrl?: string;
  createdAt: string;
  viewsCount: number;
}

export interface StoryGroup {
  userId: string;
  userName: string;
  avatarUrl?: string;
  stories: StoryItem[];
}

const STORY_DURATION = 5000;

export interface StoryCloseMeta {
  story_id: string;
  segment_index: number;
  total_segments: number;
  completed: boolean;
}

interface Props {
  groups: StoryGroup[];
  startGroupIndex: number;
  startStoryIndex?: number;
  onClose: (meta?: StoryCloseMeta) => void;
  onStoryChange?: (storyId: string) => void;
  /** Which carousel opened the viewer — used for share analytics. */
  source?: "profile" | "feed" | "chat" | "shared-link";
}

export default function StoryViewer({
  groups,
  startGroupIndex,
  startStoryIndex = 0,
  onClose,
  onStoryChange,
  source = "feed",
}: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [groupIdx, setGroupIdx] = useState(startGroupIndex);
  const [viewIdx, setViewIdx] = useState(startStoryIndex);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [muted, setMuted] = useState(true);
  const [reactionBurst, setReactionBurst] = useState<string | null>(null);
  const [showForward, setShowForward] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showMention, setShowMention] = useState(false);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync audio element with current story / pause state / mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (paused || showViewers || showComments) {
      audio.pause();
    } else {
      audio.muted = muted;
      audio.play().catch(() => {/* autoplay blocked; user can unmute */});
    }
  }, [paused, showViewers, showComments, muted]);

  // While the fullscreen viewer is mounted, flag the document so the bottom
  // mobile nav (and any other UI keyed on this attribute) hides itself —
  // belt-and-suspenders alongside the z-[1600] layer. Use useLayoutEffect so
  // the flag is set on the SAME paint as the opaque overlay appears, leaving
  // no frame where the underlying nav is visible behind the entrance animation.
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    document.body.setAttribute("data-story-open", "true");
    return () => {
      document.body.removeAttribute("data-story-open");
    };
  }, []);

  const viewingGroup = groups[groupIdx] ?? null;
  const currentStory = viewingGroup?.stories[viewIdx] ?? null;
  const isOwner = viewingGroup?.userId === user?.id;

  // ---- Viewers (owner only) ----
  const { data: viewers = [] } = useQuery({
    queryKey: ["story-viewers", currentStory?.id],
    enabled: !!currentStory && isOwner,
    queryFn: async () => {
      const { data } = await supabase
        .from("story_views" as any)
        .select("viewer_id, viewed_at")
        .eq("story_id", currentStory!.id)
        .order("viewed_at", { ascending: false });
      if (!data || data.length === 0) return [];
      // Dedupe by viewer_id so React list keys stay unique
      const seen = new Set<string>();
      const uniqueViews = (data as any[]).filter((v: any) => {
        if (seen.has(v.viewer_id)) return false;
        seen.add(v.viewer_id);
        return true;
      });
      const viewerIds = uniqueViews.map((v: any) => v.viewer_id);
      const { data: profiles } = await supabase
        .from("public_profiles" as any)
        .select("id, full_name, avatar_url")
        .in("id", viewerIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      return uniqueViews.map((v: any) => ({
        ...v,
        name: profileMap.get(v.viewer_id)?.full_name || "User",
        avatar: profileMap.get(v.viewer_id)?.avatar_url,
      }));
    },
  });

  // ---- Comments ----
  const { data: comments = [] } = useQuery({
    queryKey: ["story-comments", currentStory?.id],
    enabled: !!currentStory,
    queryFn: async () => {
      const { data } = await supabase
        .from("story_comments" as any)
        .select("id, user_id, content, created_at")
        .eq("story_id", currentStory!.id)
        .order("created_at", { ascending: true });
      if (!data || data.length === 0) return [];
      // Dedupe comments by id (defensive — duplicates would crash React lists)
      const seenC = new Set<string>();
      const uniqueComments = (data as any[]).filter((c: any) => {
        if (seenC.has(c.id)) return false;
        seenC.add(c.id);
        return true;
      });
      const userIds = [...new Set(uniqueComments.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("public_profiles" as any)
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      return uniqueComments.map((c: any) => ({
        ...c,
        name: profileMap.get(c.user_id)?.full_name || "User",
        avatar: profileMap.get(c.user_id)?.avatar_url,
      }));
    },
  });

  // ---- My reaction on the current story (real persistence) ----
  const { data: myReaction } = useQuery({
    queryKey: ["story-my-reaction", currentStory?.id, user?.id],
    enabled: !!currentStory && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("story_reactions" as any)
        .select("emoji")
        .eq("story_id", currentStory!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data as any)?.emoji ?? null;
    },
  });

  const reactToStory = useMutation({
    mutationFn: async (emoji: string | null) => {
      if (!currentStory || !user) return;
      if (emoji === null) {
        const { error } = await supabase
          .from("story_reactions" as any)
          .delete()
          .eq("story_id", currentStory.id)
          .eq("user_id", user.id);
        if (error) throw error;
        return;
      }
      const { data: existing } = await supabase
        .from("story_reactions" as any)
        .select("id")
        .eq("story_id", currentStory.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("story_reactions" as any)
          .update({ emoji })
          .eq("id", (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("story_reactions" as any)
          .insert({ story_id: currentStory.id, user_id: user.id, emoji });
        if (error) throw error;
      }
    },
    onSuccess: (_data, emoji) => {
      queryClient.invalidateQueries({
        queryKey: ["story-my-reaction", currentStory?.id, user?.id],
      });
      if (emoji) {
        setReactionBurst(emoji);
        window.setTimeout(() => setReactionBurst(null), 800);
      }
    },
    onError: (err: any) => toast.error(err?.message || "Could not save reaction"),
  });

  const toggleLike = useCallback(() => {
    if (!user) {
      toast.error("Please sign in");
      return;
    }
    reactToStory.mutate(myReaction === "❤️" ? null : "❤️");
  }, [myReaction, reactToStory, user]);


  useEffect(() => {
    if (!currentStory || !user || isOwner) return;
    void supabase
      .from("story_views" as any)
      .upsert({ story_id: currentStory.id, viewer_id: user.id }, { onConflict: "story_id,viewer_id" })
      .then(({ error }) => {
        if (!error) {
          queryClient.invalidateQueries({ queryKey: ["my-story-views", user.id], exact: true });
          queryClient.invalidateQueries({ queryKey: ["profile-story-rings", user.id], exact: true });
          queryClient.invalidateQueries({ queryKey: ["feed-story-users"], exact: true });
        }
      });
  }, [currentStory?.id, user?.id, isOwner, queryClient]);

  // ---- Sync URL deep-link with currently visible story ----
  useEffect(() => {
    if (currentStory && onStoryChange) onStoryChange(currentStory.id);
  }, [currentStory?.id, onStoryChange]);

  // ---- Share story (opens Instagram-style "Send to" sheet) ----
  const handleShare = useCallback(() => {
    if (!currentStory) return;
    setPaused(true);
    setShowForward(true);
  }, [currentStory]);

  // ---- Post comment ----
  const postComment = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("story_comments" as any).insert({
        story_id: currentStory!.id,
        user_id: user!.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-comments", currentStory?.id] });
      setCommentText("");
    },
    onError: (err: any) => {
      if (err?.message?.includes("violates row-level security")) {
        toast.error("Only friends can comment on this story");
      } else {
        toast.error("Failed to post comment");
      }
    },
  });

  // ---- Delete (owner) — also removes media + audio from storage ----
  const deleteStory = useMutation({
    mutationFn: async (storyId: string) => {
      // 1) Re-fetch the row to get the latest URLs (and confirm ownership exists).
      const { data: latest } = await supabase
        .from("stories" as any)
        .select("id, user_id, media_url, audio_url")
        .eq("id", storyId)
        .maybeSingle();

      const cached = viewingGroup?.stories.find((s) => s.id === storyId);
      const ownerId = (latest as any)?.user_id ?? viewingGroup?.userId ?? user?.id;

      // 2) Collect every known storage key from cache + fresh row.
      const keys = Array.from(
        new Set([
          ...collectStoryStorageKeys(cached),
          ...collectStoryStorageKeys(latest as any),
        ])
      );

      // 3) Delete the DB row first so RLS-protected files become deletable.
      const { error } = await supabase.from("stories" as any).delete().eq("id", storyId);
      if (error) throw error;

      // 4) Best-effort URL-key removal.
      if (keys.length > 0) {
        await supabase.storage.from(STORIES_BUCKET).remove(keys).catch(() => {});
      }

      // 5) Belt-and-suspenders: sweep any orphans under <user>/<story>/.
      if (ownerId) {
        await sweepStoryStoragePrefix(ownerId, storyId);
      }
    },
    onSuccess: () => {
      invalidateAllStoryCaches(queryClient, user?.id);
      toast.success("Story deleted");
    },
    onError: (err: any) => toast.error(err?.message || "Could not delete story"),
  });

  // ---- Auto-progress ----
  const startTimer = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    startTimeRef.current = performance.now() - elapsedRef.current;
    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) return;
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    elapsedRef.current = performance.now() - startTimeRef.current;
  }, []);

  const resetAndStart = useCallback(() => {
    elapsedRef.current = 0;
    setProgress(0);
    setReactionBurst(null);
    startTimer();
  }, [startTimer]);

  // Close handler that always reports current segment metadata so the
  // story_deeplink_close analytics event can attribute drop-off accurately.
  const closeWithMeta = useCallback(
    (completedOverride?: boolean) => {
      if (!currentStory || !viewingGroup) {
        onClose();
        return;
      }
      const total = viewingGroup.stories.length;
      const completed =
        completedOverride !== undefined
          ? completedOverride
          : viewIdx === total - 1 && progress >= 1;
      onClose({
        story_id: currentStory.id,
        segment_index: viewIdx,
        total_segments: total,
        completed,
      });
    },
    [currentStory, viewingGroup, viewIdx, progress, onClose]
  );

  const goNext = useCallback(() => {
    if (!viewingGroup) return;
    if (viewIdx < viewingGroup.stories.length - 1) {
      setViewIdx((i) => i + 1);
      elapsedRef.current = 0;
    } else {
      const nextG = groupIdx + 1;
      if (nextG < groups.length) {
        setGroupIdx(nextG);
        setViewIdx(0);
        elapsedRef.current = 0;
      } else {
        closeWithMeta(true); // reached end of all stories
      }
    }
  }, [viewingGroup, viewIdx, groupIdx, groups.length, closeWithMeta]);

  const goPrev = useCallback(() => {
    if (viewIdx > 0) {
      setViewIdx((i) => i - 1);
      elapsedRef.current = 0;
    } else {
      const prevG = groupIdx - 1;
      if (prevG >= 0) {
        setGroupIdx(prevG);
        setViewIdx(groups[prevG].stories.length - 1);
        elapsedRef.current = 0;
      }
    }
  }, [viewIdx, groupIdx, groups]);

  useEffect(() => {
    if (progress >= 1 && viewingGroup) goNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress >= 1]);

  useEffect(() => {
    if (viewingGroup && !paused) resetAndStart();
    else stopTimer();
    return () => stopTimer();
  }, [viewingGroup, viewIdx, groupIdx, paused, resetAndStart, stopTimer]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWithMeta();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeWithMeta, goNext, goPrev]);

  // Swipe-down to close
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) closeWithMeta();
  };

  if (!viewingGroup || !currentStory) return null;

  // SSR-safe portal guard — prevents runtime errors during prerender/build
  // pipelines that import this component without a real DOM.
  if (typeof document === "undefined" || !document.body) return null;

  // Portal to <body> so transformed ancestors (e.g. Profile's ParallaxSection)
  // can't trap our `position: fixed` viewer inside their bounding box.
  // Outer shell is opaque from frame 0 (no animation) so the underlying
  // Profile/Feed/Chat UI is fully covered AND non-interactive the instant
  // the viewer mounts — even before Framer's first animation tick.
  return createPortal(
    <div
      data-testid="story-viewer"
      className="fixed inset-0 z-[1600] bg-black pointer-events-auto touch-none overscroll-contain"
    >
    <AnimatePresence>
      <motion.div
        key={currentStory.id}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 bg-black"
      >
        {/* Media */}
        <div className="absolute inset-0">
          {currentStory.mediaType === "video" ? (
            <video
              key={currentStory.id}
              src={currentStory.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              loop
              onPlay={() => { if (!paused) startTimer(); }}
            />
          ) : (
            <img
              key={currentStory.id}
              src={currentStory.mediaUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        </div>

        {/* Progress bars — ZIVO Aurora gradient */}
        <div className="absolute top-[env(safe-area-inset-top,12px)] left-0 right-0 flex gap-1 px-3 pt-2 z-20">
          {viewingGroup.stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] bg-white/15 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  i === viewIdx
                    ? "bg-gradient-to-r from-[hsl(160_84%_55%)] via-[hsl(174_72%_60%)] to-[hsl(190_85%_65%)] shadow-[0_0_8px_hsl(160_84%_55%/0.7)]"
                    : "bg-white/90"
                )}
                style={{
                  width: i < viewIdx ? "100%" : i === viewIdx ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header — single ZIVO glass capsule */}
        <div data-testid="story-header" className="absolute top-[calc(env(safe-area-inset-top,12px)+20px)] left-0 right-0 flex items-center justify-between px-3 z-20 gap-2">
          <div className="flex items-center gap-2.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/10 ring-1 ring-[hsl(160_84%_55%)/0.25] pl-1 pr-3.5 py-1 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.5)] min-w-0 flex-1 max-w-[68%]">
            <div className="w-9 h-9 rounded-full ring-2 ring-[hsl(160_84%_55%)/0.7] overflow-hidden shrink-0">
              {viewingGroup.avatarUrl ? (
                <img src={viewingGroup.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[hsl(160_84%_45%)] to-[hsl(174_72%_40%)] flex items-center justify-center text-sm font-bold text-white">
                  {viewingGroup.userName.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-bold leading-tight truncate">{viewingGroup.userName}</p>
              <p className="text-white/70 text-[11px] flex items-center gap-1 leading-tight">
                <span className="truncate">
                  {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                </span>
                {currentStory.audioUrl && (
                  <>
                    <span className="opacity-50">·</span>
                    <Music className="w-3 h-3 shrink-0" />
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {currentStory.audioUrl && (
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute" : "Mute"}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
              >
                {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
            )}
            <button
              data-testid="story-pause"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play" : "Pause"}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
            >
              {paused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
            </button>
            <button
              data-testid="story-close"
              onClick={() => closeWithMeta()}
              aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Audio (background music) */}
        {currentStory.audioUrl && (
          <audio
            ref={audioRef}
            key={currentStory.id}
            src={currentStory.audioUrl}
            loop
            autoPlay
            muted={muted}
            playsInline
          />
        )}

        {/* Tap zones */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 z-10" onClick={goPrev} />
        <div className="absolute right-0 top-0 bottom-0 w-2/3 z-10" onClick={goNext} />

        {/* Right-side actions — only for non-owners (owners get the IG-style bottom toolbar) */}
        {!isOwner && (
          <div className="absolute right-4 bottom-[160px] flex flex-col items-center gap-4 z-20">
            <button onClick={toggleLike} className="flex flex-col items-center gap-1" aria-label="Like story">
              <motion.div
                key={myReaction || "none"}
                animate={myReaction === "❤️" ? { scale: [1, 1.3, 1] } : {}}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all",
                  myReaction === "❤️" ? "bg-destructive/80" : "bg-white/10"
                )}
              >
                <Heart className={cn("w-5 h-5 transition-all", myReaction === "❤️" ? "text-white fill-white" : "text-white")} />
              </motion.div>
              <span className="text-white/80 text-[10px] font-medium">Like</span>
            </button>

            <button
              onClick={() => { setPaused(true); setShowComments(true); }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center relative">
                <MessageCircle className="w-5 h-5 text-white" />
                {comments.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {comments.length}
                  </span>
                )}
              </div>
              <span className="text-white/80 text-[10px] font-medium">Comment</span>
            </button>

            <button onClick={handleShare} className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/80 text-[10px] font-medium">Share</span>
            </button>
          </div>
        )}
        {/* Floating reaction burst */}
        <AnimatePresence>
          {reactionBurst && (
            <motion.div
              key={reactionBurst}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -120, scale: 1.6 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute bottom-[200px] left-1/2 -translate-x-1/2 z-30 text-6xl pointer-events-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              {reactionBurst}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom: caption + reactions + reply */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-[env(safe-area-inset-bottom,16px)]">
          {currentStory.caption && (
            <div className="px-5 pb-3">
              <p className="text-white text-sm font-medium drop-shadow-lg leading-relaxed">
                {currentStory.caption}
              </p>
            </div>
          )}

          {!isOwner && (
            <>
              <div className="px-4 pb-2">
                <div className="flex items-center justify-center gap-3">
                  {["❤️", "😂", "😮", "🔥", "😢", "👏"].map((emoji) => {
                    const active = myReaction === emoji;
                    return (
                      <button
                        key={emoji}
                        onClick={() => reactToStory.mutate(active ? null : emoji)}
                        className={cn(
                          "text-2xl transition-transform active:scale-150",
                          active && "drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] scale-125"
                        )}
                        aria-label={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 border border-white/10">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentText.trim()) postComment.mutate(commentText.trim());
                    }}
                    placeholder={`Reply to ${viewingGroup.userName.split(" ")[0]}...`}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/50"
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                  />
                  <button
                    onClick={() => { if (commentText.trim()) postComment.mutate(commentText.trim()); }}
                    disabled={postComment.isPending}
                    aria-label="Send reply"
                  >
                    <Send className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Owner toolbar — Instagram style: Activity · Facebook · Mention · Send · More */}
          {isOwner && (
            <div className="px-2 pb-3 pt-2">
              <div className="flex items-end justify-around">
                <button
                  onClick={() => { setPaused(true); setShowViewers(true); }}
                  className="flex flex-col items-center gap-1 px-2 py-1"
                  aria-label="Activity"
                >
                  <BarChart2 className="w-6 h-6 text-white" strokeWidth={1.8} />
                  <span className="text-white text-[11px] font-medium leading-none">
                    Activity{currentStory.viewsCount ? ` ${currentStory.viewsCount}` : ""}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setPaused(true);
                    const url = `${getPublicOrigin()}/stories/${currentStory.id}`;
                    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    window.open(fbUrl, "_blank", "noopener,noreferrer");
                    setTimeout(() => setPaused(false), 600);
                  }}
                  className="flex flex-col items-center gap-1 px-2 py-1"
                  aria-label="Share to Facebook"
                >
                  <Facebook className="w-6 h-6 text-white" strokeWidth={1.8} />
                  <span className="text-white text-[11px] font-medium leading-none">Facebook</span>
                </button>
                <button
                  onClick={() => { setPaused(true); setShowMention(true); }}
                  className="flex flex-col items-center gap-1 px-2 py-1"
                  aria-label="Mention"
                >
                  <AtSign className="w-6 h-6 text-white" strokeWidth={1.8} />
                  <span className="text-white text-[11px] font-medium leading-none">Mention</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 px-2 py-1"
                  aria-label="Send to"
                >
                  <Send className="w-6 h-6 text-white" strokeWidth={1.8} />
                  <span className="text-white text-[11px] font-medium leading-none">Send</span>
                </button>
                <button
                  onClick={() => { setPaused(true); setShowMore(true); }}
                  className="flex flex-col items-center gap-1 px-2 py-1"
                  aria-label="More"
                >
                  <MoreHorizontal className="w-6 h-6 text-white" strokeWidth={1.8} />
                  <span className="text-white text-[11px] font-medium leading-none">More</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Viewers sheet */}
        <AnimatePresence>
          {showViewers && isOwner && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-30 bg-card/95 backdrop-blur-xl rounded-t-2xl max-h-[60vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Viewers ({viewers.length})</span>
                </div>
                <button onClick={() => { setShowViewers(false); setPaused(false); }} aria-label="Close viewers">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {viewers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No viewers yet</p>
                ) : (
                  viewers.map((v: any) => (
                    <div key={v.viewer_id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {v.avatar ? (
                          <img src={v.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {v.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{v.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(v.viewed_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments sheet */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-30 bg-card/95 backdrop-blur-xl rounded-t-2xl max-h-[65vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Comments ({comments.length})</span>
                </div>
                <button onClick={() => { setShowComments(false); setPaused(false); }} aria-label="Close comments">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No comments yet. Only friends can comment.
                  </p>
                ) : (
                  comments.map((c: any) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {c.avatar ? (
                          <img src={c.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {c.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-foreground">{c.name}</span>
                          <span className="text-[9px] text-muted-foreground">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border/30">
                <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentText.trim()) postComment.mutate(commentText.trim());
                    }}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => { if (commentText.trim()) postComment.mutate(commentText.trim()); }}
                    disabled={postComment.isPending || !commentText.trim()}
                    className="text-primary disabled:opacity-40"
                    aria-label="Send comment"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground text-center mt-1">Only friends can comment</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Owner: "More" action sheet */}
        <AnimatePresence>
          {showMore && isOwner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/60 flex items-end"
              onClick={() => { setShowMore(false); setPaused(false); }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="w-full bg-card rounded-t-2xl p-2 pb-[env(safe-area-inset-bottom,16px)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30 my-2" />
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(currentStory.mediaUrl, { mode: "cors" });
                      const blob = await res.blob();
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = `story-${currentStory.id}.${(currentStory.mediaType === "video" ? "mp4" : "jpg")}`;
                      document.body.appendChild(a); a.click(); a.remove();
                      URL.revokeObjectURL(a.href);
                      toast.success("Saved");
                    } catch { toast.error("Couldn't save"); }
                    setShowMore(false); setPaused(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-left"
                >
                  <Download className="w-5 h-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Save to device</span>
                </button>
                <button
                  onClick={() => {
                    const url = `${getPublicOrigin()}/stories/${currentStory.id}`;
                    if (navigator.share) navigator.share({ url }).catch(() => {});
                    else { navigator.clipboard?.writeText(url); toast.success("Link copied"); }
                    setShowMore(false); setPaused(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-left"
                >
                  <Share2 className="w-5 h-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Share link</span>
                </button>
                <button
                  onClick={() => {
                    if (!currentStory) return;
                    const last = viewingGroup.stories.length <= 1;
                    deleteStory.mutate(currentStory.id);
                    setShowMore(false);
                    if (last) closeWithMeta(); else goNext();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-left"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Delete story</span>
                </button>
                <button
                  onClick={() => { setShowMore(false); setPaused(false); }}
                  className="w-full px-4 py-3 mt-1 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Owner: simple Mention sheet — posts an @mention as a story comment */}
        <AnimatePresence>
          {showMention && isOwner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/60 flex items-end"
              onClick={() => { setShowMention(false); setPaused(false); }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="w-full bg-card rounded-t-2xl p-4 pb-[env(safe-area-inset-bottom,16px)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30 mb-3" />
                <p className="text-sm font-bold text-foreground mb-2">Mention someone</p>
                <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                  <AtSign className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="username"
                    className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <button
                    className="text-primary text-sm font-semibold disabled:opacity-40"
                    disabled={!commentText.trim() || postComment.isPending}
                    onClick={() => {
                      const handle = commentText.trim().replace(/^@/, "");
                      if (handle) postComment.mutate(`@${handle}`);
                      setShowMention(false); setPaused(false);
                    }}
                  >
                    Send
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Instagram-style "Send to" sheet */}
      {currentStory && (
        <StoryForwardSheet
          open={showForward}
          onClose={() => {
            setShowForward(false);
            setPaused(false);
          }}
          storyId={currentStory.id}
          storyOwnerName={viewingGroup?.userName}
          source={source}
        />
      )}
    </AnimatePresence>
    </div>,
    document.body
  );
}
