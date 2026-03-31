/**
 * ReelsFeedPage — Instagram Explore-style grid of photos & videos
 * Shows content from store_posts and user_posts in a masonry-like grid
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStorePostMediaUrl } from "@/utils/normalizeStorePostMediaUrl";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { Loader2, Play, Heart, Eye, Image as ImageIcon, Film, Search } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FeedItem {
  id: string;
  source: "store" | "user";
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  likes_count: number;
  views_count: number;
  author_name: string;
  author_avatar: string | null;
  created_at: string;
}

type FilterTab = "all" | "photos" | "videos";

export default function ReelsFeedPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
        .limit(60);

      if (storePosts?.length) {
        const storeIds = [...new Set(storePosts.map((p: any) => p.store_id))];
        const { data: stores } = await supabase
          .from("store_profiles")
          .select("id, name, logo_url")
          .in("id", storeIds);
        const storeMap = new Map((stores || []).map((s: any) => [s.id, s]));

        for (const post of storePosts as any[]) {
          const store = storeMap.get(post.store_id);
          const urls: string[] = post.media_urls || [];
          const firstUrl = urls[0];
          if (!firstUrl) continue;

          allItems.push({
            id: post.id,
            source: "store",
            media_url: normalizeStorePostMediaUrl(firstUrl),
            media_type: (post.media_type === "video" || firstUrl.match(/\.(mp4|mov|webm)/i)) ? "video" : "image",
            caption: post.caption,
            likes_count: post.likes_count || 0,
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
          .select("id, media_url, media_type, caption, likes_count, views_count, created_at, user_id")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(60);

        if (userPosts?.length) {
          const userIds = [...new Set(userPosts.map((p: any) => p.user_id))];
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
              media_url: post.media_url,
              media_type: post.media_type === "video" ? "video" : "image",
              caption: post.caption,
              likes_count: post.likes_count || 0,
              views_count: post.views_count || 0,
              author_name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User" : "User",
              author_avatar: profile?.avatar_url || null,
              created_at: post.created_at,
            });
          }
        }
      } catch {}

      // Shuffle/interleave and sort by date
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return allItems;
    },
    staleTime: 30_000,
  });

  const filtered = items.filter((item) => {
    if (filter === "photos" && item.media_type !== "image") return false;
    if (filter === "videos" && item.media_type !== "video") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (item.caption?.toLowerCase().includes(q) || item.author_name.toLowerCase().includes(q));
    }
    return true;
  });

  const tabs: { key: FilterTab; label: string; icon: typeof Film }[] = [
    { key: "all", label: "All", icon: ImageIcon },
    { key: "videos", label: "Videos", icon: Film },
    { key: "photos", label: "Photos", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-full bg-muted/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-4 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground/60">
          <ImageIcon className="h-10 w-10 mb-2" />
          <p className="text-sm">No posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {filtered.map((item, i) => (
            <GridItem key={item.id} item={item} index={i} onClick={() => navigate("/feed")} />
          ))}
        </div>
      )}

      <ZivoMobileNav />
    </div>
  );
}

function GridItem({ item, index, onClick }: { item: FeedItem; index: number; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (item.media_type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [item.media_type]);

  const handleMouseLeave = useCallback(() => {
    if (item.media_type === "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [item.media_type]);

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-square overflow-hidden bg-muted/30 group"
    >
      {item.media_type === "video" ? (
        <>
          <video
            ref={videoRef}
            src={item.media_url}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setLoaded(true)}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
            <Play className="h-3 w-3 text-white fill-white" />
          </div>
        </>
      ) : (
        <img
          src={item.media_url}
          alt={item.caption || ""}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="h-full w-full object-cover"
        />
      )}

      {/* Hover overlay with stats */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <span className="flex items-center gap-1 text-white text-xs font-bold">
          <Heart className="h-4 w-4 fill-white" />
          {item.likes_count}
        </span>
        {item.views_count > 0 && (
          <span className="flex items-center gap-1 text-white text-xs font-bold">
            <Eye className="h-4 w-4" />
            {item.views_count}
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </motion.button>
  );
}
