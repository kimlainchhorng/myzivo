/**
 * ExplorePage — Discover users, trending posts, hashtags, and nearby places
 * Features: search, trending grid, hashtag browsing, map toggle
 */
import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, TrendingUp, Hash, MapPin, Users, Grid3X3, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { normalizeStorePostMediaUrl } from "@/utils/normalizeStorePostMediaUrl";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import PullToRefresh from "@/components/shared/PullToRefresh";
import VerifiedBadge from "@/components/VerifiedBadge";
import { isBlueVerified } from "@/lib/verification";

type Tab = "trending" | "users" | "hashtags";

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("trending");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag) {
      setActiveTab("hashtags");
      setSelectedTag(tag);
    }
  }, [searchParams]);

  // Trending posts
  const { data: trendingPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["explore-trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_posts")
        .select("id, media_urls, media_type, caption, likes_count, comments_count, created_at")
        .eq("is_published", true)
        .order("likes_count", { ascending: false })
        .limit(30);
      return (data || []).map((p: any) => ({
        ...p,
        media_urls: Array.isArray(p.media_urls) ? p.media_urls : typeof p.media_urls === "string" ? [p.media_urls] : [],
      }));
    },
  });

  // User search
  const { data: searchResults = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["explore-users", search],
    queryFn: async () => {
      if (!search.trim()) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_verified")
        .ilike("full_name", `%${search}%`)
        .limit(20);
      return data || [];
    },
    enabled: search.length > 1,
  });

  // Suggested users for People tab
  const { data: suggestedUsers = [], isLoading: loadingSuggested } = useQuery({
    queryKey: ["explore-suggested-users", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_verified, bio")
        .not("id", "eq", user?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: activeTab === "users" && !search,
  });

  // Posts filtered by selected hashtag
  const { data: taggedPosts = [], isLoading: loadingTagged } = useQuery({
    queryKey: ["explore-tagged", selectedTag],
    queryFn: async () => {
      if (!selectedTag) return [];
      const { data } = await supabase
        .from("store_posts")
        .select("id, media_urls, media_type, caption, likes_count")
        .eq("is_published", true)
        .ilike("caption", `%#${selectedTag}%`)
        .order("likes_count", { ascending: false })
        .limit(30);
      return (data || []).map((p: any) => ({
        ...p,
        media_urls: Array.isArray(p.media_urls) ? p.media_urls : typeof p.media_urls === "string" ? [p.media_urls] : [],
      }));
    },
    enabled: !!selectedTag,
  });

  // Hashtags — extracted from post captions via Supabase
  const { data: trendingHashtags = [] } = useQuery({
    queryKey: ["explore-hashtags"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("store_posts")
        .select("caption")
        .eq("is_published", true)
        .not("caption", "is", null)
        .limit(500);
      const counts: Record<string, number> = {};
      (data || []).forEach((p: any) => {
        const tags = (p.caption as string).match(/#(\w+)/g) ?? [];
        tags.forEach((t: string) => {
          const tag = t.slice(1).toLowerCase();
          counts[tag] = (counts[tag] ?? 0) + 1;
        });
      });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count }));
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: [
      { tag: "travel", count: 1240 }, { tag: "food", count: 980 },
      { tag: "zivo", count: 870 }, { tag: "adventure", count: 650 },
      { tag: "photography", count: 540 }, { tag: "nature", count: 430 },
      { tag: "citylife", count: 380 }, { tag: "sunset", count: 320 },
      { tag: "foodie", count: 290 }, { tag: "wanderlust", count: 260 },
    ],
  });

  const tabs: { id: Tab; label: string; icon: typeof TrendingUp }[] = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "users", label: "People", icon: Users },
    { id: "hashtags", label: "Tags", icon: Hash },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEOHead
        title="Explore – ZIVO | Discover People, Places & Trending Content"
        description="Explore trending posts, discover new people, browse hashtags, and find places near you on ZIVO."
        canonical="/explore"
        ogImage="/og-explore.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Explore ZIVO",
          "description": "Discover people, trending content, and places on ZIVO",
        }}
      />
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people, posts, tags..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <PullToRefresh onRefresh={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["explore-trending"] }),
          queryClient.invalidateQueries({ queryKey: ["explore-hashtags"] }),
          queryClient.invalidateQueries({ queryKey: ["explore-suggested-users"] }),
        ]);
      }}>
        {/* Search results */}
        {search.length > 1 && (
          <div className="p-4 space-y-2">
            {loadingUsers && <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />}
            {searchResults.map((u: any) => (
              <button
                key={u.id}
                onClick={() => navigate(`/profile/${u.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback>{(u.full_name || "U")[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground inline-flex items-center gap-1 min-w-0">
                  <span className="truncate">{u.full_name || "Unknown"}</span>
                  {isBlueVerified((u as any).is_verified) && <VerifiedBadge size={13} interactive={false} />}
                </span>
              </button>
            ))}
            {!loadingUsers && searchResults.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
            )}
          </div>
        )}

        {/* Trending grid */}
        {!search && activeTab === "trending" && (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {loadingPosts && (
              <div className="col-span-3 flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {trendingPosts.map((post: any, i: number) => {
              const isLarge = i % 7 === 0;
              const url = post.media_urls[0] ? normalizeStorePostMediaUrl(post.media_urls[0]) : "";
              return (
                <motion.button
                  key={post.id}
                  className={cn(
                    "relative aspect-square bg-muted overflow-hidden",
                    isLarge && "col-span-2 row-span-2"
                  )}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/reels/${post.id}`)}
                >
                  {url && (
                    post.media_type === "video" ? (
                      <video src={`${url}#t=0.1`} muted className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )
                  )}
                  {!url && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Grid3X3 className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* People tab */}
        {!search && activeTab === "users" && (
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">Suggested for you</h3>
            {loadingSuggested && <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />}
            {suggestedUsers.map((u: any) => (
              <button
                key={u.id}
                onClick={() => navigate(`/profile/${u.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-colors text-left"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback>{(u.full_name || "U")[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground inline-flex items-center gap-1">
                    <span className="truncate">{u.full_name || "Unknown"}</span>
                    {isBlueVerified((u as any).is_verified) && <VerifiedBadge size={13} interactive={false} />}
                  </span>
                  {u.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{u.bio}</p>}
                </div>
              </button>
            ))}
            {!loadingSuggested && suggestedUsers.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No suggestions yet</p>
            )}
          </div>
        )}

        {/* Hashtags tab */}
        {!search && activeTab === "hashtags" && (
          <div className="p-4 space-y-2">
            {selectedTag && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">#{selectedTag}</h3>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Clear
                  </button>
                </div>
                {loadingTagged && <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />}
                {!loadingTagged && taggedPosts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No posts found for #{selectedTag}</p>
                )}
                {taggedPosts.length > 0 && (
                  <div className="grid grid-cols-3 gap-0.5 -mx-4">
                    {taggedPosts.map((post: any) => {
                      const url = post.media_urls[0] ? normalizeStorePostMediaUrl(post.media_urls[0]) : "";
                      return (
                        <motion.button
                          key={post.id}
                          className="relative aspect-square bg-muted overflow-hidden"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => navigate(`/reels/${post.id}`)}
                        >
                          {url && (post.media_type === "video"
                            ? <video src={`${url}#t=0.1`} muted className="w-full h-full object-cover" />
                            : <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          )}
                          {!url && <div className="w-full h-full flex items-center justify-center"><Grid3X3 className="h-6 w-6 text-muted-foreground/30" /></div>}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {!selectedTag && trendingHashtags.map((h) => (
              <button
                key={h.tag}
                onClick={() => setSelectedTag(h.tag)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 hover:bg-accent/50 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">#{h.tag}</p>
                  <p className="text-xs text-muted-foreground">{h.count.toLocaleString()} posts</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </PullToRefresh>

      <ZivoMobileNav />
    </div>
  );
}
