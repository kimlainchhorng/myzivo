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
    { label: "WhatsApp", color: "#25D366", svg: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z", url: `https://wa.me/?text=${shareText}%20${shareEncodedUrl}` },
    { label: "Telegram", color: "#0088CC", svg: "M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z", url: `https://t.me/share/url?url=${shareEncodedUrl}&text=${shareText}` },
    { label: "Facebook", color: "#1877F2", svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", url: `https://www.facebook.com/sharer/sharer.php?u=${shareEncodedUrl}` },
    { label: "X", color: "#000000", svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", url: `https://x.com/intent/tweet?text=${shareText}&url=${shareEncodedUrl}` },
    { label: "Email", color: "#EA4335", svg: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z", url: `mailto:?subject=${shareText}&body=${shareEncodedUrl}` },
    { label: "SMS", color: "#34B7F1", svg: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z", url: `sms:?body=${shareText}%20${shareEncodedUrl}` },
  ];

  const moreShareOptions = [
    { label: "TikTok", color: "#000000", svg: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", url: `https://www.tiktok.com/` },
    { label: "Instagram", color: "#E4405F", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", url: `https://www.instagram.com/` },
    { label: "Snapchat", color: "#FFFC00", svg: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z", url: `https://www.snapchat.com/` },
    { label: "LinkedIn", color: "#0A66C2", svg: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareEncodedUrl}` },
    { label: "Pinterest", color: "#E60023", svg: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z", url: `https://pinterest.com/pin/create/button/?url=${shareEncodedUrl}&description=${shareText}` },
    { label: "Reddit", color: "#FF4500", svg: "M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.462.342.342 0 00-.462 0c-.545.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.205-.095z", url: `https://reddit.com/submit?url=${shareEncodedUrl}&title=${shareText}` },
  ];

  const [showMoreOptions, setShowMoreOptions] = useState(false);

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

      {/* Share Sheet */}
      <AnimatePresence>
        {showShareSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setShowShareSheet(false); }}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="w-full max-w-lg bg-card rounded-t-2xl pb-8"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <h3 className="text-sm font-bold text-foreground">Share to</h3>
                <button onClick={() => setShowShareSheet(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <XIcon className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 px-6 py-5">
                {shareOptions.map((opt) => (
                  <a
                    key={opt.label}
                    href={opt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareSheet(false)}
                    className="flex flex-col items-center gap-2 min-h-[48px]"
                  >
                    <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${opt.color}15` }}>
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={opt.color}><path d={opt.svg} /></svg>
                    </div>
                    <span className="text-[10px] font-medium text-foreground">{opt.label}</span>
                  </a>
                ))}
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 min-h-[48px]"
                >
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                  </div>
                  <span className="text-[10px] font-medium text-foreground">Copy link</span>
                </button>
                {/* More toggle */}
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="flex flex-col items-center gap-2 min-h-[48px]"
                >
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-foreground">{showMoreOptions ? "Less" : "More"}</span>
                </button>
              </div>

              {/* Expanded more options */}
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
                        <a
                          key={opt.label}
                          href={opt.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowShareSheet(false)}
                          className="flex flex-col items-center gap-2 min-h-[48px]"
                        >
                          <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${opt.color}15` }}>
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill={opt.color}><path d={opt.svg} /></svg>
                          </div>
                          <span className="text-[10px] font-medium text-foreground">{opt.label}</span>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
