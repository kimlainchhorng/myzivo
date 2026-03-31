/**
 * ReelsFeedPage — Instagram / Facebook style social feed
 * Full-width cards with author info, media, captions, and engagement
 * Everyone can post photos/videos that show up here
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStorePostMediaUrl } from "@/utils/normalizeStorePostMediaUrl";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import {
  Loader2, Heart, MessageCircle, Share2, Eye, Bookmark,
  MoreHorizontal, Play, Volume2, VolumeX, Image as ImageIcon,
  Plus, Camera, X as XIcon, Send, Film, Radio,
  Globe, Users, Lock, FolderPlus, MapPin, Hash, ChevronDown,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FeedItem {
  id: string;
  source: "store" | "user";
  media_urls: string[];
  media_type: "image" | "video";
  caption: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  author_name: string;
  author_avatar: string | null;
  author_id?: string;
  created_at: string;
}

export default function ReelsFeedPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string | null } | null>(null);

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

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["reels-feed-grid"],
    queryFn: async () => {
      const allItems: FeedItem[] = [];

      // Fetch store posts
      const { data: storePosts } = await supabase
        .from("store_posts")
        .select("id, media_urls, media_type, caption, likes_count, comments_count, view_count, created_at, store_id")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (storePosts?.length) {
        const storeIds = [...new Set(storePosts.map((p: any) => p.store_id))];
        const { data: stores } = await supabase
          .from("store_profiles")
          .select("id, name, logo_url")
          .in("id", storeIds);
        const storeMap = new Map((stores || []).map((s: any) => [s.id, s]));

        for (const post of storePosts as any[]) {
          const store = storeMap.get(post.store_id);
          const urls: string[] = (post.media_urls || []).map((u: string) => normalizeStorePostMediaUrl(u));
          if (!urls.length) continue;

          allItems.push({
            id: post.id,
            source: "store",
            media_urls: urls,
            media_type: (post.media_type === "video" || urls[0]?.match(/\.(mp4|mov|webm)/i)) ? "video" : "image",
            caption: post.caption,
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            views_count: post.view_count || 0,
            author_name: store?.name || "Store",
            author_avatar: store?.logo_url || null,
            created_at: post.created_at,
          });
        }
      }

      // Fetch user posts
      try {
        const { data: userPosts } = await (supabase as any)
          .from("user_posts")
          .select("id, media_url, media_type, caption, likes_count, comments_count, views_count, created_at, user_id")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(50);

        if (userPosts?.length) {
          const userIds = [...new Set(userPosts.map((p: any) => p.user_id))] as string[];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .in("id", userIds);
          const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

          for (const post of userPosts as any[]) {
            const profile = profileMap.get(post.user_id);
            if (!post.media_url) continue;

            allItems.push({
              id: `u-${post.id}`,
              source: "user",
              media_urls: [post.media_url],
              media_type: post.media_type === "video" ? "video" : "image",
              caption: post.caption,
              likes_count: post.likes_count || 0,
              comments_count: post.comments_count || 0,
              views_count: post.views_count || 0,
              author_name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User" : "User",
              author_avatar: profile?.avatar_url || null,
              author_id: post.user_id,
              created_at: post.created_at,
            });
          }
        }
      } catch {}

      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return allItems;
    },
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 px-4 py-2.5 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Feed</h1>
        {userId && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Post
          </button>
        )}
      </div>

      {/* Create post prompt (logged in) */}
      {userId && (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-3 px-4 py-3 border-b border-border/20 bg-card hover:bg-muted/30 transition-colors"
        >
          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border/30 shrink-0">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
                <Camera className="h-4 w-4" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Share a moment...</p>
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-4 w-4 text-primary" />
            </div>
          </div>
        </button>
      )}

      {/* Posts */}
      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground/60">
          <ImageIcon className="h-10 w-10 mb-2" />
          <p className="text-sm">No posts yet</p>
          <p className="text-xs mt-1">Be the first to share something!</p>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {items.map((item) => (
            <FeedCard key={item.id} item={item} currentUserId={userId} />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && userId && (
          <CreatePostModal
            userId={userId}
            userProfile={userProfile}
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
            }}
          />
        )}
      </AnimatePresence>

      <ZivoMobileNav />
    </div>
  );
}

/* ── Create Post Modal ──────────────────────────────────────────── */

function CreatePostModal({
  userId,
  userProfile,
  onClose,
  onCreated,
}: {
  userId: string;
  userProfile: { name: string; avatar: string | null } | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [selectedType, setSelectedType] = useState<"Photo" | "Video" | "Reel" | "Live" | null>(null);
  const [visibility, setVisibility] = useState<"everyone" | "friends" | "onlyme">("everyone");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [album, setAlbum] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setMediaType(f.type.startsWith("video") ? "video" : "image");
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handlePost = async () => {
    if (!file) {
      toast.error("Please select a photo or video");
      return;
    }
    setUploading(true);
    try {
      // Upload to user-posts bucket
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("user-posts")
        .upload(path, file, { contentType: file.type });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("user-posts").getPublicUrl(path);
      const mediaUrl = urlData.publicUrl;

      // Insert into user_posts
      const { error: insertErr } = await (supabase as any).from("user_posts").insert({
        user_id: userId,
        media_type: mediaType,
        media_url: mediaUrl,
        caption: caption.trim() || null,
        is_published: true,
      });
      if (insertErr) throw insertErr;

      toast.success("Post shared! 🎉");
      onCreated();
    } catch (err: any) {
      console.error("[CreatePost]", err);
      toast.error(err.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-auto pb-20 z-[60]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <button onClick={onClose} className="text-muted-foreground">
            <XIcon className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-bold text-foreground">Create Post</h2>
          <button
            onClick={handlePost}
            disabled={!file || uploading}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
              file && !uploading
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Share"}
          </button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border/30">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-sm font-bold">
                {userProfile?.name?.[0] || "?"}
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground">{userProfile?.name || "You"}</p>
        </div>

        {/* Privacy & extras row */}
        <div className="px-4 pb-2 flex items-center gap-2 flex-wrap">
          {/* Visibility dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/30 text-xs font-medium text-foreground min-h-[36px]"
            >
              {visibility === "everyone" && <Globe className="h-3.5 w-3.5 text-primary" />}
              {visibility === "friends" && <Users className="h-3.5 w-3.5 text-primary" />}
              {visibility === "onlyme" && <Lock className="h-3.5 w-3.5 text-primary" />}
              <span>{visibility === "everyone" ? "Everyone" : visibility === "friends" ? "Friends" : "Only me"}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showVisibilityMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-1 w-40 bg-card border border-border/40 rounded-xl shadow-lg z-10 overflow-hidden"
                >
                  {([
                    { value: "everyone" as const, label: "Everyone", icon: Globe },
                    { value: "friends" as const, label: "Friends", icon: Users },
                    { value: "onlyme" as const, label: "Only me", icon: Lock },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setVisibility(opt.value); setShowVisibilityMenu(false); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors",
                        visibility === opt.value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/40"
                      )}
                    >
                      <opt.icon className="h-4 w-4" />
                      {opt.label}
                      {visibility === opt.value && <span className="ml-auto text-primary">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Album button */}
          <button
            onClick={() => {
              const name = prompt("Album name:");
              if (name?.trim()) setAlbum(name.trim());
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium min-h-[36px]",
              album
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted/40 text-muted-foreground border-border/30 hover:bg-muted/50"
            )}
          >
            <FolderPlus className="h-3.5 w-3.5" />
            {album || "Album"}
          </button>

          {/* Location tag */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/30 text-xs font-medium text-muted-foreground min-h-[36px] hover:bg-muted/50"
            onClick={() => toast.info("Location tagging coming soon!")}
          >
            <MapPin className="h-3.5 w-3.5" />
            Location
          </button>

          {/* Tag people */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/30 text-xs font-medium text-muted-foreground min-h-[36px] hover:bg-muted/50"
            onClick={() => toast.info("Tag people coming soon!")}
          >
            <Hash className="h-3.5 w-3.5" />
            Tag
          </button>
        </div>

        {/* Caption */}
        <div className="px-4">
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
            rows={3}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>

        {/* Media preview */}
        {preview ? (
          <div className="relative mx-4 mb-3 rounded-xl overflow-hidden bg-black aspect-square">
            {mediaType === "video" ? (
              <video src={preview} className="h-full w-full object-cover" controls muted />
            ) : (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            )}
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center"
            >
              <XIcon className="h-4 w-4 text-white" />
            </button>
            {selectedType && (
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-[10px] font-bold text-white uppercase tracking-wider">
                {selectedType}
              </div>
            )}
          </div>
        ) : null}

        {/* Media type selector — bottom toolbar */}
        <div className="px-4 py-3 border-t border-border/30 flex items-center gap-3">
          {[
            { label: "Photo", icon: ImageIcon, accept: "image/*" },
            { label: "Video", icon: Play, accept: "video/*" },
            { label: "Reel", icon: Film, accept: "video/*" },
            { label: "Live", icon: Radio, accept: "" },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                if (opt.label === "Live") {
                  toast.info("Live is coming soon!");
                  return;
                }
                setSelectedType(opt.label as any);
                if (fileRef.current) {
                  fileRef.current.accept = opt.accept;
                  fileRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
            >
              <opt.icon className={cn(
                "h-5 w-5 transition-colors",
                selectedType === opt.label ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                selectedType === opt.label ? "text-primary" : "text-muted-foreground"
              )}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFile}
        />
      </motion.div>
    </motion.div>
  );
}

/* ── Individual Feed Card (IG/FB style) ──────────────────────────── */

function FeedCard({ item, currentUserId }: { item: FeedItem; currentUserId: string | null }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ id: string; text: string; author: string; time: string }[]>([]);
  const [localLikes, setLocalLikes] = useState(item.likes_count);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  // Auto-play videos when visible
  useEffect(() => {
    if (item.media_type !== "video" || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [item.media_type]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to like posts");
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLocalLikes((prev) => prev + (newLiked ? 1 : -1));
    // Persist like to DB
    if (item.source === "store") {
      if (newLiked) {
        await supabase.from("store_post_likes").insert({ post_id: item.id, user_id: currentUserId }).then(() => {});
      } else {
        await supabase.from("store_post_likes").delete().eq("post_id", item.id).eq("user_id", currentUserId);
      }
    }
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };

  const shareUrl = window.location.href;
  const shareText = encodeURIComponent(item.caption || `Check out this post by ${item.author_name}`);
  const shareEncodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    { label: "WhatsApp", icon: "💬", url: `https://wa.me/?text=${shareText}%20${shareEncodedUrl}` },
    { label: "Telegram", icon: "✈️", url: `https://t.me/share/url?url=${shareEncodedUrl}&text=${shareText}` },
    { label: "Facebook", icon: "📘", url: `https://www.facebook.com/sharer/sharer.php?u=${shareEncodedUrl}` },
    { label: "X", icon: "🐦", url: `https://x.com/intent/tweet?text=${shareText}&url=${shareEncodedUrl}` },
    { label: "Email", icon: "📧", url: `mailto:?subject=${shareText}&body=${shareEncodedUrl}` },
    { label: "SMS", icon: "💬", url: `sms:?body=${shareText}%20${shareEncodedUrl}` },
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
    setShowShareSheet(false);
  };

  const handleSave = () => {
    if (!currentUserId) {
      toast.error("Please sign in to bookmark posts");
      return;
    }
    setSaved(!saved);
    toast.success(saved ? "Removed from saved" : "Saved!");
  };

  const handleComment = () => {
    if (!currentUserId) {
      toast.error("Please sign in to comment");
      return;
    }
    setShowComments(!showComments);
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now().toString(), text: commentText.trim(), author: "You", time: "just now" },
    ]);
    setCommentText("");
    toast.success("Comment added!");
  };

  const mediaUrl = item.media_urls[currentMedia] || item.media_urls[0];

  return (
    <div className="bg-card">
      {/* Author header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="h-9 w-9 rounded-full overflow-hidden bg-muted border border-border/30 shrink-0">
          {item.author_avatar ? (
            <img src={item.author_avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs font-bold">
              {item.author_name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{item.author_name}</p>
          <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
        </div>
        <button className="p-1.5 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Media */}
      <div ref={containerRef} className="relative w-full aspect-square bg-black">
        {item.media_type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={mediaUrl}
              muted={muted}
              loop
              playsInline
              preload="metadata"
              onClick={togglePlay}
              className="h-full w-full object-cover"
            />
            {!isPlaying && (
              <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/10">
                <Play className="h-14 w-14 text-white/80 fill-white/80 drop-shadow-lg" />
              </button>
            )}
            <button
              onClick={() => setMuted(!muted)}
              className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center min-h-[44px] min-w-[44px]"
            >
              {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
            </button>
          </>
        ) : (
          <img src={mediaUrl} alt={item.caption || ""} className="h-full w-full object-cover" loading="lazy" />
        )}

        {/* Multi-image indicator */}
        {item.media_urls.length > 1 && (
          <>
            <div className="absolute top-3 right-3 bg-black/50 px-2 py-0.5 rounded-full text-[10px] text-white font-medium">
              {currentMedia + 1}/{item.media_urls.length}
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {item.media_urls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentMedia(i)}
                  className={cn("h-1.5 rounded-full transition-all", i === currentMedia ? "w-4 bg-primary" : "w-1.5 bg-white/60")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center px-3 py-2">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={handleLike} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Heart className={cn("h-6 w-6 transition-all", liked ? "text-red-500 fill-red-500 scale-110" : "text-foreground active:scale-125")} />
          </button>
          <button onClick={handleComment} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground">
            <MessageCircle className="h-6 w-6" />
          </button>
          <button onClick={handleShare} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground">
            <Share2 className="h-6 w-6" />
          </button>
        </div>
        <button onClick={handleSave} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Bookmark className={cn("h-6 w-6 transition-all", saved ? "text-foreground fill-foreground" : "text-foreground")} />
        </button>
      </div>

      {/* Likes */}
      {localLikes > 0 && (
        <div className="px-3 pb-1">
          <p className="text-[13px] font-semibold text-foreground">
            {localLikes.toLocaleString()} likes
          </p>
        </div>
      )}

      {/* Caption */}
      {item.caption && (
        <div className="px-3 pb-2">
          <p className="text-[13px] text-foreground">
            <span className="font-semibold mr-1">{item.author_name}</span>
            {item.caption}
          </p>
        </div>
      )}

      {/* Comments count */}
      {(item.comments_count > 0 || comments.length > 0) && (
        <button onClick={handleComment} className="px-3 pb-2">
          <p className="text-[12px] text-muted-foreground">
            View all {item.comments_count + comments.length} comments
          </p>
        </button>
      )}

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Existing local comments */}
            {comments.length > 0 && (
              <div className="px-3 pb-2 space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0 mt-0.5">
                      {c.author[0]}
                    </div>
                    <div>
                      <p className="text-[12px] text-foreground">
                        <span className="font-semibold mr-1">{c.author}</span>
                        {c.text}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{c.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment input */}
            <div className="flex items-center gap-2 px-3 py-2 border-t border-border/20">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                className="flex-1 text-[13px] bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[44px]"
              />
              {commentText.trim() && (
                <button onClick={submitComment} className="text-primary font-semibold text-[13px] min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Views */}
      {item.media_type === "video" && item.views_count > 0 && (
        <div className="px-3 pb-2 flex items-center gap-1">
          <Eye className="h-3 w-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">{item.views_count.toLocaleString()} views</p>
        </div>
      )}
    </div>
  );
}
