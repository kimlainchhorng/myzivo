/**
 * CreatorDashboardPage — Full earnings, subscribers, tips, analytics, and payouts
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import {
  ArrowLeft, DollarSign, Users, TrendingUp, Heart, Crown, BarChart3, Wallet,
  Eye, Video, Gift, Star, Zap, Clock, ChevronRight, ArrowUpRight,
  Download, Calendar, Target, Award, Store, PenTool, Share2, Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    { label: "Total Earnings", value: `$${(totalEarnings / 100).toFixed(2)}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Subscribers", value: String(subscribers.length), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Tips", value: `$${(totalTips / 100).toFixed(2)}`, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Tier Plans", value: String(tiers.length), icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Views", value: "0", icon: Eye, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Engagement", value: "0%", icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ];

  const quickActions = [
    { label: "Analytics", icon: BarChart3, href: "/creator-analytics", color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Monetization", icon: DollarSign, href: "/monetization", color: "text-primary", bg: "bg-primary/10" },
    { label: "Affiliate Hub", icon: Gift, href: "/affiliate-hub", color: "text-teal-500", bg: "bg-teal-500/10" },
    { label: "Digital Products", icon: PenTool, href: "/digital-products", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
    { label: "ZIVO Shop", icon: Store, href: "/shop-dashboard", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Wallet", icon: Wallet, href: "/wallet", color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Content Scheduler", icon: Calendar, href: "/content-scheduler", color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Creator Academy", icon: Award, href: "/monetization/articles", color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Share Profile", icon: Share2, href: "/qr-profile", color: "text-sky-500", bg: "bg-sky-500/10" },
  ];

  const recentActivity = [
    { type: "tip", text: "No tips yet — share your content to start earning!", time: "now", icon: Heart, color: "text-pink-500" },
    { type: "sub", text: "No subscribers yet — create exclusive content to attract fans!", time: "now", icon: Crown, color: "text-amber-500" },
    { type: "view", text: "Post your first content to start tracking views.", time: "now", icon: Eye, color: "text-blue-500" },
  ];

  const milestones = [
    { label: "First Post", target: 1, current: 0, icon: Video, color: "text-purple-500" },
    { label: "10 Followers", target: 10, current: 0, icon: Users, color: "text-blue-500" },
    { label: "First Tip", target: 1, current: 0, icon: Heart, color: "text-pink-500" },
    { label: "First Subscriber", target: 1, current: 0, icon: Crown, color: "text-amber-500" },
    { label: "$100 Earned", target: 100, current: totalEarnings / 100, icon: DollarSign, color: "text-emerald-500" },
    { label: "1K Views", target: 1000, current: 0, icon: Eye, color: "text-violet-500" },
  ];

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title="Creator Dashboard – ZIVO" description="Manage your creator earnings, subscribers, and content on ZIVO." noIndex />

      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Creator Dashboard</h1>
          <button onClick={() => navigate("/creator-analytics")} className="p-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <BarChart3 className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Hero Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary/15 via-primary/8 to-transparent border border-primary/20 p-5 text-center"
        >
          <p className="text-[11px] text-muted-foreground mb-1">Lifetime Earnings</p>
          <p className="text-3xl font-bold text-foreground">${(totalEarnings / 100).toFixed(2)}</p>
          <div className="flex justify-center gap-4 mt-3">
            <button onClick={() => navigate("/wallet")} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold touch-manipulation active:scale-95 flex items-center gap-1.5">
              <Wallet className="w-3 h-3" /> Withdraw
            </button>
            <button onClick={() => navigate("/creator-analytics")} className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-bold touch-manipulation active:scale-95 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Analytics
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {overviewCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border/40 bg-card p-3 text-center"
            >
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-sm font-bold">{card.value}</p>
              <p className="text-[9px] text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-bold text-base mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                onClick={() => navigate(action.href)}
                className="rounded-2xl border border-border/40 bg-card p-3 flex flex-col items-center gap-1.5 touch-manipulation active:scale-[0.96] transition-transform"
              >
                <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <span className="text-[9px] font-bold text-center leading-tight">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="font-bold text-base mb-3">Creator Milestones</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {milestones.map((m, i) => {
              const pct = Math.min(100, (m.current / m.target) * 100);
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="rounded-2xl border border-border/40 bg-card p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                    <span className="text-[11px] font-bold">{m.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground">{m.current} / {m.target}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="font-bold text-base mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {tips.length > 0 ? tips.slice(0, 5).map((tip: any, i: number) => (
              <div key={tip.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-card">
                <Heart className="w-4 h-4 text-pink-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Tip received</p>
                  <p className="text-[10px] text-muted-foreground">${(tip.amount_cents / 100).toFixed(2)} · {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            )) : recentActivity.map((act, i) => (
              <motion.div
                key={act.type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-card"
              >
                <act.icon className={`w-4 h-4 ${act.color} shrink-0`} />
                <p className="text-[11px] text-muted-foreground flex-1">{act.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subscription Tiers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Subscription Tiers</h2>
            <span className="text-[10px] text-muted-foreground">{tiers.length} tiers</span>
          </div>
          {tiers.length > 0 ? (
            <div className="space-y-2">
              {tiers.map((tier: any) => (
                <div key={tier.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-card">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{tier.name}</p>
                    <p className="text-[10px] text-muted-foreground">${(tier.price_cents / 100).toFixed(2)}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 text-center">
              <Crown className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs font-bold mb-1">No tiers yet</p>
              <p className="text-[10px] text-muted-foreground">Create subscription tiers to offer exclusive content to your fans.</p>
            </div>
          )}
        </div>

        {/* Growth Tips */}
        <div>
          <h2 className="font-bold text-base mb-3">Growth Tips</h2>
          <div className="space-y-2">
            {[
              { icon: Video, title: "Post consistently", desc: "Aim for 3-5 posts per week to stay visible in the algorithm.", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Zap, title: "Go LIVE weekly", desc: "LIVE creators earn 3x more through gifts and tips.", color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: Target, title: "Engage your community", desc: "Reply to every comment in the first hour for maximum reach.", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Gift, title: "Promote affiliates", desc: "Share your referral links in your bio and pinned posts.", color: "text-teal-500", bg: "bg-teal-500/10" },
              { icon: Star, title: "Create exclusives", desc: "Subscriber-only content drives 5x higher conversion rates.", color: "text-pink-500", bg: "bg-pink-500/10" },
            ].map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.04 }}
                className="flex items-start gap-3 p-3 rounded-2xl border border-border/40 bg-card"
              >
                <div className={`w-8 h-8 rounded-lg ${tip.bg} flex items-center justify-center shrink-0`}>
                  <tip.icon className={`w-4 h-4 ${tip.color}`} />
                </div>
                <div>
                  <p className="font-bold text-[12px]">{tip.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
