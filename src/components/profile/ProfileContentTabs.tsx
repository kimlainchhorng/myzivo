import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Heart, MessageCircle, Eye, X, SwitchCamera, Mic, MicOff, Sparkles,
  Share2, Play, Radio, ChevronDown, Globe, Users, Lock,
  MapPin, Image, Film, Grid3X3, Clapperboard, Camera,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type FeedItem = {
  id: string;
  type: "photo" | "reel";
  likes: number;
  comments: number;
  caption: string;
  time: string;
  url: string;
  filterCss?: string;
  views?: number;
  user: { name: string; avatar: string };
};

type NewPostPayload = {
  type: "photo" | "reel";
  caption: string;
  url: string;
  filterCss: string;
  file?: File | null;
};

const LOCAL_POSTS_KEY = "zivo_social_posts_v1";

type UserPostRow = {
  id: string;
  user_id: string;
  media_type: "photo" | "reel";
  media_url: string;
  caption: string | null;
  filter_css: string | null;
  likes_count: number | null;
  comments_count: number | null;
  views_count: number | null;
  created_at: string;
  is_published: boolean;
};

const demoFeed: FeedItem[] = [
  { id: "p1", type: "photo", likes: 24, comments: 3, caption: "Beach vibes 🏖️", time: "2h", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop", user: { name: "Sarah M.", avatar: "https://i.pravatar.cc/100?img=1" } },
  { id: "p2", type: "photo", likes: 18, comments: 1, caption: "City lights", time: "5h", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=400&fit=crop", user: { name: "Alex K.", avatar: "https://i.pravatar.cc/100?img=2" } },
  { id: "v1", type: "reel", likes: 42, comments: 7, caption: "Road trip! 🚗", time: "1d", views: 1200, url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p3", type: "photo", likes: 31, comments: 5, caption: "Morning coffee", time: "2d", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "v2", type: "reel", likes: 89, comments: 12, caption: "Sunset vibes 🌅", time: "3d", views: 3400, url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p4", type: "photo", likes: 15, comments: 2, caption: "Sunset 🌅", time: "3d", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "v3", type: "reel", likes: 28, comments: 4, caption: "Mountain hike", time: "4d", views: 890, url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p5", type: "photo", likes: 20, comments: 3, caption: "Travel goals ✈️", time: "5d", url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p6", type: "photo", likes: 12, comments: 1, caption: "Paradise 🌴", time: "1w", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
];

type TabFilter = "all" | "photo" | "reel";

const TABS: { id: TabFilter; label: string; icon: typeof Grid3X3 }[] = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "photo", label: "Photos", icon: Image },
  { id: "reel", label: "Reels", icon: Clapperboard },
];

export default function ProfileContentTabs({ userId }: { userId?: string }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [showComposer, setShowComposer] = useState(false);
  const [composerType, setComposerType] = useState<"photo" | "reel" | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedItem | null>(null);
  const [showLive, setShowLive] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>(demoFeed);

  const filtered = activeTab === "all" ? feed : feed.filter((i) => i.type === activeTab);

  useEffect(() => {
    let alive = true;

    const mergeFeed = (incoming: FeedItem[]) => {
      setFeed((prev) => {
        const deduped = new Map<string, FeedItem>();
        [...incoming, ...prev].forEach((item) => {
          deduped.set(item.id, item);
        });
        return Array.from(deduped.values());
      });
    };

    const loadPersisted = async () => {
      try {
        const localRaw = localStorage.getItem(LOCAL_POSTS_KEY);
        if (localRaw && alive) {
          const localPosts = JSON.parse(localRaw) as FeedItem[];
          if (Array.isArray(localPosts) && localPosts.length > 0) {
            mergeFeed(localPosts);
          }
        }
      } catch {
        // Ignore malformed local cache.
      }

      try {
        const { data } = await (supabase as any)
          .from("user_posts")
          .select("id, user_id, media_type, media_url, caption, filter_css, likes_count, comments_count, views_count, created_at, is_published")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!alive || !data) return;

        const remotePosts: FeedItem[] = (data as UserPostRow[])
          .map((row) => ({
            id: row.id,
            type: row.media_type,
            likes: Number(row.likes_count ?? 0),
            comments: Number(row.comments_count ?? 0),
            caption: row.caption || "",
            time: row.created_at ? "recent" : "now",
            url: row.media_url,
            filterCss: row.filter_css || undefined,
            views: row.media_type === "reel" ? Number(row.views_count ?? 0) : undefined,
            user: {
              name: row.user_id === user?.id ? (user?.email?.split("@")[0] || "You") : "Zivo User",
              avatar: "https://i.pravatar.cc/100?img=3",
            },
          }))
          .filter((item) => Boolean(item.url));

        if (remotePosts.length > 0) mergeFeed(remotePosts);
      } catch {
        // user_posts migration may not be applied yet; local mode still works.
      }
    };

    void loadPersisted();
    return () => {
      alive = false;
    };
  }, []);

  const uploadMediaToSupabase = useCallback(async (file?: File | null) => {
    if (!file) return null;
    const extension = file.name.split(".").pop() || (file.type.startsWith("video/") ? "webm" : "jpg");
    const objectPath = `${user?.id || "guest"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    try {
      const { error } = await supabase.storage.from("user-posts").upload(objectPath, file, {
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) return null;
      const { data } = supabase.storage.from("user-posts").getPublicUrl(objectPath);
      return data.publicUrl;
    } catch {
      return null;
    }
  }, [user?.id]);

  const persistLocalPost = useCallback((post: FeedItem) => {
    if (post.url.startsWith("blob:")) return;
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_POSTS_KEY) || "[]") as FeedItem[];
      const next = [post, ...existing.filter((item) => item.id !== post.id)].slice(0, 100);
      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(next));
    } catch {
      // Local persistence is best effort.
    }
  }, []);

  const handleCreatePost = useCallback(async (payload: NewPostPayload) => {
    const authorName = user?.email?.split("@")[0] || "You";
    const uploadedUrl = await uploadMediaToSupabase(payload.file);
    const mediaUrl = uploadedUrl || payload.url;

    const createdPost: FeedItem = {
      id: `post-${Date.now()}`,
      type: payload.type,
      likes: 0,
      comments: 0,
      caption: payload.caption,
      time: "now",
      url: mediaUrl,
      filterCss: payload.filterCss,
      views: payload.type === "reel" ? 0 : undefined,
      user: { name: authorName, avatar: "https://i.pravatar.cc/100?img=3" },
    };

    setFeed((prev) => [createdPost, ...prev]);
    persistLocalPost(createdPost);

    if (user?.id) {
      try {
        await (supabase as any).from("user_posts").insert({
          user_id: user.id,
          media_type: createdPost.type,
          media_url: createdPost.url,
          caption: createdPost.caption,
          filter_css: createdPost.filterCss || null,
          is_published: true,
        });
      } catch {
        // Ignore remote write issues; local feed already updated.
      }
    }
  }, [persistLocalPost, uploadMediaToSupabase, user?.email, user?.id]);

  return (
    <div className="space-y-3">
      {/* Create Post Bar */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowComposer(true)}
        className="w-full flex items-center gap-3 bg-card rounded-2xl border border-border/30 p-3.5 shadow-sm"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground flex-1 text-left">What's on your mind?</span>
        <div className="flex items-center gap-2">
          <Image className="w-4.5 h-4.5 text-primary/60" />
          <Film className="w-4.5 h-4.5 text-accent-foreground/40" />
          <Radio className="w-4.5 h-4.5 text-destructive/60" />
        </div>
      </motion.button>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Feed Grid */}
      <div className={cn(
        "grid gap-0.5 rounded-2xl overflow-hidden",
        activeTab === "reel" ? "grid-cols-2" : "grid-cols-3"
      )}>
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPost(item)}
            className={cn(
              "relative bg-muted/40 group cursor-pointer overflow-hidden",
              item.type === "reel" ? "aspect-[9/14]" : "aspect-square"
            )}
          >
            <img
              src={item.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: item.filterCss || "none" }}
              loading="lazy"
            />
            {item.type === "reel" && (
              <div className="absolute top-1.5 right-1.5 z-10">
                <Play className="w-4 h-4 text-white fill-white drop-shadow-lg" />
              </div>
            )}
            {item.type === "reel" && item.views && (
              <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5 text-white" />
                <span className="text-[9px] text-white font-bold">{item.views > 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}</span>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="flex items-center gap-0.5 text-white text-[10px] font-bold">
                <Heart className="w-3 h-3 fill-white" /> {item.likes}
              </span>
              <span className="flex items-center gap-0.5 text-white text-[10px] font-bold">
                <MessageCircle className="w-3 h-3 fill-white" /> {item.comments}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Post Detail Viewer */}
      {createPortal(
        <AnimatePresence>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-3 shrink-0">
                <button onClick={() => setSelectedPost(null)} className="text-white/80 p-1">
                  <X className="w-6 h-6" />
                </button>
                <img src={selectedPost.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{selectedPost.user.name}</p>
                  <p className="text-white/50 text-[10px]">{selectedPost.time} ago</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPost.url}
                  alt=""
                  className="w-full h-full object-contain"
                  style={{ filter: selectedPost.filterCss || "none" }}
                />
              </div>

              {/* Bottom bar */}
              <div className="p-4 space-y-3 shrink-0 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white/90 text-sm">{selectedPost.caption}</p>
                <div className="flex items-center gap-5">
                  <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <Heart className="w-6 h-6" />
                    <span className="text-sm font-medium">{selectedPost.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm font-medium">{selectedPost.comments}</span>
                  </button>
                  {selectedPost.views && (
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm">{selectedPost.views > 1000 ? `${(selectedPost.views / 1000).toFixed(1)}k` : selectedPost.views}</span>
                    </span>
                  )}
                  <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors ml-auto">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Composer Modal */}
      {createPortal(
        <AnimatePresence>
          {showComposer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end justify-center"
              onClick={() => { setShowComposer(false); setComposerType(null); }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="w-full max-w-lg bg-card rounded-t-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                {!composerType ? (
                  <div className="p-5 space-y-4">
                    <h3 className="text-lg font-bold text-foreground text-center">Create</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "photo" as const, label: "Photo", icon: Image, color: "text-primary" },
                        { id: "reel" as const, label: "Reel", icon: Clapperboard, color: "text-accent-foreground" },
                        { id: "live" as const, label: "Go Live", icon: Radio, color: "text-destructive" },
                      ].map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <motion.button
                            key={opt.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (opt.id === "live") {
                                setShowComposer(false);
                                setComposerType(null);
                                setShowLive(true);
                              } else {
                                setComposerType(opt.id);
                              }
                            }}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/40 border border-border/20 hover:bg-muted/60 transition-colors"
                          >
                            <div className={cn("w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm", opt.id === "live" && "bg-destructive/10")}>
                              <Icon className={cn("w-6 h-6", opt.color)} />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => { setShowComposer(false); setComposerType(null); }}
                      className="w-full py-3 text-sm font-medium text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <ComposerForm
                    type={composerType}
                    onCreatePost={handleCreatePost}
                    onClose={() => { setShowComposer(false); setComposerType(null); }}
                    onBack={() => setComposerType(null)}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Live Broadcast Overlay */}
      {createPortal(
        <AnimatePresence>
          {showLive && <LiveBroadcast onClose={() => setShowLive(false)} onPublishClip={handleCreatePost} />}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

type Visibility = "everyone" | "friends" | "only_me";
const VISIBILITY_OPTIONS: { id: Visibility; label: string; icon: typeof Globe }[] = [
  { id: "everyone", label: "Everyone", icon: Globe },
  { id: "friends", label: "Friends Only", icon: Users },
  { id: "only_me", label: "Only Me", icon: Lock },
];

const COMPOSER_FILTERS = [
  { name: "Original", css: "none" },
  { name: "Warm", css: "sepia(0.3) saturate(1.35) brightness(1.04)" },
  { name: "Cool", css: "saturate(0.85) hue-rotate(18deg) brightness(1.06)" },
  { name: "Vivid", css: "saturate(1.75) contrast(1.08)" },
  { name: "Glow", css: "brightness(1.18) saturate(1.2) contrast(0.92)" },
  { name: "Noir", css: "grayscale(0.9) contrast(1.35) brightness(0.88)" },
  { name: "Film", css: "sepia(0.18) contrast(1.1) saturate(0.9) brightness(0.96)" },
  { name: "Dreamy", css: "brightness(1.15) saturate(0.72) contrast(0.84)" },
  { name: "Cyber", css: "saturate(2.1) hue-rotate(-26deg) contrast(1.22) brightness(0.92)" },
];

function ComposerForm({
  type,
  onCreatePost,
  onClose,
  onBack,
}: {
  type: "photo" | "reel";
  onCreatePost: (payload: NewPostPayload) => Promise<void>;
  onClose: () => void;
  onBack: () => void;
}) {
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("everyone");
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const [isPosting, setIsPosting] = useState(false);
  const previousPreviewRef = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const nextUrl = URL.createObjectURL(file);
    if (previousPreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previousPreviewRef.current);
    }
    previousPreviewRef.current = nextUrl;
    setMediaPreview(nextUrl);
  };

  useEffect(() => {
    return () => {
      if (previousPreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previousPreviewRef.current);
      }
    };
  }, []);

  const handlePost = async () => {
    if (!mediaPreview) { toast.error("Add media first!"); return; }
    if (isPosting) return;
    setIsPosting(true);
    try {
      await onCreatePost({
        type,
        caption: caption.trim(),
        url: mediaPreview,
        file: selectedFile,
        filterCss: COMPOSER_FILTERS[activeFilter]?.css || "none",
      });
      toast.success("Posted successfully! 🎉");
      onClose();
    } catch {
      toast.error("Could not publish post right now");
    } finally {
      setIsPosting(false);
    }
  };

  const clearMediaPreview = () => {
    if (previousPreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previousPreviewRef.current);
      previousPreviewRef.current = null;
    }
    setSelectedFile(null);
    setMediaPreview(null);
  };

  const isReel = type === "reel";
  const TypeIcon = isReel ? Clapperboard : Image;
  const label = isReel ? "Reel" : "Photo";
  const currentVis = VISIBILITY_OPTIONS.find((v) => v.id === visibility)!;
  const VisIcon = currentVis.icon;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-primary font-medium">← Back</button>
        <h3 className="text-base font-bold text-foreground">New {label}</h3>
        <motion.button whileTap={{ scale: 0.95 }} disabled={isPosting} onClick={handlePost} className="bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full disabled:opacity-70">
          {isPosting ? "Posting..." : "Post"}
        </motion.button>
      </div>

      {mediaPreview ? (
        <div className="relative rounded-2xl overflow-hidden">
          {isReel ? (
            <video
              src={mediaPreview}
              className="w-full max-h-[40vh] object-cover rounded-2xl"
              style={{ filter: COMPOSER_FILTERS[activeFilter]?.css || "none" }}
              controls
            />
          ) : (
            <img
              src={mediaPreview}
              alt=""
              className="w-full max-h-[40vh] object-cover rounded-2xl"
              style={{ filter: COMPOSER_FILTERS[activeFilter]?.css || "none" }}
            />
          )}
            <button onClick={clearMediaPreview} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-2"
        >
          <TypeIcon className="w-8 h-8 text-primary/40" />
          <span className="text-sm text-muted-foreground">Tap to add {label.toLowerCase()}</span>
        </motion.button>
      )}
      <input ref={fileRef} type="file" accept={isReel ? "video/*" : "image/*"} className="hidden" onChange={handleFile} />

      {mediaPreview && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Choose filter style</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {COMPOSER_FILTERS.map((filter, index) => (
              <button
                key={filter.name}
                type="button"
                onClick={() => setActiveFilter(index)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  activeFilter === index
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/30 bg-muted/40 text-muted-foreground"
                )}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption..."
        rows={2}
        className="w-full bg-muted/30 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none border border-border/20 focus:border-primary/30 transition-colors"
      />

      {/* Privacy & extras row */}
      <div className="flex items-center gap-3 text-muted-foreground">
        {/* Visibility picker */}
        <div className="relative">
          <button
            onClick={() => setShowVisibilityPicker(!showVisibilityPicker)}
            className="flex items-center gap-1.5 text-xs font-medium hover:text-foreground transition-colors bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border/20"
          >
            <VisIcon className="w-3.5 h-3.5" />
            {currentVis.label}
            <ChevronDown className={cn("w-3 h-3 transition-transform", showVisibilityPicker && "rotate-180")} />
          </button>
          <AnimatePresence>
            {showVisibilityPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute bottom-full left-0 mb-1 bg-card border border-border/40 rounded-xl shadow-lg overflow-hidden z-20 min-w-[160px]"
              >
                {VISIBILITY_OPTIONS.map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { setVisibility(opt.id); setShowVisibilityPicker(false); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors",
                        visibility === opt.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      <OptIcon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
          <MapPin className="w-4 h-4" /> Location
        </button>
      </div>
    </div>
  );
}

// AR filter overlays - face-tracked like TikTok
const AR_STICKERS = [
  { name: "None", emoji: "⭕", sticker: null },
  { name: "Cat Ears", emoji: "🐱", sticker: "cat" },
  { name: "Dog", emoji: "🐶", sticker: "dog" },
  { name: "Bunny", emoji: "🐰", sticker: "bunny" },
  { name: "Crown", emoji: "👑", sticker: "crown" },
  { name: "Hearts", emoji: "💕", sticker: "hearts" },
  { name: "Stars", emoji: "⭐", sticker: "stars" },
  { name: "Glasses", emoji: "🕶️", sticker: "glasses" },
  { name: "Devil", emoji: "😈", sticker: "devil" },
  { name: "Angel", emoji: "😇", sticker: "angel" },
  { name: "Flowers", emoji: "🌸", sticker: "flowers" },
  { name: "Fire", emoji: "🔥", sticker: "fire" },
  { name: "Butterfly", emoji: "🦋", sticker: "butterfly" },
  { name: "Rainbow", emoji: "🌈", sticker: "rainbow" },
  { name: "Sparkles", emoji: "✨", sticker: "sparkles" },
  { name: "Snow", emoji: "❄️", sticker: "snow" },
];

interface FaceBox {
  x: number; y: number; width: number; height: number;
  eyeLeft: { x: number; y: number };
  eyeRight: { x: number; y: number };
}

// Heart shape helper
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const topY = y - size * 0.5;
  ctx.moveTo(x, y + size * 0.7);
  ctx.bezierCurveTo(x - size * 1.2, y - size * 0.3, x - size * 0.6, topY - size * 0.5, x, topY + size * 0.2);
  ctx.bezierCurveTo(x + size * 0.6, topY - size * 0.5, x + size * 1.2, y - size * 0.3, x, y + size * 0.7);
  ctx.fill();
  ctx.restore();
}

// Star shape helper
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Sparkle shape
function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 220, 0.9)";
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.15, y - size * 0.15);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.15, y + size * 0.15);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.15, y + size * 0.15);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x - size * 0.15, y - size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Flower shape
function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  const colors = ["rgba(255,180,200,0.75)", "rgba(255,150,180,0.7)", "rgba(255,130,170,0.65)"];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.5, r * 0.28, a, 0, Math.PI * 2);
    ctx.fillStyle = colors[i % 3];
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 220, 50, 0.85)";
  ctx.fill();
  ctx.restore();
}

// Flame shape
function drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  const grd = ctx.createRadialGradient(x, y, 0, x, y - size, size * 2.5);
  grd.addColorStop(0, "rgba(255, 255, 100, 0.8)");
  grd.addColorStop(0.4, "rgba(255, 150, 0, 0.7)");
  grd.addColorStop(1, "rgba(255, 50, 0, 0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - size, y - size, x, y - size * 2.5);
  ctx.quadraticCurveTo(x + size, y - size, x, y);
  ctx.fill();
  ctx.restore();
}

// Butterfly shape
function drawButterfly(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, wingAngle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.save();
  ctx.scale(1 - wingAngle, 1);
  ctx.beginPath();
  ctx.ellipse(-size * 0.5, -size * 0.2, size, size * 0.6, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(150, 100, 255, 0.6)";
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.scale(1 + wingAngle, 1);
  ctx.beginPath();
  ctx.ellipse(size * 0.5, -size * 0.2, size, size * 0.6, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 100, 200, 0.6)";
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.07, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(60, 40, 40, 0.7)";
  ctx.fill();
  ctx.restore();
}

// Main face-tracked drawing function
function drawFaceFilter(
  ctx: CanvasRenderingContext2D, sticker: string,
  face: FaceBox, cw: number, ch: number, t: number
) {
  const { x, y, width: fw, height: fh } = face;
  const cx = x + fw / 2;
  const top = y;
  const eyeY = y + fh * 0.35;
  const noseY = y + fh * 0.55;
  const mouthY = y + fh * 0.72;
  const eyeL = face.eyeLeft;
  const eyeR = face.eyeRight;

  ctx.save();

  switch (sticker) {
    case "cat": {
      // Triangular cat ears
      const earSize = fw * 0.3;
      const earY = top - earSize * 0.4;
      for (const side of [-1, 1]) {
        const ecx = cx + side * fw * 0.22;
        ctx.beginPath();
        ctx.moveTo(ecx - earSize * 0.35, earY + earSize);
        ctx.lineTo(ecx, earY - earSize * 0.3);
        ctx.lineTo(ecx + earSize * 0.35, earY + earSize);
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 180, 200, 0.88)";
        ctx.fill();
        ctx.strokeStyle = "rgba(80, 40, 40, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Inner ear
        ctx.beginPath();
        ctx.moveTo(ecx - earSize * 0.2, earY + earSize * 0.7);
        ctx.lineTo(ecx, earY + earSize * 0.05);
        ctx.lineTo(ecx + earSize * 0.2, earY + earSize * 0.7);
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 130, 160, 0.7)";
        ctx.fill();
      }
      // Cat nose
      ctx.beginPath();
      ctx.ellipse(cx, noseY, fw * 0.04, fw * 0.03, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(50, 30, 30, 0.75)";
      ctx.fill();
      // Whiskers
      ctx.strokeStyle = "rgba(80, 60, 60, 0.5)";
      ctx.lineWidth = 1.5;
      for (const s of [-1, 1]) {
        for (const a of [-0.12, 0, 0.12]) {
          ctx.beginPath();
          ctx.moveTo(cx + s * fw * 0.06, noseY + fw * 0.02);
          ctx.lineTo(cx + s * fw * 0.35, noseY + a * fw);
          ctx.stroke();
        }
      }
      break;
    }

    case "dog": {
      // Floppy ears
      const earW = fw * 0.22;
      const earH = fw * 0.5;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + s * fw * 0.38, top + fh * 0.18, earW, earH, s * -0.3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160, 100, 60, 0.82)";
        ctx.fill();
        ctx.strokeStyle = "rgba(100, 60, 30, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Dog nose
      ctx.beginPath();
      ctx.ellipse(cx, noseY, fw * 0.07, fw * 0.05, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(30, 20, 20, 0.82)";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - fw * 0.02, noseY - fw * 0.015, fw * 0.02, fw * 0.01, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fill();
      // Tongue
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + fw * 0.08, fw * 0.06, fw * 0.1, 0, 0, Math.PI);
      ctx.fillStyle = "rgba(255, 120, 140, 0.82)";
      ctx.fill();
      break;
    }

    case "bunny": {
      const earW = fw * 0.12;
      const earH = fw * 0.55;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + s * fw * 0.15, top - earH * 0.5, earW, earH, s * -0.1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(240, 230, 230, 0.92)";
        ctx.fill();
        ctx.strokeStyle = "rgba(180, 160, 160, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + s * fw * 0.15, top - earH * 0.45, earW * 0.5, earH * 0.7, s * -0.1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 180, 190, 0.6)";
        ctx.fill();
      }
      // Nose
      ctx.beginPath();
      ctx.ellipse(cx, noseY, fw * 0.03, fw * 0.025, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 150, 170, 0.82)";
      ctx.fill();
      break;
    }

    case "crown": {
      const crownW = fw * 0.7;
      const crownH = fw * 0.35;
      const crownTop = top - crownH * 1.2;
      const grd = ctx.createLinearGradient(cx - crownW / 2, crownTop, cx + crownW / 2, crownTop + crownH);
      grd.addColorStop(0, "rgba(255, 215, 0, 0.92)");
      grd.addColorStop(1, "rgba(255, 180, 0, 0.92)");
      ctx.beginPath();
      ctx.moveTo(cx - crownW / 2, crownTop + crownH);
      ctx.lineTo(cx - crownW / 2, crownTop + crownH * 0.4);
      ctx.lineTo(cx - crownW * 0.25, crownTop + crownH * 0.7);
      ctx.lineTo(cx - crownW * 0.1, crownTop);
      ctx.lineTo(cx, crownTop + crownH * 0.5);
      ctx.lineTo(cx + crownW * 0.1, crownTop);
      ctx.lineTo(cx + crownW * 0.25, crownTop + crownH * 0.7);
      ctx.lineTo(cx + crownW / 2, crownTop + crownH * 0.4);
      ctx.lineTo(cx + crownW / 2, crownTop + crownH);
      ctx.closePath();
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 150, 0, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Gems
      const gems = ["#ff4444", "#4488ff", "#44ff44"];
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx + (i - 1) * crownW * 0.2, crownTop + crownH * 0.6, fw * 0.025, 0, Math.PI * 2);
        ctx.fillStyle = gems[i];
        ctx.fill();
      }
      break;
    }

    case "glasses": {
      const glassR = fw * 0.14;
      ctx.lineWidth = Math.max(3, fw * 0.02);
      ctx.strokeStyle = "rgba(30, 30, 30, 0.85)";
      // Left lens
      ctx.beginPath();
      ctx.arc(eyeL.x, eyeL.y, glassR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(20, 20, 50, 0.45)";
      ctx.fill();
      ctx.stroke();
      // Right lens
      ctx.beginPath();
      ctx.arc(eyeR.x, eyeR.y, glassR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bridge
      ctx.beginPath();
      ctx.moveTo(eyeL.x + glassR, eyeL.y);
      ctx.lineTo(eyeR.x - glassR, eyeR.y);
      ctx.stroke();
      // Arms
      ctx.beginPath();
      ctx.moveTo(eyeL.x - glassR, eyeL.y);
      ctx.lineTo(x, eyeL.y + fw * 0.02);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeR.x + glassR, eyeR.y);
      ctx.lineTo(x + fw, eyeR.y + fw * 0.02);
      ctx.stroke();
      break;
    }

    case "devil": {
      const hornH = fw * 0.4;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * fw * 0.25, top);
        ctx.quadraticCurveTo(cx + s * fw * 0.35, top - hornH, cx + s * fw * 0.15, top - hornH * 0.8);
        ctx.lineTo(cx + s * fw * 0.2, top + fw * 0.05);
        ctx.closePath();
        ctx.fillStyle = "rgba(200, 30, 30, 0.88)";
        ctx.fill();
      }
      break;
    }

    case "angel": {
      ctx.beginPath();
      ctx.ellipse(cx, top - fw * 0.18, fw * 0.28, fw * 0.06, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 215, 0, 0.85)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(cx, top - fw * 0.18, fw * 0.28, fw * 0.06, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 225, 100, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }

    case "hearts": {
      for (let i = 0; i < 8; i++) {
        const hx = cx + Math.sin(t * 0.002 + i * 1.2) * fw * 0.6;
        const baseY = top - fh * 0.1;
        const hy = baseY + Math.cos(t * 0.003 + i * 0.8) * fh * 0.3 - (t * 0.05 + i * 20) % (fh * 0.5);
        const hs = fw * 0.04 + Math.sin(i) * fw * 0.02;
        const ha = Math.max(0, 1 - ((t * 0.05 + i * 20) % (fh * 0.5)) / (fh * 0.5));
        if (ha <= 0) continue;
        ctx.globalAlpha = ha * 0.85;
        drawHeart(ctx, hx, hy, hs, "rgba(255, 60, 100, 0.9)");
      }
      ctx.globalAlpha = 1;
      break;
    }

    case "stars": {
      for (let i = 0; i < 10; i++) {
        const sx = cx + Math.sin(t * 0.001 + i * 2) * fw * 0.8;
        const sy = top + Math.cos(t * 0.002 + i * 1.5) * fh * 0.4;
        const ss = fw * 0.035 + Math.sin(t * 0.005 + i) * fw * 0.01;
        ctx.globalAlpha = 0.6 + Math.sin(t * 0.005 + i) * 0.3;
        drawStar(ctx, sx, sy, ss, "rgba(255, 215, 0, 0.9)");
      }
      ctx.globalAlpha = 1;
      break;
    }

    case "flowers": {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + t * 0.001;
        const r = fw * 0.5;
        drawFlower(ctx, cx + Math.cos(a) * r, top + fh * 0.3 + Math.sin(a) * r * 0.3, fw * 0.06);
      }
      break;
    }

    case "fire": {
      for (let i = 0; i < 5; i++) {
        const fx = x + fw * 0.1 + i * fw * 0.2;
        const fy = y + fh - fw * 0.05 + Math.sin(t * 0.01 + i * 2) * fw * 0.02;
        drawFlame(ctx, fx, fy, fw * 0.08);
      }
      break;
    }

    case "butterfly": {
      for (let i = 0; i < 3; i++) {
        const bx = cx + Math.sin(t * 0.002 + i * 3) * fw * 0.5;
        const by = top - fw * 0.1 + Math.cos(t * 0.003 + i * 2) * fh * 0.2;
        drawButterfly(ctx, bx, by, fw * 0.08, Math.sin(t * 0.008 + i) * 0.3);
      }
      break;
    }

    case "rainbow": {
      const colors = ["#ff000080", "#ff880080", "#ffff0080", "#00cc0080", "#0000ff80", "#4b008280", "#ee82ee80"];
      for (let i = 0; i < colors.length; i++) {
        ctx.beginPath();
        ctx.arc(cx, top + fh * 0.3, fw * 0.65 - i * fw * 0.03, Math.PI, 0);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = fw * 0.025;
        ctx.stroke();
      }
      break;
    }

    case "sparkles": {
      for (let i = 0; i < 15; i++) {
        const sx = cx + Math.sin(t * 0.003 + i * 1.7) * cw * 0.35;
        const sy = ch * 0.1 + Math.cos(t * 0.002 + i * 2.3) * ch * 0.4;
        ctx.globalAlpha = Math.max(0, 0.4 + Math.sin(t * 0.008 + i * 3) * 0.5);
        drawSparkle(ctx, sx, sy, fw * 0.035);
      }
      ctx.globalAlpha = 1;
      break;
    }

    case "snow": {
      for (let i = 0; i < 25; i++) {
        const sx = (Math.sin(i * 7.3) * 0.5 + 0.5) * cw;
        const sy = ((t * 0.03 + i * ch * 0.04) % ch);
        const ss = fw * 0.012 + (i % 3) * fw * 0.005;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.arc(sx + Math.sin(t * 0.002 + i) * 10, sy, ss, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
  }
  ctx.restore();
}

type FaceAnchor = {
  x: number;
  y: number;
  size: number;
};

function drawTrackedSticker(
  ctx: CanvasRenderingContext2D,
  sticker: string,
  w: number,
  h: number,
  faceAnchor: FaceAnchor | null,
) {
  if (!faceAnchor) {
    const defaultFace: FaceBox = {
      x: w * 0.25, y: h * 0.15, width: w * 0.5, height: h * 0.5,
      eyeLeft: { x: w * 0.38, y: h * 0.32 }, eyeRight: { x: w * 0.62, y: h * 0.32 },
    };
    drawFaceFilter(ctx, sticker, defaultFace, w, h, performance.now());
    return;
  }

  const cx = faceAnchor.x;
  const cy = faceAnchor.y;
  const faceSize = faceAnchor.size;
  const fontSize = Math.max(22, faceSize * 0.42);
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = "center";

  switch (sticker) {
    case "cat":
      ctx.fillText("🐱", cx - faceSize * 0.35, cy - faceSize * 0.65);
      ctx.fillText("🐱", cx + faceSize * 0.35, cy - faceSize * 0.65);
      ctx.fillText("👃", cx, cy + faceSize * 0.05);
      break;
    case "dog":
      ctx.fillText("🐕", cx, cy - faceSize * 0.55);
      ctx.fillText("👅", cx, cy + faceSize * 0.42);
      break;
    case "bunny":
      ctx.fillText("🐰", cx, cy - faceSize * 0.72);
      break;
    case "crown":
      ctx.fillText("👑", cx, cy - faceSize * 0.82);
      break;
    case "glasses":
      ctx.fillText("🕶️", cx, cy);
      break;
    case "devil":
      ctx.fillText("😈", cx, cy - faceSize * 0.85);
      break;
    case "angel":
      ctx.fillText("😇", cx, cy - faceSize * 0.92);
      break;
    case "butterfly":
      ctx.fillText("🦋", cx - faceSize * 0.6, cy - faceSize * 0.5);
      ctx.fillText("🦋", cx + faceSize * 0.6, cy - faceSize * 0.45);
      break;
    default:
      drawSticker(ctx, sticker, w, h);
  }
}

function LiveBroadcast({
  onClose,
  onPublishClip,
}: {
  onClose: () => void;
  onPublishClip: (payload: NewPostPayload) => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>();
  const [isLive, setIsLive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [elapsed, setElapsed] = useState(0);
  const [viewers] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [comments, setComments] = useState<{ id: number; user: string; text: string }[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTab, setFilterTab] = useState<"color" | "face" | "ar">("color");
  const [activeSticker, setActiveSticker] = useState(0);
  const [faceAnchor, setFaceAnchor] = useState<FaceAnchor | null>(null);
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPublishingClip, setIsPublishingClip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const recordTimerRef = useRef<ReturnType<typeof setInterval>>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const COLOR_FILTERS = [
    { name: "Original", css: "none", emoji: "✨" },
    { name: "Warm", css: "sepia(0.3) saturate(1.4) brightness(1.05)", emoji: "🌅" },
    { name: "Cool", css: "saturate(0.8) hue-rotate(20deg) brightness(1.05)", emoji: "❄️" },
    { name: "B&W", css: "grayscale(1) contrast(1.1)", emoji: "🖤" },
    { name: "Vintage", css: "sepia(0.5) contrast(0.9) brightness(1.1)", emoji: "📷" },
    { name: "Vivid", css: "saturate(2) contrast(1.15)", emoji: "🎨" },
    { name: "Fade", css: "saturate(0.5) brightness(1.2) contrast(0.8)", emoji: "🌫️" },
    { name: "Drama", css: "contrast(1.5) brightness(0.85) saturate(1.3)", emoji: "🎭" },
    { name: "Glow", css: "brightness(1.25) saturate(1.4)", emoji: "💫" },
    { name: "Noir", css: "grayscale(0.8) contrast(1.4) brightness(0.85)", emoji: "🕶️" },
    { name: "Sunset", css: "sepia(0.2) saturate(1.6) hue-rotate(-10deg) brightness(1.05)", emoji: "🌇" },
    { name: "Ocean", css: "saturate(0.9) hue-rotate(30deg) brightness(1.1)", emoji: "🌊" },
    { name: "Rose", css: "saturate(1.3) hue-rotate(-15deg) brightness(1.1)", emoji: "🌹" },
    { name: "Neon", css: "saturate(2.5) contrast(1.2) brightness(1.1)", emoji: "💜" },
    { name: "Film", css: "sepia(0.15) contrast(1.1) saturate(0.9) brightness(0.95)", emoji: "🎬" },
    { name: "Pop", css: "saturate(1.8) brightness(1.1) contrast(1.05)", emoji: "🍭" },
    { name: "Dreamy", css: "brightness(1.15) saturate(0.7) contrast(0.85)", emoji: "☁️" },
    { name: "Chrome", css: "saturate(0.4) contrast(1.3) brightness(1.05)", emoji: "⚡" },
    { name: "Ember", css: "sepia(0.4) saturate(1.8) hue-rotate(-20deg) brightness(0.95)", emoji: "🔥" },
    { name: "Arctic", css: "saturate(0.6) hue-rotate(40deg) brightness(1.15) contrast(0.9)", emoji: "🧊" },
    { name: "Cyberpunk", css: "saturate(2.2) hue-rotate(-30deg) contrast(1.3) brightness(0.9)", emoji: "🤖" },
    { name: "Pastel", css: "saturate(0.6) brightness(1.25) contrast(0.75)", emoji: "🎀" },
    { name: "Moody", css: "contrast(1.3) brightness(0.75) saturate(1.1) sepia(0.1)", emoji: "🌑" },
    { name: "Golden", css: "sepia(0.4) saturate(1.3) brightness(1.15) hue-rotate(-5deg)", emoji: "👑" },
    { name: "X-Ray", css: "invert(1) hue-rotate(180deg) contrast(1.2)", emoji: "💀" },
    { name: "Thermal", css: "hue-rotate(90deg) saturate(2) contrast(1.3) brightness(0.9)", emoji: "🌡️" },
    { name: "Toxic", css: "hue-rotate(100deg) saturate(2.5) contrast(1.2) brightness(0.9)", emoji: "☢️" },
    { name: "Polaroid", css: "sepia(0.3) saturate(1.1) contrast(0.95) brightness(1.15)", emoji: "🖼️" },
  ];

  const FACE_FILTERS = [
    { name: "Natural", css: "blur(0.2px) brightness(1.08) contrast(0.95) saturate(1.1)", emoji: "🌿" },
    { name: "Smooth", css: "blur(0.6px) brightness(1.12) contrast(0.9) saturate(1.1)", emoji: "🧴" },
    { name: "HD Smooth", css: "blur(0.8px) brightness(1.18) contrast(0.84) saturate(1.08)", emoji: "📸" },
    { name: "Ultra Smooth", css: "blur(1px) brightness(1.2) contrast(0.82) saturate(1.05)", emoji: "🫧" },
    { name: "Cute", css: "blur(0.4px) brightness(1.2) saturate(1.4) contrast(0.86) sepia(0.05)", emoji: "🥰" },
    { name: "Baby Face", css: "blur(0.8px) brightness(1.22) contrast(0.8) saturate(1.15)", emoji: "👶" },
    { name: "Glow Up", css: "blur(0.4px) brightness(1.3) saturate(1.4) contrast(0.88)", emoji: "💎" },
    { name: "Glass Skin", css: "blur(0.5px) brightness(1.32) contrast(0.76) saturate(1.0)", emoji: "🪞" },
    { name: "K-Beauty", css: "blur(0.5px) brightness(1.25) contrast(0.82) saturate(0.92) sepia(0.06)", emoji: "🇰🇷" },
    { name: "Porcelain", css: "blur(0.5px) brightness(1.25) contrast(0.8) saturate(0.85) sepia(0.1)", emoji: "🪆" },
    { name: "Angelic", css: "blur(0.8px) brightness(1.35) contrast(0.76) saturate(0.85) sepia(0.1)", emoji: "😇" },
    { name: "Full Glam", css: "blur(1px) brightness(1.35) contrast(0.78) saturate(1.4) sepia(0.06)", emoji: "👑" },
    { name: "Airbrushed", css: "blur(1.5px) brightness(1.3) contrast(0.78) saturate(1.1)", emoji: "🖌️" },
    { name: "Rosy", css: "blur(0.4px) brightness(1.15) saturate(1.5) contrast(0.88) hue-rotate(-15deg)", emoji: "🌸" },
    { name: "Sun-kissed", css: "blur(0.3px) brightness(1.2) saturate(1.35) contrast(0.92) sepia(0.18)", emoji: "☀️" },
    { name: "Filter Max", css: "blur(1.2px) brightness(1.4) contrast(0.75) saturate(1.3)", emoji: "⭐" },
  ];

  const activeFilters = filterTab === "color" ? COLOR_FILTERS : FACE_FILTERS;
  const currentFilter = activeFilters[activeFilter] || activeFilters[0];

  // Face detection + AR sticker canvas overlay
  useEffect(() => {
    const currentSticker = AR_STICKERS[activeSticker]?.sticker;
    if (!currentSticker) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Try to use browser FaceDetector API (Chrome/Edge)
    let faceDetector: any = null;
    try {
      if ("FaceDetector" in window) {
        faceDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      }
    } catch { /* not supported */ }

    let running = true;
    let lastFace: FaceBox | null = null;
    let frameCount = 0;

    const detectAndDraw = async () => {
      if (!running) return;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const video = videoRef.current;
      const cw = canvas.width;
      const ch = canvas.height;

      // Detect face every 5 frames for performance
      if (video && faceDetector && video.readyState >= 2 && frameCount % 5 === 0) {
        try {
          const faces = await faceDetector.detect(video);
          if (faces.length > 0) {
            const f = faces[0];
            const bb = f.boundingBox;
            const scaleX = cw / video.videoWidth;
            const scaleY = ch / video.videoHeight;
            const eyeL = f.landmarks?.find((l: any) => l.type === "eye")?.locations?.[0];
            const eyeR = f.landmarks?.filter((l: any) => l.type === "eye")?.[1]?.locations?.[0];
            lastFace = {
              x: bb.x * scaleX,
              y: bb.y * scaleY,
              width: bb.width * scaleX,
              height: bb.height * scaleY,
              eyeLeft: eyeL
                ? { x: eyeL.x * scaleX, y: eyeL.y * scaleY }
                : { x: (bb.x + bb.width * 0.32) * scaleX, y: (bb.y + bb.height * 0.35) * scaleY },
              eyeRight: eyeR
                ? { x: eyeR.x * scaleX, y: eyeR.y * scaleY }
                : { x: (bb.x + bb.width * 0.68) * scaleX, y: (bb.y + bb.height * 0.35) * scaleY },
            };
          }
        } catch { /* detection failed, use last known */ }
      }

      const face: FaceBox = lastFace || {
        x: cw * 0.25, y: ch * 0.15,
        width: cw * 0.5, height: ch * 0.5,
        eyeLeft: { x: cw * 0.38, y: ch * 0.32 },
        eyeRight: { x: cw * 0.62, y: ch * 0.32 },
      };

      drawFaceFilter(ctx, currentSticker, face, cw, ch, performance.now());
      frameCount++;
      animFrameRef.current = requestAnimationFrame(detectAndDraw);
    };

    detectAndDraw();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeSticker, faceAnchor]);

  useEffect(() => {
    const FaceDetectorCtor = (window as any).FaceDetector;
    if (!FaceDetectorCtor) {
      setFaceAnchor(null);
      return;
    }

    let alive = true;
    let rafId = 0;
    const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 });

    const detect = async () => {
      if (!alive) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        try {
          const faces = await detector.detect(video);
          const box = faces?.[0]?.boundingBox;
          if (box) {
            const scaleX = (video.clientWidth || 1) / (video.videoWidth || 1);
            const scaleY = (video.clientHeight || 1) / (video.videoHeight || 1);
            const x = (box.x + box.width / 2) * scaleX * 2;
            const y = (box.y + box.height / 2) * scaleY * 2;
            const size = Math.max(box.width * scaleX * 2, 120);
            setFaceAnchor({ x, y, size });
          }
        } catch {
          // Face detector unsupported or blocked; keep static overlays.
        }
      }
      rafId = requestAnimationFrame(detect);
    };

    rafId = requestAnimationFrame(detect);
    return () => {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [facingMode]);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      toast.error("Camera access denied");
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
    };
  }, []);

  const goLive = () => {
    setIsLive(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    toast.success("You're LIVE! 🔴");
  };

  const endLive = () => {
    setIsLive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    toast.info(`Live ended • ${formatTime(elapsed)}`);
    onClose();
  };

  const flipCamera = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  };

  const toggleMic = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  };

  const sendComment = () => {
    if (!commentInput.trim()) return;
    setComments((prev) => [...prev, { id: Date.now(), user: "You", text: commentInput.trim() }]);
    setCommentInput("");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const startClipRecording = () => {
    if (isPublishingClip) return;
    const stream = streamRef.current;
    if (!stream) {
      toast.error("Camera stream is not ready");
      return;
    }
    if (!(window as any).MediaRecorder) {
      toast.error("Recording is not supported on this device");
      return;
    }

    const mimeCandidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    const supported = mimeCandidates.find((type) => (window as any).MediaRecorder.isTypeSupported?.(type));

    try {
      chunksRef.current = [];
      const recorder = supported
        ? new MediaRecorder(stream, { mimeType: supported })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        if (chunksRef.current.length === 0) return;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const clipUrl = URL.createObjectURL(blob);
        const clipFile = new File([blob], `zivo-clip-${Date.now()}.webm`, { type: blob.type || "video/webm" });

        setIsPublishingClip(true);
        try {
          await onPublishClip({
            type: "reel",
            caption: "New live clip",
            url: clipUrl,
            file: clipFile,
            filterCss: filterTab !== "ar" ? currentFilter.css : "none",
          });
          toast.success("Clip published to your feed");
        } catch {
          toast.error("Failed to publish clip");
        } finally {
          setIsPublishingClip(false);
        }
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecordingClip(true);
      setRecordSeconds(0);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = setInterval(() => setRecordSeconds((sec) => sec + 1), 1000);
      toast.success("Recording started");
    } catch {
      toast.error("Could not start recording");
    }
  };

  const stopClipRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;
    mediaRecorderRef.current.stop();
    setIsRecordingClip(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
    >
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: facingMode === "user" ? "scaleX(-1)" : "none",
          filter: filterTab !== "ar" ? currentFilter.css : "none",
        }}
      />
      {/* AR sticker canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
      />

      {/* Top overlay */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-12">
        <div className="flex items-center gap-2">
          {isLive && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 bg-destructive px-3 py-1 rounded-full"
            >
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-white text-xs font-bold">LIVE</span>
            </motion.div>
          )}
          {isLive && (
            <span className="text-white/80 text-xs font-mono bg-black/40 px-2 py-1 rounded-full">
              {formatTime(elapsed)}
            </span>
          )}
          {isRecordingClip && (
            <span className="text-white/90 text-xs font-mono bg-red-600/80 px-2 py-1 rounded-full">
              REC {formatTime(recordSeconds)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
              <Eye className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-bold">{viewers}</span>
            </div>
          )}
          <button onClick={isLive ? endLive : onClose} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Spacer + Comments overlay */}
      {isLive ? (
        <div className="relative z-10 flex-1 flex flex-col justify-end px-4 pb-2">
          <div className="max-h-[30vh] overflow-y-auto space-y-1.5 mb-3 scrollbar-none">
            {comments.map((c) => (
              <div key={c.id} className="bg-black/30 backdrop-blur-sm rounded-xl px-3 py-1.5 max-w-[80%]">
                <span className="text-white text-xs font-bold mr-1.5">{c.user}</span>
                <span className="text-white/90 text-xs">{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* TikTok-style bottom filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 200 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="absolute left-0 right-0 bottom-0 z-20"
          >
            <div className="bg-black/70 backdrop-blur-xl pt-3 pb-6 rounded-t-3xl">
              {/* Category tabs */}
              <div className="flex items-center gap-1 px-4 mb-3 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
                {(["color", "face", "ar"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setFilterTab(tab); setActiveFilter(0); if (tab !== "ar") setActiveSticker(0); }}
                    className={cn(
                      "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                      filterTab === tab
                        ? "text-white border-b-2 border-white"
                        : "text-white/40"
                    )}
                  >
                    {tab === "color" ? "🎨 Color" : tab === "face" ? "✨ Beauty" : "🎭 Effects"}
                  </button>
                ))}
              </div>
              {/* Filter/Sticker grid */}
              <div className="grid grid-cols-4 gap-3 px-4 max-h-[35vh] overflow-y-auto scrollbar-none">
                {filterTab === "ar" ? (
                  AR_STICKERS.map((s, i) => (
                    <button
                      key={s.name}
                      onClick={() => setActiveSticker(i)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-all",
                          activeSticker === i
                            ? "bg-white/20 border-2 border-white scale-105 shadow-lg shadow-white/20"
                            : "bg-white/5 border-2 border-transparent opacity-75"
                        )}
                      >
                        {s.emoji}
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium leading-tight",
                        activeSticker === i ? "text-white" : "text-white/50"
                      )}>{s.name}</span>
                    </button>
                  ))
                ) : (
                  activeFilters.map((f, i) => (
                    <button
                      key={f.name}
                      onClick={() => setActiveFilter(i)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={cn(
                          "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                          activeFilter === i
                            ? "border-white scale-105 shadow-lg shadow-white/20"
                            : "border-transparent opacity-75"
                        )}
                        style={{ filter: f.css }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium leading-tight",
                        activeFilter === i ? "text-white" : "text-white/50"
                      )}>{f.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="relative z-10 p-4 pb-8 bg-gradient-to-t from-black/60 to-transparent">
        {isLive ? (
          <div className="flex items-center gap-2">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendComment()}
              placeholder="Say something..."
              className="flex-1 bg-white/15 backdrop-blur-sm text-white text-sm rounded-full px-4 py-2.5 placeholder:text-white/50 outline-none border border-white/10"
            />
            <button onClick={() => setShowFilters(!showFilters)} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={isRecordingClip ? stopClipRecording : startClipRecording}
              disabled={isPublishingClip}
              className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center disabled:opacity-60"
            >
              <Film className={cn("w-5 h-5", isRecordingClip ? "text-red-400" : "text-white")} />
            </button>
            <button onClick={toggleMic} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>
            <button onClick={endLive} className="px-4 py-2.5 bg-destructive rounded-full">
              <span className="text-white text-sm font-bold">End</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-1",
                showFilters ? "bg-primary text-primary-foreground" : "bg-white/15 text-white/70"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" /> Filters
            </button>
            <div className="flex items-center gap-5">
              <button onClick={flipCamera} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <SwitchCamera className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={isRecordingClip ? stopClipRecording : startClipRecording}
                disabled={isPublishingClip}
                className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center disabled:opacity-60"
              >
                <Film className={cn("w-5 h-5", isRecordingClip ? "text-red-400" : "text-white")} />
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goLive}
                className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/40"
              >
                <Camera className="w-6 h-6 text-white" />
              </motion.button>
              <button onClick={toggleMic} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
            </div>
            <span className="text-white/60 text-xs font-medium">Tap to Go Live or record short clips</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
