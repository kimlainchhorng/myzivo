/**
 * CreatorDashboardPage — Earnings, subscribers, tips, and payouts for content creators
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { ArrowLeft, DollarSign, Users, TrendingUp, Heart, Crown, BarChart3, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function CreatorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch creator profile
  const { data: creator } = useQuery({
    queryKey: ["creator-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch tips received
  const { data: tips = [] } = useQuery({
    queryKey: ["creator-tips", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("creator_tips")
        .select("*")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch subscribers
  const { data: subscribers = [] } = useQuery({
    queryKey: ["creator-subscribers", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("creator_subscriptions")
        .select("*")
        .eq("creator_id", user!.id)
        .eq("status", "active")
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch subscription tiers
  const { data: tiers = [] } = useQuery({
    queryKey: ["subscription-tiers", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subscription_tiers")
        .select("*")
        .eq("creator_id", user!.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const totalTips = tips.reduce((sum: number, t: any) => sum + (t.amount_cents || 0), 0);
  const totalEarnings = (creator?.total_earnings_cents || 0) + totalTips;

  const stats = [
    { icon: DollarSign, label: "Total Earnings", value: `$${(totalEarnings / 100).toFixed(2)}`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Users, label: "Subscribers", value: subscribers.length, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Heart, label: "Tips Received", value: tips.length, color: "text-pink-500", bg: "bg-pink-500/10" },
    { icon: TrendingUp, label: "Tip Revenue", value: `$${(totalTips / 100).toFixed(2)}`, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="min-h-dvh bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Creator Dashboard</h1>
          <Crown className="h-5 w-5 text-amber-500" />
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
                <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Subscription Tiers */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Subscription Tiers
          </h2>
          {tiers.length === 0 ? (
            <div className="bg-muted/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">No tiers set up yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create subscription tiers to offer premium content</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tiers.map((tier: any) => (
                <div key={tier.id} className="bg-card rounded-xl p-4 border border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.description || "No description"}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">${(tier.price_cents / 100).toFixed(2)}/mo</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tips */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" /> Recent Tips
          </h2>
          {tips.length === 0 ? (
            <div className="bg-muted/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">No tips received yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tips.slice(0, 10).map((tip: any) => (
                <div key={tip.id} className="bg-card rounded-xl p-3 border border-border/30 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {tip.is_anonymous ? "Anonymous" : "Someone"} tipped ${(tip.amount_cents / 100).toFixed(2)}
                    </p>
                    {tip.message && <p className="text-xs text-muted-foreground truncate">"{tip.message}"</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold">Payouts</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Earnings are paid out monthly via your configured payment method. 
            Set up payout details in your profile settings.
          </p>
          <p className="text-lg font-bold text-primary mt-2">${(totalEarnings / 100).toFixed(2)} available</p>
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
