/**
 * CreatorDashboardPage — ZIVO Signature Design (2026)
 * Organic layout, aurora mesh, emerald identity
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import {
  ArrowLeft, DollarSign, Users, TrendingUp, Heart, Crown, BarChart3, Wallet,
  Eye, Video, Gift, Star, Zap, Clock, ChevronRight, ArrowUpRight,
  Download, Calendar, Target, Award, Store, PenTool, Share2, Bell,
  Sparkles, ArrowRight,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import SEOHead from "@/components/SEOHead";

export default function CreatorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: creator } = useQuery({
    queryKey: ["creator-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("creator_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: tips = [] } = useQuery({
    queryKey: ["creator-tips", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("creator_tips").select("*").eq("creator_id", user!.id).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ["creator-subscribers", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("creator_subscriptions").select("*").eq("creator_id", user!.id).eq("status", "active").limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["subscription-tiers", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("subscription_tiers").select("*").eq("creator_id", user!.id).order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const totalTips = tips.reduce((sum: number, t: any) => sum + (t.amount_cents || 0), 0);
  const totalEarnings = (creator?.total_earnings_cents || 0) + totalTips;

  const overviewCards = [
    { label: "Earnings", value: `$${(totalEarnings / 100).toFixed(2)}`, icon: DollarSign, accent: "hsl(142 71% 45%)" },
    { label: "Subscribers", value: String(subscribers.length), icon: Users, accent: "hsl(221 83% 53%)" },
    { label: "Tips", value: `$${(totalTips / 100).toFixed(2)}`, icon: Heart, accent: "hsl(340 75% 55%)" },
    { label: "Tier Plans", value: String(tiers.length), icon: Crown, accent: "hsl(38 92% 50%)" },
    { label: "Views", value: "0", icon: Eye, accent: "hsl(263 70% 58%)" },
    { label: "Engagement", value: "0%", icon: TrendingUp, accent: "hsl(198 93% 59%)" },
  ];

  const quickActions = [
    { label: "Analytics", icon: BarChart3, href: "/creator-analytics", accent: "hsl(263 70% 58%)" },
    { label: "Monetization", icon: DollarSign, href: "/monetization", accent: "hsl(142 71% 45%)" },
    { label: "Affiliate Hub", icon: Gift, href: "/affiliate-hub", accent: "hsl(172 66% 50%)" },
    { label: "Digital Products", icon: PenTool, href: "/digital-products", accent: "hsl(300 70% 55%)" },
    { label: "ZIVO Shop", icon: Store, href: "/shop-dashboard", accent: "hsl(142 71% 45%)" },
    { label: "Wallet", icon: Wallet, href: "/wallet", accent: "hsl(38 92% 50%)" },
    { label: "Scheduler", icon: Calendar, href: "/content-scheduler", accent: "hsl(263 70% 58%)" },
    { label: "Academy", icon: Award, href: "/monetization/articles", accent: "hsl(25 95% 53%)" },
    { label: "Share", icon: Share2, href: "/qr-profile", accent: "hsl(199 89% 48%)" },
  ];

  const milestones = [
    { label: "First Post", target: 1, current: 0, icon: Video, accent: "hsl(263 70% 58%)" },
    { label: "10 Followers", target: 10, current: 0, icon: Users, accent: "hsl(221 83% 53%)" },
    { label: "First Tip", target: 1, current: 0, icon: Heart, accent: "hsl(340 75% 55%)" },
    { label: "First Sub", target: 1, current: 0, icon: Crown, accent: "hsl(38 92% 50%)" },
    { label: "$100 Earned", target: 100, current: totalEarnings / 100, icon: DollarSign, accent: "hsl(142 71% 45%)" },
    { label: "1K Views", target: 1000, current: 0, icon: Eye, accent: "hsl(263 70% 58%)" },
  ];

  const growthTips = [
    { icon: Video, title: "Post consistently", desc: "3-5 posts/week keeps you visible.", accent: "hsl(263 70% 58%)" },
    { icon: Zap, title: "Go LIVE weekly", desc: "LIVE creators earn 3x more.", accent: "hsl(38 92% 50%)" },
    { icon: Target, title: "Engage early", desc: "Reply to comments in the first hour.", accent: "hsl(221 83% 53%)" },
    { icon: Gift, title: "Promote affiliates", desc: "Share links in bio & pinned posts.", accent: "hsl(172 66% 50%)" },
    { icon: Star, title: "Create exclusives", desc: "Sub-only content drives 5x conversions.", accent: "hsl(340 75% 55%)" },
  ];

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Creator Dashboard – ZIVO" description="Manage your creator earnings, subscribers, and content on ZIVO." noIndex />

      {/* Header with ZIVO ribbon */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30 zivo-ribbon">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/more")} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-extrabold flex-1 tracking-tight">Creator Dashboard</h1>
          <button onClick={() => navigate("/creator-analytics")} className="p-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <BarChart3 className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 zivo-aurora">
        {/* Hero Earnings — ZIVO organic card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="zivo-card-organic p-5 text-center"
        >
          <div className="absolute top-3 right-3">
            <span className="zivo-badge"><Sparkles className="w-2.5 h-2.5" /> Creator</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider font-medium">Lifetime Earnings</p>
          <p className="text-4xl font-extrabold tracking-tight">${(totalEarnings / 100).toFixed(2)}</p>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => navigate("/wallet")} className="zivo-btn-signature px-5 py-2.5 text-xs flex items-center gap-1.5 touch-manipulation">
              <Wallet className="w-3.5 h-3.5" /> Withdraw
            </button>
            <button onClick={() => navigate("/creator-analytics")} className="px-5 py-2.5 rounded-2xl bg-muted/60 text-foreground text-xs font-bold touch-manipulation active:scale-95 flex items-center gap-1.5 border border-border/30">
              <TrendingUp className="w-3.5 h-3.5" /> Analytics
            </button>
          </div>
        </motion.div>

        {/* Stats Grid — ZIVO icon pills */}
        <div className="grid grid-cols-3 gap-2.5">
          {overviewCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 25 }}
              className="zivo-card-organic p-3 text-center"
            >
              <div className="zivo-icon-pill mx-auto mb-1.5 w-9 h-9 rounded-xl" style={{ color: card.accent, background: `${card.accent}15` }}>
                <card.icon className="w-4 h-4" style={{ color: card.accent }} />
              </div>
              <p className="text-sm font-bold">{card.value}</p>
              <p className="text-[9px] text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions — 3x3 grid */}
        <div>
          <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action, i) => (
              <Link key={action.label} to={action.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.03 }}
                  className="zivo-card-organic p-3 flex flex-col items-center gap-1.5 touch-manipulation"
                >
                  <div className="zivo-icon-pill w-9 h-9 rounded-xl" style={{ color: action.accent, background: `${action.accent}15` }}>
                    <action.icon className="w-4 h-4" style={{ color: action.accent }} />
                  </div>
                  <span className="text-[9px] font-bold text-center leading-tight">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Milestones
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {milestones.map((m, i) => {
              const pct = Math.min(100, (m.current / m.target) * 100);
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="zivo-card-organic p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <m.icon className="w-4 h-4" style={{ color: m.accent }} />
                    <span className="text-[11px] font-bold">{m.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: m.accent }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground">{m.current} / {m.target}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Recent Activity
          </h2>
          <div className="space-y-1.5">
            {tips.length > 0 ? tips.slice(0, 5).map((tip: any) => (
              <div key={tip.id} className="zivo-card-organic flex items-center gap-3 p-3">
                <div className="zivo-icon-pill w-8 h-8 rounded-lg" style={{ color: "hsl(340 75% 55%)", background: "hsl(340 75% 55% / 0.15)" }}>
                  <Heart className="w-3.5 h-3.5" style={{ color: "hsl(340 75% 55%)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Tip received</p>
                  <p className="text-[10px] text-muted-foreground">${(tip.amount_cents / 100).toFixed(2)} · {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            )) : (
              <>
                {[
                  { text: "Share content to start earning tips!", icon: Heart, accent: "hsl(340 75% 55%)" },
                  { text: "Create exclusives to attract subscribers!", icon: Crown, accent: "hsl(38 92% 50%)" },
                  { text: "Post your first content to track views.", icon: Eye, accent: "hsl(221 83% 53%)" },
                ].map((act, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                    className="zivo-card-organic flex items-center gap-3 p-3"
                  >
                    <act.icon className="w-4 h-4 shrink-0" style={{ color: act.accent }} />
                    <p className="text-[11px] text-muted-foreground flex-1">{act.text}</p>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Subscription Tiers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[15px] flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" /> Subscription Tiers
            </h2>
            <span className="text-[10px] text-muted-foreground">{tiers.length} tiers</span>
          </div>
          {tiers.length > 0 ? (
            <div className="space-y-1.5">
              {tiers.map((tier: any) => (
                <div key={tier.id} className="zivo-card-organic flex items-center gap-3 p-3">
                  <div className="zivo-icon-pill w-9 h-9 rounded-xl" style={{ color: "hsl(38 92% 50%)", background: "hsl(38 92% 50% / 0.15)" }}>
                    <Crown className="w-4 h-4" style={{ color: "hsl(38 92% 50%)" }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{tier.name}</p>
                    <p className="text-[10px] text-muted-foreground">${(tier.price_cents / 100).toFixed(2)}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="zivo-card-organic p-6 text-center border-dashed">
              <Crown className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs font-bold mb-1">No tiers yet</p>
              <p className="text-[10px] text-muted-foreground">Create subscription tiers for exclusive content.</p>
            </div>
          )}
        </div>

        {/* Growth Tips */}
        <div>
          <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Growth Tips
          </h2>
          <div className="space-y-1.5">
            {growthTips.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.04 }}
                className="zivo-card-organic flex items-start gap-3 p-3"
              >
                <div className="zivo-icon-pill w-8 h-8 rounded-lg shrink-0" style={{ color: tip.accent, background: `${tip.accent}15` }}>
                  <tip.icon className="w-3.5 h-3.5" style={{ color: tip.accent }} />
                </div>
                <div>
                  <p className="font-bold text-[12px]">{tip.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div className="flex justify-center pt-4">
          <span className="text-[10px] text-muted-foreground/30 font-semibold tracking-widest uppercase">ZIVO Creator • 2026</span>
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
