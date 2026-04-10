/**
 * ContentAnalyticsPage — Analytics dashboard for content creators
 * Shows post performance, reach, engagement rate, top content
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { ArrowLeft, BarChart3, Eye, Heart, MessageCircle, Share2, TrendingUp, Image, Film, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function ContentAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["my-content-analytics", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_posts")
        .select("id, caption, media_type, media_url, likes_count, comments_count, shares_count, views_count, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const totalLikes = posts.reduce((s: number, p: any) => s + (p.likes_count || 0), 0);
  const totalComments = posts.reduce((s: number, p: any) => s + (p.comments_count || 0), 0);
  const totalShares = posts.reduce((s: number, p: any) => s + (p.shares_count || 0), 0);
  const totalViews = posts.reduce((s: number, p: any) => s + (p.views_count || 0), 0);
  const engagementRate = totalViews > 0 ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1) : "0.0";

  const topPosts = [...posts].sort((a: any, b: any) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 5);

  const stats = [
    { icon: Eye, label: "Total Views", value: totalViews.toLocaleString(), color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Heart, label: "Total Likes", value: totalLikes.toLocaleString(), color: "text-pink-500", bg: "bg-pink-500/10" },
    { icon: MessageCircle, label: "Comments", value: totalComments.toLocaleString(), color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: TrendingUp, label: "Engagement", value: `${engagementRate}%`, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const getMediaIcon = (type: string) => {
    if (type === "video" || type === "reel") return Film;
    if (type === "image") return Image;
    return FileText;
  };

  return (
    <div className="min-h-dvh bg-background pb-24">
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Content Analytics</h1>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-4 border border-border/30"
            >
              <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold">Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{posts.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Posts</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{totalShares.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Shares</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{engagementRate}%</p>
              <p className="text-[10px] text-muted-foreground">Eng. Rate</p>
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Top Performing Posts
          </h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : topPosts.length === 0 ? (
            <div className="bg-muted/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">No posts yet. Start creating!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topPosts.map((post: any, i: number) => {
                const MediaIcon = getMediaIcon(post.media_type);
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-xl p-3 border border-border/30 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <MediaIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1">
                        {post.caption || `[${post.media_type || "post"}]`}
                      </p>
                      <div className="flex gap-3 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" /> {post.likes_count || 0}</span>
                        <span className="flex items-center gap-0.5"><MessageCircle className="h-2.5 w-2.5" /> {post.comments_count || 0}</span>
                        <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {post.views_count || 0}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
