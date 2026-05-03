/**
 * TrendingPage — Discover what's popular right now
 * Tabs: Posts · Hashtags · People · Communities
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { optimizeAvatar } from "@/utils/optimizeAvatar";
import { isBlueVerified } from "@/lib/verification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import SEOHead from "@/components/SEOHead";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Hash from "lucide-react/dist/esm/icons/hash";
import Users from "lucide-react/dist/esm/icons/users";
import Heart from "lucide-react/dist/esm/icons/heart";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Eye from "lucide-react/dist/esm/icons/eye";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import Flame from "lucide-react/dist/esm/icons/flame";
import VerifiedBadge from "@/components/VerifiedBadge";

type Tab = "posts" | "hashtags" | "people" | "communities";

function extractHashtags(caption: string | null): string[] {
  if (!caption) return [];
  return (caption.match(/#[\w一-鿿؀-ۿ]+/g) || []).map((t) => t.toLowerCase());
}

export default function TrendingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("posts");

  /* ── Trending Posts (user + store merged) ── */
  const { data: userPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["trending-user-posts"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("user_posts")
        .select("id, caption, media_urls, media_type, likes_count, comments_count, views_count, created_at, user_id, profiles:profiles(full_name, avatar_url, is_verified)")
        .order("likes_count", { ascending: false })
        .limit(30);
      return (data || []).map((p: any) => ({
        id: `u-${p.id}`,
        rawId: p.id,
        caption: p.caption,
        media_urls: p.media_urls || [],
        media_type: p.media_type,
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        views_count: p.views_count || 0,
        created_at: p.created_at,
        author_name: p.profiles?.full_name || "User",
        author_avatar: p.profiles?.avatar_url || null,
        author_id: p.user_id,
        is_verified: p.profiles?.is_verified,
        source: "user" as const,
      }));
    },
    staleTime: 3 * 60_000,
  });

  const { data: storePosts = [], isLoading: loadingStorePosts } = useQuery({
    queryKey: ["trending-store-posts"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("store_posts")
        .select("id, caption, media_urls, media_type, likes_count, comments_count, views_count, created_at, store_id, store_profiles:store_profiles(name, logo_url)")
        .order("likes_count", { ascending: false })
        .limit(20);
      return (data || []).map((p: any) => ({
        id: `s-${p.id}`,
        rawId: p.id,
        caption: p.caption,
        media_urls: p.media_urls || [],
        media_type: p.media_type,
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        views_count: p.views_count || 0,
        created_at: p.created_at,
        author_name: p.store_profiles?.name || "Shop",
        author_avatar: p.store_profiles?.logo_url || null,
        author_id: p.store_id,
        is_verified: false,
        source: "store" as const,
      }));
    },
    staleTime: 3 * 60_000,
  });

  const trendingPosts = useMemo(
    () => [...userPosts, ...storePosts].sort((a, b) => b.likes_count - a.likes_count).slice(0, 40),
    [userPosts, storePosts]
  );

  /* ── Trending Hashtags ── */
  const { data: hashtagCounts = [], isLoading: loadingTags } = useQuery({
    queryKey: ["trending-hashtags-page"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("user_posts")
        .select("caption, likes_count")
        .order("created_at", { ascending: false })
        .limit(500);
      const counts: Record<string, { count: number; likes: number }> = {};
      (data || []).forEach((p: any) => {
        extractHashtags(p.caption).forEach((tag) => {
          if (!counts[tag]) counts[tag] = { count: 0, likes: 0 };
          counts[tag].count += 1;
          counts[tag].likes += p.likes_count || 0;
        });
      });
      return Object.entries(counts)
        .map(([tag, { count, likes }]) => ({ tag, count, likes }))
        .sort((a, b) => b.count * 2 + b.likes - (a.count * 2 + a.likes))
        .slice(0, 30);
    },
    staleTime: 5 * 60_000,
  });

  /* ── Trending People ── */
  const { data: trendingPeople = [], isLoading: loadingPeople } = useQuery({
    queryKey: ["trending-people"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, avatar_url, bio, is_verified, follower_count, posts_count")
        .order("follower_count", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 5 * 60_000,
  });

  /* ── Trending Communities ── */
  const { data: communities = [], isLoading: loadingCommunities } = useQuery({
    queryKey: ["trending-communities"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("communities")
        .select("id, name, description, avatar_url, member_count, is_verified, category")
        .order("member_count", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 5 * 60_000,
  });

  const tabs: { id: Tab; label: string; icon: typeof TrendingUp }[] = [
    { id: "posts", label: "Posts", icon: Flame },
    { id: "hashtags", label: "Hashtags", icon: Hash },
    { id: "people", label: "People", icon: Users },
    { id: "communities", label: "Communities", icon: Users },
  ];

  const isLoading =
    tab === "posts" ? loadingPosts || loadingStorePosts :
    tab === "hashtags" ? loadingTags :
    tab === "people" ? loadingPeople :
    loadingCommunities;

  return (
    <>
      <SEOHead title="Trending | ZIVO" description="Discover what's trending on ZIVO right now." />

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div
          className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/20"
          style={{ paddingTop: "var(--zivo-safe-top-sticky, env(safe-area-inset-top, 0px))" }}
        >
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted/60 transition-colors">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Trending</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex max-w-2xl mx-auto px-4 gap-1 pb-0">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex-1 py-2.5 text-[13px] font-semibold transition-colors",
                  tab === id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
                {tab === id && (
                  <motion.span
                    layoutId="trending-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-3 p-4"
              >
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
                ))}
              </motion.div>
            ) : tab === "posts" ? (
              <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {trendingPosts.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-muted-foreground/50">
                    <Flame className="h-12 w-12 mb-3" />
                    <p className="text-sm">No trending posts yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {trendingPosts.map((post, idx) => (
                      <button
                        key={post.id}
                        onClick={() => navigate(post.source === "user" ? `/feed?post=${post.rawId}` : `/store/${post.author_id}`)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                      >
                        {/* Rank */}
                        <span className={cn(
                          "shrink-0 w-7 text-center text-sm font-bold mt-1",
                          idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-400" : "text-muted-foreground/40"
                        )}>
                          {idx + 1}
                        </span>

                        {/* Thumbnail */}
                        {post.media_urls[0] ? (
                          <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-muted">
                            {post.media_type === "video" ? (
                              <video src={post.media_urls[0]} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                            )}
                          </div>
                        ) : (
                          <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={optimizeAvatar(post.author_avatar, 20) || undefined} />
                              <AvatarFallback className="text-[8px]">{post.author_name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-medium text-muted-foreground truncate">{post.author_name}</span>
                            {isBlueVerified(post.is_verified) && <VerifiedBadge size={11} interactive={false} />}
                          </div>
                          {post.caption && (
                            <p className="text-sm text-foreground line-clamp-2 mb-1">{post.caption}</p>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Heart className="h-3 w-3 text-rose-500" />
                              {post.likes_count.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MessageCircle className="h-3 w-3" />
                              {post.comments_count.toLocaleString()}
                            </span>
                            {post.views_count > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {post.views_count.toLocaleString()}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground/60 ml-auto">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : tab === "hashtags" ? (
              <motion.div key="hashtags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-4 space-y-2">
                {hashtagCounts.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-muted-foreground/50">
                    <Hash className="h-12 w-12 mb-3" />
                    <p className="text-sm">No hashtags yet</p>
                  </div>
                ) : hashtagCounts.map(({ tag, count, likes }, idx) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/explore?tag=${encodeURIComponent(tag.replace("#", ""))}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted/40 border border-border/20 transition-colors"
                  >
                    <span className={cn(
                      "shrink-0 w-7 text-center text-sm font-bold",
                      idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-400" : "text-muted-foreground/40"
                    )}>
                      {idx + 1}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Hash className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-foreground">{tag}</p>
                      <p className="text-[11px] text-muted-foreground">{count} post{count !== 1 ? "s" : ""} · {likes.toLocaleString()} likes</p>
                    </div>
                    <Flame className={cn("h-4 w-4 shrink-0", idx < 3 ? "text-orange-500" : "text-muted-foreground/30")} />
                  </button>
                ))}
              </motion.div>
            ) : tab === "people" ? (
              <motion.div key="people" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-4 space-y-2">
                {trendingPeople.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-muted-foreground/50">
                    <Users className="h-12 w-12 mb-3" />
                    <p className="text-sm">No people yet</p>
                  </div>
                ) : trendingPeople.map((person: any, idx: number) => (
                  <button
                    key={person.id}
                    onClick={() => navigate(`/user/${person.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted/40 border border-border/20 transition-colors"
                  >
                    <span className={cn(
                      "shrink-0 w-7 text-center text-sm font-bold",
                      idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-400" : "text-muted-foreground/40"
                    )}>
                      {idx + 1}
                    </span>
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarImage src={optimizeAvatar(person.avatar_url, 44) || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {person.full_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-foreground truncate">{person.full_name || "User"}</p>
                        {isBlueVerified(person.is_verified) && <VerifiedBadge size={13} interactive={false} />}
                      </div>
                      {person.bio && <p className="text-[11px] text-muted-foreground truncate">{person.bio}</p>}
                      <p className="text-[11px] text-muted-foreground/70">
                        {person.follower_count > 0
                          ? `${person.follower_count >= 1000 ? `${(person.follower_count / 1000).toFixed(1)}k` : person.follower_count} followers`
                          : "New member"}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div key="communities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-4 space-y-2">
                {communities.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-muted-foreground/50">
                    <Users className="h-12 w-12 mb-3" />
                    <p className="text-sm">No communities yet</p>
                  </div>
                ) : communities.map((c: any, idx: number) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/communities/${c.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted/40 border border-border/20 transition-colors"
                  >
                    <span className={cn(
                      "shrink-0 w-7 text-center text-sm font-bold",
                      idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-400" : "text-muted-foreground/40"
                    )}>
                      {idx + 1}
                    </span>
                    <Avatar className="h-11 w-11 shrink-0 rounded-xl">
                      <AvatarImage src={optimizeAvatar(c.avatar_url, 44) || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-xl">
                        {c.name?.[0]?.toUpperCase() || "G"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                        {c.is_verified && <VerifiedBadge size={13} interactive={false} />}
                      </div>
                      {c.description && <p className="text-[11px] text-muted-foreground truncate">{c.description}</p>}
                      <p className="text-[11px] text-muted-foreground/70">
                        {c.member_count > 0 ? `${c.member_count.toLocaleString()} members` : "New group"}
                        {c.category ? ` · ${c.category}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
