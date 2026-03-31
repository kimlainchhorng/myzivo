/**
 * ChatStories — TikTok/Facebook-style ephemeral stories
 * Full-screen immersive viewer with auto-progress, swipe navigation
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X, Eye, Trash2, Camera, Heart, Send, ChevronUp, MessageCircle, Pause, Play, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption?: string;
  createdAt: string;
  viewsCount: number;
}

interface StoryGroup {
  userId: string;
  userName: string;
  avatarUrl?: string;
  stories: StoryItem[];
}

const STORY_DURATION = 5000; // 5s per image story

export default function ChatStories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewingGroup, setViewingGroup] = useState<StoryGroup | null>(null);
  const [viewIdx, setViewIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [allGroups, setAllGroups] = useState<StoryGroup[]>([]);
  const [groupIdx, setGroupIdx] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const elapsedRef = useRef(0);

  const { data: storyGroups = [] } = useQuery({
    queryKey: ["user-stories"],
    enabled: !!user,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_stories" as any)
        .select("id, user_id, media_url, media_type, caption, created_at, expires_at, views_count")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (!data || data.length === 0) return [];

      const userIds = [...new Set((data as any[]).map((s: any) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      const groups = new Map<string, StoryGroup>();
      for (const s of data as any[]) {
        if (!groups.has(s.user_id)) {
          const profile = profileMap.get(s.user_id);
          groups.set(s.user_id, {
            userId: s.user_id,
            userName: profile?.full_name || "User",
            avatarUrl: profile?.avatar_url,
            stories: [],
          });
        }
        groups.get(s.user_id)!.stories.push({
          id: s.id,
          mediaUrl: s.media_url,
          mediaType: s.media_type,
          caption: s.caption,
          createdAt: s.created_at,
          viewsCount: s.views_count ?? 0,
        });
      }

      const result = Array.from(groups.values());
      const myIdx = result.findIndex((g) => g.userId === user?.id);
      if (myIdx > 0) {
        const [mine] = result.splice(myIdx, 1);
        result.unshift(mine);
      }
      return result;
    },
  });

  const deleteStory = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase.from("user_stories" as any).delete().eq("id", storyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      toast.success("Story deleted");
    },
  });

  // Fetch viewers for current story (owner only)
  const currentStory = viewingGroup?.stories[viewIdx];
  const isOwner = viewingGroup?.userId === user?.id;

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
      const viewerIds = (data as any[]).map((v: any) => v.viewer_id);
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", viewerIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      return (data as any[]).map((v: any) => ({
        ...v,
        name: profileMap.get(v.viewer_id)?.full_name || "User",
        avatar: profileMap.get(v.viewer_id)?.avatar_url,
      }));
    },
  });

  // Fetch comments for current story
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
      const userIds = [...new Set((data as any[]).map((c: any) => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      return (data as any[]).map((c: any) => ({
        ...c,
        name: profileMap.get(c.user_id)?.full_name || "User",
        avatar: profileMap.get(c.user_id)?.avatar_url,
      }));
    },
  });

  // Record view when opening someone else's story
  useEffect(() => {
    if (!currentStory || !user || isOwner) return;
    supabase.from("story_views" as any).upsert(
      { story_id: currentStory.id, viewer_id: user.id },
      { onConflict: "story_id,viewer_id" }
    ).then();
  }, [currentStory?.id, user?.id, isOwner]);

  // Post comment
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
      if (err.message?.includes("violates row-level security")) {
        toast.error("Only friends can comment on this story");
      } else {
        toast.error("Failed to post comment");
      }
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(isVideo ? "Video must be under 20MB" : "Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-stories")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("user-stories").getPublicUrl(path);

      const { error: insertError } = await supabase.from("user_stories" as any).insert({
        user_id: user.id,
        media_url: urlData.publicUrl,
        media_type: isVideo ? "video" : "image",
      });
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      toast.success("Story added!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload story");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const myStories = storyGroups.find((g) => g.userId === user?.id);
  const hasMyStory = !!myStories && myStories.stories.length > 0;

  // --- Auto-progress timer ---
  const startTimer = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    startTimeRef.current = performance.now() - elapsedRef.current;

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        // Auto-advance handled by effect watching progress
        return;
      }
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
    setLiked(false);
    startTimer();
  }, [startTimer]);

  // Auto-advance when progress completes
  useEffect(() => {
    if (progress >= 1 && viewingGroup) {
      goNext();
    }
  }, [progress >= 1]);

  // Simplified navigation
  const openViewer = (group: StoryGroup, groups?: StoryGroup[]) => {
    const g = groups || storyGroups;
    setAllGroups(g);
    setGroupIdx(g.findIndex((gr) => gr.userId === group.userId));
    setViewingGroup(group);
    setViewIdx(0);
    setPaused(false);
    elapsedRef.current = 0;
  };

  const goNext = () => {
    if (!viewingGroup) return;
    if (viewIdx < viewingGroup.stories.length - 1) {
      setViewIdx((i) => i + 1);
      elapsedRef.current = 0;
    } else {
      // Next user
      const nextGIdx = groupIdx + 1;
      if (nextGIdx < allGroups.length) {
        setGroupIdx(nextGIdx);
        setViewingGroup(allGroups[nextGIdx]);
        setViewIdx(0);
        elapsedRef.current = 0;
      } else {
        setViewingGroup(null);
      }
    }
  };

  const goPrev = () => {
    if (viewIdx > 0) {
      setViewIdx((i) => i - 1);
      elapsedRef.current = 0;
    } else {
      // Previous user
      const prevGIdx = groupIdx - 1;
      if (prevGIdx >= 0) {
        setGroupIdx(prevGIdx);
        setViewingGroup(allGroups[prevGIdx]);
        setViewIdx(allGroups[prevGIdx].stories.length - 1);
        elapsedRef.current = 0;
      }
    }
  };

  // Start/stop timer on viewer state changes
  useEffect(() => {
    if (viewingGroup && !paused) {
      resetAndStart();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [viewingGroup, viewIdx, paused]);


  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Stories Row */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {/* Your Story */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="relative w-[60px] h-[60px]">
              <button
                onClick={() => {
                  if (hasMyStory) {
                    openViewer(myStories!);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={uploading}
                className="w-full h-full rounded-full overflow-hidden"
              >
                <div className={cn(
                  "w-full h-full rounded-full border-2 flex items-center justify-center overflow-hidden",
                  hasMyStory
                    ? "border-primary bg-gradient-to-br from-primary/20 to-accent/20"
                    : "border-dashed border-muted-foreground/30"
                )}>
                  {myStories?.avatarUrl ? (
                    <img src={myStories.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5 text-muted-foreground/50" />
                  )}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background z-10"
              >
                {uploading ? (
                  <div className="w-2.5 h-2.5 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-3 h-3 text-primary-foreground" />
                )}
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {uploading ? "Uploading..." : "Your story"}
            </span>
          </div>

          {/* Other Users */}
          {storyGroups
            .filter((g) => g.userId !== user?.id)
            .map((group) => (
              <button
                key={group.userId}
                onClick={() => openViewer(group)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-br from-primary via-accent to-primary">
                  <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted">
                    {group.avatarUrl ? (
                      <img src={group.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {group.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-foreground font-medium max-w-[60px] truncate">
                  {group.userName.split(" ")[0]}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* ===== FULLSCREEN TikTok/FB STORY VIEWER ===== */}
      <AnimatePresence>
        {viewingGroup && currentStory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            {/* Full-bleed media background */}
            <div className="absolute inset-0">
              {currentStory.mediaType === "video" ? (
                <video
                  key={currentStory.id}
                  src={currentStory.mediaUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  loop
                  muted={false}
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
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
            </div>

            {/* Progress bars */}
            <div className="absolute top-[env(safe-area-inset-top,12px)] left-0 right-0 flex gap-1 px-3 pt-2 z-20">
              {viewingGroup.stories.map((_, i) => (
                <div key={i} className="flex-1 h-[3px] bg-white/25 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    style={{
                      width: i < viewIdx ? "100%" : i === viewIdx ? `${progress * 100}%` : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-[calc(env(safe-area-inset-top,12px)+20px)] left-0 right-0 flex items-center justify-between px-4 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full ring-2 ring-white/40 overflow-hidden">
                  {viewingGroup.avatarUrl ? (
                    <img src={viewingGroup.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                      {viewingGroup.userName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-bold drop-shadow-lg">{viewingGroup.userName}</p>
                  <p className="text-white/70 text-[11px] drop-shadow">
                    {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                >
                  {paused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={() => setViewingGroup(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Tap zones for prev/next */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
              onClick={goPrev}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-2/3 z-10"
              onClick={goNext}
            />

            {/* Right-side TikTok-style action buttons */}
            <div className="absolute right-4 bottom-[140px] flex flex-col items-center gap-5 z-20">
              <button
                onClick={() => setLiked((l) => !l)}
                className="flex flex-col items-center gap-1"
              >
                <div className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all",
                  liked ? "bg-destructive/80" : "bg-white/10"
                )}>
                  <Heart className={cn("w-5 h-5 transition-all", liked ? "text-white fill-white" : "text-white")} />
                </div>
                <span className="text-white/80 text-[10px] font-medium">Like</span>
              </button>

              {/* Comments button */}
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

              <button className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80 text-[10px] font-medium">Send</span>
              </button>

              {isOwner && (
                <>
                  {/* Views button - owner only */}
                  <button
                    onClick={() => { setPaused(true); setShowViewers(true); }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/80 text-[10px] font-medium">{currentStory?.viewsCount || 0}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!currentStory) return;
                      deleteStory.mutate(currentStory.id);
                      if (viewingGroup!.stories.length <= 1) {
                        setViewingGroup(null);
                      } else {
                        goNext();
                      }
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/80 text-[10px] font-medium">Delete</span>
                  </button>
                </>
              )}
            </div>

            {/* Bottom caption + comment input */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pb-[env(safe-area-inset-bottom,16px)]">
              {currentStory?.caption && (
                <div className="px-5 pb-3">
                  <p className="text-white text-sm font-medium drop-shadow-lg leading-relaxed">
                    {currentStory.caption}
                  </p>
                </div>
              )}

              {/* Comment input bar */}
              {!isOwner && (
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 border border-white/10">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && commentText.trim()) {
                          postComment.mutate(commentText.trim());
                        }
                      }}
                      placeholder={`Reply to ${viewingGroup.userName.split(" ")[0]}...`}
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/50"
                      onFocus={() => setPaused(true)}
                      onBlur={() => setPaused(false)}
                    />
                    <button
                      onClick={() => { if (commentText.trim()) postComment.mutate(commentText.trim()); }}
                      disabled={postComment.isPending}
                    >
                      <Send className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ===== VIEWERS BOTTOM SHEET (owner only) ===== */}
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
                    <button onClick={() => { setShowViewers(false); setPaused(false); }}>
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

            {/* ===== COMMENTS BOTTOM SHEET ===== */}
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
                    <button onClick={() => { setShowComments(false); setPaused(false); }}>
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Only friends can comment.</p>
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
                  {/* Comment input inside sheet */}
                  <div className="p-3 border-t border-border/30">
                    <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && commentText.trim()) {
                            postComment.mutate(commentText.trim());
                          }
                        }}
                        placeholder="Add a comment..."
                        className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={() => { if (commentText.trim()) postComment.mutate(commentText.trim()); }}
                        disabled={postComment.isPending || !commentText.trim()}
                        className="text-primary disabled:opacity-40"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[9px] text-muted-foreground text-center mt-1">Only friends can comment</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
