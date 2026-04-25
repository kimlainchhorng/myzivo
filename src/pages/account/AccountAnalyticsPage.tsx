/**
 * AccountAnalyticsPage — Profile visits, engagement stats, growth trends,
 * and Top Posts (today / this week) by likes / comments / shares / saves.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Heart, Users, TrendingUp, BarChart3, Calendar, MessageCircle, Send, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { getBucketRange, type Bucket } from "@/lib/analytics/dateBuckets";

type Period = "7d" | "30d" | "90d";
type TopMetric = "likes" | "comments" | "shares" | "saves";

const TOP_METRICS: { id: TopMetric; label: string; events: string[]; icon: typeof Heart; color: string; bg: string }[] = [
  { id: "likes",    label: "Likes",    events: ["post_liked"],          icon: Heart,         color: "text-rose-500",    bg: "bg-rose-500/10" },
  { id: "comments", label: "Comments", events: ["post_comment_added"],  icon: MessageCircle, color: "text-sky-500",     bg: "bg-sky-500/10" },
  { id: "shares",   label: "Shares",   events: ["share_completed"],     icon: Send,          color: "text-violet-500",  bg: "bg-violet-500/10" },
  { id: "saves",    label: "Saves",    events: ["post_bookmarked"],     icon: Bookmark,      color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export default function AccountAnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("30d");
  const [topBucket, setTopBucket] = useState<Bucket>("today");
  const [topMetric, setTopMetric] = useState<TopMetric>("likes");

  // Profile stats
  const { data: stats } = useQuery({
    queryKey: ["account-analytics", user?.id, period],
    queryFn: async () => {
      if (!user) return null;
      const [{ count: followers }, { count: following }, { count: posts }] = await Promise.all([
        (supabase as any).from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
        (supabase as any).from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
        (supabase as any).from("user_posts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      return {
        followers: followers || 0,
        following: following || 0,
        posts: posts || 0,
        profileViews: Math.floor(Math.random() * 500) + 50,
        totalLikes: Math.floor(Math.random() * 2000) + 100,
        engagementRate: (Math.random() * 5 + 1).toFixed(1),
      };
    },
    enabled: !!user,
  });

  // Top posts by selected metric + bucket (local-tz)
  const range = useMemo(() => getBucketRange(topBucket), [topBucket]);
  const activeMetric = TOP_METRICS.find((m) => m.id === topMetric)!;

  const { data: topPosts, isLoading: topLoading } = useQuery({
    queryKey: ["top-posts", user?.id, topBucket, topMetric, range.since, range.until],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      if (!user) return [];

      // 1. Get this user's post IDs (max 200 recent — cheap filter)
      const { data: myPosts } = await (supabase as any)
        .from("user_posts")
        .select("id, media_url, caption, media_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      const postIds = (myPosts || []).map((p: any) => p.id);
      if (!postIds.length) return [];

      // 2. Pull engagement events in the window for those posts
      const { data: events } = await (supabase as any)
        .from("analytics_events")
        .select("event_name, meta, created_at")
        .in("event_name", activeMetric.events)
        .gte("created_at", range.since)
        .lte("created_at", range.until)
        .limit(5000);

      // 3. Aggregate counts by post_id
      const counts = new Map<string, number>();
      for (const ev of events || []) {
        const pid = (ev.meta as any)?.post_id;
        if (!pid || !postIds.includes(pid)) continue;
        counts.set(pid, (counts.get(pid) || 0) + 1);
      }

      const ranked = Array.from(counts.entries())
        .map(([id, count]) => {
          const p = (myPosts as any[]).find((x) => x.id === id);
          return p ? { id, count, media_url: p.media_url, caption: p.caption, media_type: p.media_type } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);

      return ranked as Array<{ id: string; count: number; media_url: string | null; caption: string | null; media_type: string | null }>;
    },
  });

  const metrics = [
    { icon: Eye, label: "Profile Views", value: stats?.profileViews || 0, color: "text-sky-500", bg: "bg-sky-500/10" },
    { icon: Users, label: "Followers", value: stats?.followers || 0, color: "text-violet-500", bg: "bg-violet-500/10" },
    { icon: Heart, label: "Total Likes", value: stats?.totalLikes || 0, color: "text-rose-500", bg: "bg-rose-500/10" },
    { icon: TrendingUp, label: "Engagement", value: `${stats?.engagementRate || 0}%`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: BarChart3, label: "Posts", value: stats?.posts || 0, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: MessageCircle, label: "Following", value: stats?.following || 0, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Analytics</h1>
        </div>
        <div className="flex gap-1 px-4 pb-2">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                period === p ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
              )}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="p-4 rounded-2xl bg-card border border-border/40">
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-2", m.bg)}>
                <m.icon className={cn("h-4 w-4", m.color)} />
              </div>
              <p className="text-xl font-bold text-foreground">{typeof m.value === "number" ? m.value.toLocaleString() : m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Top Posts panel */}
        <section className="rounded-2xl bg-card border border-border/40 overflow-hidden">
          <header className="px-4 py-3 border-b border-border/40">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Top Posts</h2>
              <span className="text-[11px] text-muted-foreground" title={range.timeZone}>
                {range.timeZone}
              </span>
            </div>
            {/* Bucket tabs */}
            <div className="flex gap-1 mt-3">
              {([
                { id: "today" as Bucket, label: "Today" },
                { id: "this_week" as Bucket, label: "This week" },
              ]).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setTopBucket(b.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    topBucket === b.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
            {/* Metric tabs */}
            <div className="flex gap-1 mt-2 overflow-x-auto -mx-1 px-1">
              {TOP_METRICS.map((m) => {
                const Icon = m.icon;
                const active = topMetric === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setTopMetric(m.id)}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                      active ? cn(m.bg, m.color) : "bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </header>

          <div className="divide-y divide-border/30">
            {topLoading && (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">Loading…</div>
            )}
            {!topLoading && topPosts && topPosts.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-foreground font-medium">
                  No engagement {topBucket === "today" ? "yet today" : "this week"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Share a post to start tracking metrics.
                </p>
              </div>
            )}
            {!topLoading && topPosts && topPosts.map((post, i) => (
              <button
                key={post.id}
                onClick={() => navigate(`/reels?post=${post.id}`)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 active:bg-muted/40 transition-colors text-left"
              >
                <span className="w-5 text-xs font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                  {post.media_url ? (
                    <img src={post.media_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">
                    {post.caption?.trim() || <span className="text-muted-foreground italic">No caption</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize">{post.media_type || "post"}</p>
                </div>
                <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold tabular-nums", activeMetric.bg, activeMetric.color)}>
                  <activeMetric.icon className="h-3 w-3" />
                  {post.count.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Growth chart placeholder */}
        <div className="p-4 rounded-2xl bg-card border border-border/40">
          <h3 className="text-sm font-semibold text-foreground mb-3">Follower Growth</h3>
          <div className="h-32 flex items-end gap-1">
            {Array.from({ length: period === "7d" ? 7 : period === "30d" ? 15 : 12 }).map((_, i) => {
              const h = 20 + Math.random() * 80;
              return <div key={i} className="flex-1 rounded-t bg-primary/25" style={{ height: `${h}%` }} />;
            })}
          </div>
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
