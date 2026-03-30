import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, Play, Radio, FileText, ImageIcon, Heart, MessageCircle, Eye, X, Users, Mic, MicOff, Camera, SwitchCamera, Share2, Send, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const tabs = [
  { id: "posts", label: "Posts", icon: Grid3X3 },
  { id: "videos", label: "Videos", icon: Play },
  { id: "live", label: "Live", icon: Radio },
  { id: "status", label: "Status", icon: FileText },
] as const;

type TabId = (typeof tabs)[number]["id"];

// Demo data
const demoPosts = [
  { id: 1, type: "image", likes: 24, comments: 3 },
  { id: 2, type: "image", likes: 18, comments: 1 },
  { id: 3, type: "image", likes: 42, comments: 7 },
  { id: 4, type: "image", likes: 9, comments: 0 },
  { id: 5, type: "image", likes: 31, comments: 5 },
  { id: 6, type: "image", likes: 15, comments: 2 },
];

export default function ProfileContentTabs({ userId }: { userId?: string }) {
  const [activeTab, setActiveTab] = useState<TabId>("posts");

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex bg-muted/30 rounded-2xl p-1 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 relative flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-[11px] font-bold transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="profile-tab-bg"
                  className="absolute inset-0 bg-card rounded-xl shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">
                <Icon className="w-4 h-4" />
              </span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "posts" && <PostsGrid />}
          {activeTab === "videos" && <VideosGrid />}
          {activeTab === "live" && <LiveSection />}
          {activeTab === "status" && <StatusSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PostsGrid() {
  return (
    <div>
      {demoPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
          {demoPosts.map((post) => (
            <motion.div
              key={post.id}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square bg-muted/50 group cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <span className="flex items-center gap-1 text-white text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 fill-white" /> {post.likes}
                </span>
                <span className="flex items-center gap-1 text-white text-xs font-bold">
                  <MessageCircle className="w-3.5 h-3.5 fill-white" /> {post.comments}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Grid3X3} text="No posts yet" sub="Share your first photo or moment" />
      )}
    </div>
  );
}

function VideosGrid() {
  return (
    <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
      {[1, 2, 3].map((id) => (
        <motion.div
          key={id}
          whileTap={{ scale: 0.95 }}
          className="relative aspect-[9/16] bg-muted/50 cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Play className="w-8 h-8 text-muted-foreground/40 fill-muted-foreground/20" />
          </div>
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-white/90 text-[10px] font-bold bg-black/40 rounded-full px-1.5 py-0.5">
            <Eye className="w-3 h-3" /> 0
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-10 h-10 text-white fill-white/80" />
          </div>
        </motion.div>
      ))}
      {[1, 2, 3].length === 0 && (
        <div className="col-span-3">
          <EmptyState icon={Play} text="No videos yet" sub="Share your first video" />
        </div>
      )}
    </div>
  );
}

function LiveSection() {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [duration, setDuration] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const heartIdRef = useRef(0);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      stream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
    } catch (err) {
      toast.error("Camera access denied. Please allow camera permissions.");
      setIsLive(false);
    }
  }, [isMuted]);

  const goLive = async () => {
    if (!user?.id) { toast.error("Please log in first"); return; }
    setIsLive(true);
    setDuration(0);
    setViewerCount(0);
    setLikeCount(0);
    setComments([]);
    setHasLiked(false);
    await startCamera(facingMode);

    // Create live stream record
    const { data, error } = await supabase
      .from("live_streams" as any)
      .insert({ user_id: user.id, status: "live" } as any)
      .select("id")
      .single();
    if (error) { toast.error("Failed to start stream"); setIsLive(false); return; }
    const sid = (data as any).id;
    setStreamId(sid);

    // Start duration timer
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    toast.success("You're LIVE! 🔴");
  };

  const endLive = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamId) {
      await supabase.from("live_streams" as any).update({ status: "ended", ended_at: new Date().toISOString() } as any).eq("id", streamId);
    }
    setIsLive(false);
    setDuration(0);
    setViewerCount(0);
    setLikeCount(0);
    setStreamId(null);
    setComments([]);
    toast.info("Live ended");
  };

  // Subscribe to realtime comments, viewers, likes
  useEffect(() => {
    if (!streamId) return;

    // Load existing comments
    supabase.from("live_comments" as any).select("id, user_id, content, created_at").eq("stream_id", streamId).order("created_at", { ascending: true }).then(({ data }) => {
      if (data) setComments(data as any[]);
    });

    // Realtime comments
    const commentChannel = supabase.channel(`live-comments-${streamId}`)
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "live_comments", filter: `stream_id=eq.${streamId}` }, (payload: any) => {
        setComments((prev) => [...prev.slice(-50), payload.new]);
      })
      .subscribe();

    // Realtime viewer count
    const viewerChannel = supabase.channel(`live-viewers-${streamId}`)
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "live_viewers", filter: `stream_id=eq.${streamId}` }, () => {
        supabase.from("live_viewers" as any).select("*", { count: "exact", head: true }).eq("stream_id", streamId).then(({ count }) => {
          setViewerCount(count || 0);
        });
      })
      .subscribe();

    // Realtime likes
    const likeChannel = supabase.channel(`live-likes-${streamId}`)
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "live_likes", filter: `stream_id=eq.${streamId}` }, () => {
        supabase.from("live_likes" as any).select("*", { count: "exact", head: true }).eq("stream_id", streamId).then(({ count }) => {
          setLikeCount(count || 0);
        });
        // Show floating heart
        setFloatingHearts((prev) => [...prev, { id: heartIdRef.current++, x: 20 + Math.random() * 40 }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(viewerChannel);
      supabase.removeChannel(likeChannel);
    };
  }, [streamId]);

  // Auto-scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Remove floating hearts after animation
  useEffect(() => {
    if (floatingHearts.length === 0) return;
    const t = setTimeout(() => setFloatingHearts((prev) => prev.slice(1)), 2000);
    return () => clearTimeout(t);
  }, [floatingHearts]);

  const postComment = async () => {
    if (!commentText.trim() || !streamId || !user?.id) return;
    const text = commentText.trim();
    setCommentText("");
    await supabase.from("live_comments" as any).insert({ stream_id: streamId, user_id: user.id, content: text } as any);
  };

  const toggleLike = async () => {
    if (!streamId || !user?.id) return;
    if (hasLiked) {
      await supabase.from("live_likes" as any).delete().eq("stream_id", streamId).eq("user_id", user.id);
      setHasLiked(false);
    } else {
      await supabase.from("live_likes" as any).insert({ stream_id: streamId, user_id: user.id } as any);
      setHasLiked(true);
      // Local floating heart
      setFloatingHearts((prev) => [...prev, { id: heartIdRef.current++, x: 30 + Math.random() * 30 }]);
    }
  };

  const toggleMute = () => {
    setIsMuted((m) => {
      const newMuted = !m;
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !newMuted));
      return newMuted;
    });
  };

  const flipCamera = async () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    if (isLive) await startCamera(newFacing);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isLive) {
    return (
      <div className="rounded-2xl bg-card border border-border/30 p-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto relative">
          <Radio className="w-8 h-8 text-destructive" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">Go Live</p>
          <p className="text-xs text-muted-foreground mt-1">Start a live video and connect with your followers in real-time</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={goLive} className="bg-destructive text-destructive-foreground rounded-xl px-8 py-3 text-sm font-bold shadow-lg shadow-destructive/25">
          <Camera className="w-4 h-4 inline-block mr-2" /> Start Live Video
        </motion.button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-black relative" style={{ aspectRatio: "9/16", maxHeight: "70vh" }}>
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />

      {/* Floating hearts */}
      <AnimatePresence>
        {floatingHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, y: 0, scale: 0.5, x: `${h.x}%` }}
            animate={{ opacity: 0, y: -200, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-32 z-20 pointer-events-none"
          >
            <Heart className="w-6 h-6 text-destructive fill-destructive" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Top overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="bg-destructive text-destructive-foreground text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-white" /> LIVE
          </motion.div>
          <span className="text-white/90 text-xs font-bold">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-white text-[11px] font-bold">{viewerCount}</span>
          </div>
        </div>
      </div>

      {/* Right-side controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={flipCamera} className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
          <SwitchCamera className="w-5 h-5 text-white" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMute} className={cn("w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center", isMuted ? "bg-destructive/60" : "bg-white/15")}>
          {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
        </motion.button>
        {/* Like button */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleLike} className={cn("w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center relative", hasLiked ? "bg-destructive/60" : "bg-white/15")}>
          <Heart className={cn("w-5 h-5 text-white", hasLiked && "fill-white")} />
          {likeCount > 0 && (
            <span className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">{likeCount}</span>
          )}
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center" onClick={() => toast.info("Share link copied!")}>
          <Share2 className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Bottom: comments + input + end button */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 px-3 pb-3">
        {/* Real comments feed */}
        <div className="space-y-1.5 mb-3 max-h-[140px] overflow-y-auto scrollbar-hide">
          {comments.map((c: any) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/40 flex-shrink-0 flex items-center justify-center text-[9px] text-white font-bold">
                {(c.user_id || "U").toString().charAt(0).toUpperCase()}
              </div>
              <p className="text-white/90 text-xs leading-relaxed">{c.content}</p>
            </motion.div>
          ))}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment input */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") postComment(); }}
              placeholder="Say something..."
              className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-white/40"
            />
            <button onClick={postComment} disabled={!commentText.trim()}>
              <Send className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={endLive} className="w-full bg-destructive/90 text-destructive-foreground rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> End Live
        </motion.button>
      </div>
    </div>
  );
}

function StatusSection() {
  const statuses = [
    { id: 1, text: "Feeling great today! ☀️", time: "2h ago", emoji: "😊" },
    { id: 2, text: "On the road again 🚗", time: "5h ago", emoji: "🚗" },
    { id: 3, text: "Coffee time ☕", time: "1d ago", emoji: "☕" },
  ];

  return (
    <div className="space-y-2">
      {statuses.map((status) => (
        <motion.div
          key={status.id}
          whileTap={{ scale: 0.98 }}
          className="bg-card rounded-xl p-3 border border-border/30 flex items-start gap-3"
        >
          <span className="text-2xl">{status.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{status.text}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{status.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }: { icon: any; text: string; sub: string }) {
  return (
    <div className="py-12 text-center space-y-2">
      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-bold text-muted-foreground">{text}</p>
      <p className="text-xs text-muted-foreground/70">{sub}</p>
    </div>
  );
}
