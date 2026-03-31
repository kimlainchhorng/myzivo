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
  Plus, Camera, X as XIcon, Send,
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
        supabase.from("profiles").select("first_name, last_name, avatar_url").eq("id", uid).maybeSingle()
          .then(({ data: p }) => {
            if (p) setUserProfile({
              name: `${(p as any).first_name || ""} ${(p as any).last_name || ""}`.trim() || "You",
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
          <p className="text-sm text-muted-foreground">What's on your mind?</p>
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
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-auto"
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

        {/* Media preview / picker */}
        {preview ? (
          <div className="relative mx-4 mb-4 rounded-xl overflow-hidden bg-black aspect-square">
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
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="mx-4 mb-4 w-[calc(100%-2rem)] aspect-video rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Tap to add photo or video</p>
          </button>
        )}

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
        <button className="p-1.5 text-muted-foreground hover:text-foreground">
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
              className="absolute bottom-3 right-3 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5 text-white" /> : <Volume2 className="h-3.5 w-3.5 text-white" />}
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
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => setLiked(!liked)} className="group">
            <Heart className={cn("h-6 w-6 transition-all", liked ? "text-red-500 fill-red-500 scale-110" : "text-foreground group-active:scale-125")} />
          </button>
          <button className="text-foreground"><MessageCircle className="h-6 w-6" /></button>
          <button className="text-foreground"><Share2 className="h-6 w-6" /></button>
        </div>
        <button onClick={() => setSaved(!saved)}>
          <Bookmark className={cn("h-6 w-6 transition-all", saved ? "text-foreground fill-foreground" : "text-foreground")} />
        </button>
      </div>

      {/* Likes */}
      {(item.likes_count > 0 || liked) && (
        <div className="px-3 pb-1">
          <p className="text-[13px] font-semibold text-foreground">
            {(item.likes_count + (liked ? 1 : 0)).toLocaleString()} likes
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

      {/* Comments */}
      {item.comments_count > 0 && (
        <button className="px-3 pb-2">
          <p className="text-[12px] text-muted-foreground">View all {item.comments_count} comments</p>
        </button>
      )}

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
