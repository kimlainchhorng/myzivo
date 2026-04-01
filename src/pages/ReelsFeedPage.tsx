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
  Flag, Bell, BellOff, Link2, EyeOff, AlertTriangle, ShieldAlert,
  UserX, Ban, Skull, HelpCircle, ChevronLeft, MessageSquareOff,
  MessageSquare, UserCheck, Settings2, Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  store_slug?: string;
  created_at: string;
  // Interaction controls from profile
  comment_control?: "everyone" | "friends" | "off";
  hide_like_counts?: boolean;
  allow_sharing?: boolean;
  allow_mentions?: boolean;
}

export default function ReelsFeedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string | null } | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // User search with debounce
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const words = q.trim().toLowerCase().split(/\s+/);
        let query = supabase.from("profiles").select("id, full_name, avatar_url").limit(20);
        words.forEach((w) => { query = query.ilike("full_name", `%${w}%`); });
        const { data } = await query;
        setSearchResults(data || []);
      } catch { setSearchResults([]); }
      setSearchLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

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
          .select("id, name, logo_url, slug")
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
            store_slug: store?.slug || null,
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
            .select("id, first_name, last_name, avatar_url, comment_control, hide_like_counts, allow_sharing, allow_mentions")
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
              comment_control: profile?.comment_control || "everyone",
              hide_like_counts: profile?.hide_like_counts || false,
              allow_sharing: profile?.allow_sharing !== false,
              allow_mentions: profile?.allow_mentions !== false,
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
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 px-4 py-2.5 flex items-center justify-between" style={{ paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.625rem), 0.625rem)' }}>
        <h1 className="text-lg font-bold text-foreground">Feed</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <Search className="h-4.5 w-4.5 text-foreground" />
          </button>
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
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30" style={{ paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 0.5rem)' }}>
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search people..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-full bg-muted/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <XIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : !searchQuery.trim() ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50">
                  <Search className="h-8 w-8 mb-2" />
                  <p className="text-sm">Search for people by name</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50">
                  <p className="text-sm">No results found</p>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {searchResults.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); navigate(`/user/${p.id}`); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-11 w-11 border-2 border-border/30">
                        <AvatarImage src={p.avatar_url || undefined} />
                        <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                          {(p.full_name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.full_name || "Unknown"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          {items.map((item, idx) => (
            <FeedCard key={item.id} item={item} currentUserId={userId} onOpenFullscreen={() => setFullscreenIndex(idx)} />
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

function FeedCard({ item, currentUserId, onOpenFullscreen }: { item: FeedItem; currentUserId: string | null; onOpenFullscreen?: () => void }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportStep, setReportStep] = useState<"categories" | "sub" | "submitted">("categories");
  const [reportCategory, setReportCategory] = useState("");
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [commentSetting, setCommentSetting] = useState<"everyone" | "friends" | "off">(item.comment_control || "everyone");
  const [showCommentSettings, setShowCommentSettings] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ id: string; text: string; author: string; time: string }[]>([]);
  const [localLikes, setLocalLikes] = useState(item.likes_count);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId && item.author_id === currentUserId;

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
    { label: "WhatsApp", color: "#25D366", svg: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488 11.821 11.821 0 0012.05 0zm0 21.785a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 012.15 11.892C2.15 6.443 6.602 1.992 12.053 1.992a9.84 9.84 0 016.988 2.899 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.9-9.884 9.9z", url: `https://wa.me/?text=${shareText}%20${shareEncodedUrl}` },
    { label: "Telegram", color: "#0088CC", svg: "M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm5.091 8.104l-1.681 7.927c-.128.564-.46.701-.931.437l-2.57-1.894-1.24 1.193c-.137.137-.253.253-.519.253l.185-2.618 4.763-4.303c.207-.184-.045-.286-.321-.102l-5.889 3.71-2.537-.793c-.552-.172-.563-.552.115-.817l9.915-3.822c.459-.166.861.112.71.827z", url: `https://t.me/share/url?url=${shareEncodedUrl}&text=${shareText}` },
    { label: "Facebook", color: "#1877F2", svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", url: `https://www.facebook.com/sharer/sharer.php?u=${shareEncodedUrl}` },
    { label: "X", color: "#000000", svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", url: `https://x.com/intent/tweet?text=${shareText}&url=${shareEncodedUrl}` },
    { label: "Email", color: "#EA4335", svg: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z", url: `mailto:?subject=${shareText}&body=${shareEncodedUrl}` },
    { label: "SMS", color: "#34B7F1", svg: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z", url: `sms:?body=${shareText}%20${shareEncodedUrl}` },
  ];

  const moreShareOptions = [
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
    if (commentSetting === "off") {
      toast.error("Comments are turned off for this post");
      return;
    }
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
      <div className="flex items-center">
      <button
        type="button"
        onClick={() => {
          if (item.source === "store" && item.store_slug) {
            navigate(`/grocery/shop/${item.store_slug}`);
          } else if (item.author_id) {
            navigate(`/user/${item.author_id}`);
          }
        }}
        className="flex items-center gap-3 px-3 py-2.5 flex-1 min-w-0 active:opacity-70"
      >
        <div className="h-9 w-9 rounded-full overflow-hidden bg-muted border border-border/30 shrink-0">
          {item.author_avatar ? (
            <img src={item.author_avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs font-bold">
              {item.author_name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[13px] font-semibold text-foreground truncate">{item.author_name}</p>
          <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
        </div>
      </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowPostMenu(true); }}
          className="p-1.5 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
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
            <button
              onClick={(e) => { e.stopPropagation(); onOpenFullscreen?.(); }}
              className="absolute bottom-3 left-3 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center min-h-[44px] min-w-[44px]"
            >
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </>
        ) : (
          <img
            src={mediaUrl}
            alt={item.caption || ""}
            className="h-full w-full object-cover cursor-pointer"
            loading="lazy"
            onClick={() => setShowFullscreen(true)}
          />
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
          {commentSetting !== "off" && (
            <button onClick={handleComment} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground">
              <MessageCircle className="h-6 w-6" />
            </button>
          )}
          {item.allow_sharing !== false && (
            <button onClick={handleShare} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground">
              <Share2 className="h-6 w-6" />
            </button>
          )}
        </div>
        <button onClick={handleSave} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Bookmark className={cn("h-6 w-6 transition-all", saved ? "text-foreground fill-foreground" : "text-foreground")} />
        </button>
      </div>

      {/* Likes */}
      {localLikes > 0 && !item.hide_like_counts && (
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

      {/* Comments count or off indicator */}
      {commentSetting === "off" ? (
        <div className="px-3 pb-2 flex items-center gap-1.5">
          <MessageSquareOff className="h-3.5 w-3.5 text-muted-foreground/60" />
          <p className="text-[12px] text-muted-foreground/60">Comments are turned off</p>
        </div>
      ) : (item.comments_count > 0 || comments.length > 0) ? (
        <button onClick={handleComment} className="px-3 pb-2">
          <p className="text-[12px] text-muted-foreground">
            View all {item.comments_count + comments.length} comments
          </p>
        </button>
      ) : null}

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
                  <button
                    key={opt.label}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowShareSheet(false);
                      import("@/lib/openExternalUrl").then(({ openExternalUrl }) => openExternalUrl(opt.url));
                    }}
                    className="flex flex-col items-center gap-2 min-h-[48px]"
                  >
                    <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${opt.color}15` }}>
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={opt.color}><path d={opt.svg} /></svg>
                    </div>
                    <span className="text-[10px] font-medium text-foreground">{opt.label}</span>
                  </button>
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
                        <button
                          key={opt.label}
                          onClick={(e) => {
                            e.preventDefault();
                            setShowShareSheet(false);
                            if (opt.url === "__copy__") {
                              handleCopyLink();
                              toast.success((opt as any).copyMessage || "Link copied!");
                            } else {
                              import("@/lib/openExternalUrl").then(({ openExternalUrl }) => openExternalUrl(opt.url));
                            }
                          }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Options Menu */}
      <AnimatePresence>
        {showPostMenu && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40"
            onClick={() => setShowPostMenu(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-2xl pb-8 overflow-hidden"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="px-2">
                <button
                  onClick={() => { setShowPostMenu(false); setShowReportSheet(true); setReportStep("categories"); setReportCategory(""); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  <Flag className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Report</span>
                </button>
                <button
                  onClick={() => { setNotificationsOn(!notificationsOn); setShowPostMenu(false); toast.success(notificationsOn ? "Notifications turned off" : "Notifications turned on for this post"); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  {notificationsOn ? <BellOff className="h-5 w-5 text-foreground" /> : <Bell className="h-5 w-5 text-foreground" />}
                  <span className="text-sm font-medium text-foreground">{notificationsOn ? "Turn off notifications" : "Turn on notifications"}</span>
                </button>
                <button
                  onClick={() => { setShowPostMenu(false); handleCopyLink(); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  <Link2 className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Copy link</span>
                </button>
                <button
                  onClick={() => { setShowPostMenu(false); toast.success("You won't see posts like this anymore"); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  <EyeOff className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Not interested</span>
                </button>

                {/* Owner-only: Comment settings */}
                {isOwner && (
                  <button
                    onClick={() => { setShowPostMenu(false); setShowCommentSettings(true); }}
                    className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                  >
                    <Settings2 className="h-5 w-5 text-foreground" />
                    <span className="text-sm font-medium text-foreground">Comment settings</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Sheet */}
      <AnimatePresence>
        {showReportSheet && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] flex items-end justify-center bg-black/40"
            onClick={() => setShowReportSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-2xl pb-8 overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {reportStep === "categories" ? (
                <>
                  <div className="flex items-center px-4 pb-3">
                    <button onClick={() => setShowReportSheet(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h3 className="flex-1 text-center text-base font-bold text-foreground pr-11">Report</h3>
                  </div>
                  <p className="px-6 pb-4 text-xs text-muted-foreground">Why are you reporting this post? Your report is anonymous.</p>
                  <div className="overflow-y-auto px-2 flex-1">
                    {[
                      { icon: AlertTriangle, label: "Spam" , desc: "Misleading or repetitive content" },
                      { icon: ShieldAlert, label: "Scam or fraud", desc: "Trying to steal money or personal info" },
                      { icon: UserX, label: "Fake account", desc: "Pretending to be someone else" },
                      { icon: Ban, label: "Harassment or bullying", desc: "Targeting or intimidating someone" },
                      { icon: Skull, label: "Violence or dangerous acts", desc: "Threatening or promoting violence" },
                      { icon: EyeOff, label: "Nudity or sexual content", desc: "Inappropriate images or language" },
                      { icon: Flag, label: "Hate speech", desc: "Attacking a group or individual" },
                      { icon: ShieldAlert, label: "Intellectual property", desc: "Using content without permission" },
                      { icon: HelpCircle, label: "Something else", desc: "Other issue not listed above" },
                    ].map((r) => (
                      <button
                        key={r.label}
                        onClick={() => { setReportCategory(r.label); setReportStep("sub"); }}
                        className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px] text-left"
                      >
                        <r.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{r.label}</p>
                          <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90 shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              ) : reportStep === "sub" ? (
                <>
                  <div className="flex items-center px-4 pb-3">
                    <button onClick={() => setReportStep("categories")} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h3 className="flex-1 text-center text-base font-bold text-foreground pr-11">{reportCategory}</h3>
                  </div>
                  <p className="px-6 pb-4 text-xs text-muted-foreground">Select the option that best describes the issue.</p>
                  <div className="overflow-y-auto px-2 flex-1">
                    {((): { label: string }[] => {
                      const subMap: Record<string, string[]> = {
                        "Spam": ["Promotional content", "Repetitive posts", "Bot activity", "Clickbait", "Misleading information"],
                        "Scam or fraud": ["Phishing attempt", "Financial scam", "Fake giveaway", "Identity theft", "Cryptocurrency scam", "Impersonating a business"],
                        "Fake account": ["Impersonating me", "Impersonating someone I know", "Impersonating a celebrity", "Impersonating a business or brand", "Bot or fake engagement"],
                        "Harassment or bullying": ["Threatening language", "Unwanted contact", "Intimidation", "Stalking behavior", "Revealing private info (doxxing)", "Encouraging self-harm"],
                        "Violence or dangerous acts": ["Graphic violence", "Threatening harm", "Glorifying violence", "Dangerous challenges", "Animal cruelty", "Terrorist content"],
                        "Nudity or sexual content": ["Nudity", "Sexual activity", "Sexual exploitation", "Non-consensual imagery", "Content involving minors"],
                        "Hate speech": ["Racism", "Religious discrimination", "Sexism or misogyny", "Homophobia or transphobia", "Disability discrimination", "Xenophobia"],
                        "Intellectual property": ["Copyright infringement", "Trademark violation", "Stolen content", "Unauthorized use of my work"],
                        "Something else": ["Misinformation", "Self-injury or suicide", "Drug sales", "Unauthorized sales", "Privacy violation", "Other"],
                      };
                      return (subMap[reportCategory] || ["Other"]).map((s) => ({ label: s }));
                    })().map((sub) => (
                      <button
                        key={sub.label}
                        onClick={() => setReportStep("submitted")}
                        className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px] text-left"
                      >
                        <span className="text-sm font-medium text-foreground">{sub.label}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90 shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Flag className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Thanks for reporting</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-[260px]">
                    We'll review this post and take action if it violates our community guidelines.
                  </p>
                  <button
                    onClick={() => setShowReportSheet(false)}
                    className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm min-h-[48px]"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Settings Sheet (Owner only) */}
      <AnimatePresence>
        {showCommentSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-end justify-center bg-black/40"
            onClick={() => setShowCommentSettings(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-2xl pb-8 overflow-hidden"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center px-4 pb-3">
                <button onClick={() => setShowCommentSettings(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <h3 className="flex-1 text-center text-base font-bold text-foreground pr-11">Comment Settings</h3>
              </div>
              <p className="px-6 pb-4 text-xs text-muted-foreground">Choose who can comment on this post.</p>
              <div className="px-2 space-y-1">
                {([
                  { value: "everyone" as const, icon: Globe, label: "Everyone", desc: "Anyone can comment on this post" },
                  { value: "friends" as const, icon: UserCheck, label: "Friends only", desc: "Only your friends can comment" },
                  { value: "off" as const, icon: MessageSquareOff, label: "Turn off comments", desc: "No one can comment on this post" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setCommentSetting(opt.value);
                      setShowCommentSettings(false);
                      if (opt.value === "off") setShowComments(false);
                      toast.success(
                        opt.value === "everyone" ? "Comments open for everyone" :
                        opt.value === "friends" ? "Only friends can comment now" :
                        "Comments turned off"
                      );
                    }}
                    className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                  >
                    <opt.icon className={cn("h-5 w-5", commentSetting === opt.value ? "text-primary" : "text-foreground")} />
                    <div className="flex-1 text-left">
                      <span className={cn("text-sm font-medium", commentSetting === opt.value ? "text-primary" : "text-foreground")}>{opt.label}</span>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                    </div>
                    {commentSetting === opt.value && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Media Viewer */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            onClick={() => setShowFullscreen(false)}
          >
            {/* Close button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4" style={{ paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 0.75rem)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowFullscreen(false); }}
                className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <XIcon className="h-5 w-5 text-white" />
              </button>
              <span className="text-white/70 text-xs font-medium">
                {item.media_urls.length > 1 ? `${currentMedia + 1} / ${item.media_urls.length}` : ''}
              </span>
              <div className="w-10" />
            </div>

            {/* Media content */}
            <div className="flex-1 flex items-center justify-center min-h-0" onClick={(e) => e.stopPropagation()}>
              {item.media_type === "video" ? (
                <video
                  src={item.media_urls[currentMedia] || item.media_urls[0]}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-full max-w-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={item.media_urls[currentMedia] || item.media_urls[0]}
                  alt={item.caption || ""}
                  className="max-h-full max-w-full object-contain select-none"
                  draggable={false}
                />
              )}
            </div>

            {/* Multi-image nav dots */}
            {item.media_urls.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 pb-8" style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1.5rem), 2rem)' }}>
                {item.media_urls.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentMedia(i); }}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === currentMedia ? "w-6 bg-primary" : "w-2 bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Swipe areas for multi-image */}
            {item.media_urls.length > 1 && (
              <>
                {currentMedia > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentMedia(currentMedia - 1); }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-32 w-16 flex items-center justify-center"
                  >
                    <ChevronLeft className="h-8 w-8 text-white/70" />
                  </button>
                )}
                {currentMedia < item.media_urls.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentMedia(currentMedia + 1); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-32 w-16 flex items-center justify-center rotate-180"
                  >
                    <ChevronLeft className="h-8 w-8 text-white/70" />
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
