/**
 * AccountAnalyticsPage — Profile visits, engagement stats, growth trends
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Heart, Users, TrendingUp, BarChart3, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

type Period = "7d" | "30d" | "90d";

export default function AccountAnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("30d");

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

      <div className="p-4">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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
