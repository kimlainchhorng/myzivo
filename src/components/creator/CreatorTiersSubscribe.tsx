/**
 * CreatorTiersSubscribe — surfaces a creator's active subscription tiers on their public profile.
 * Fans can join free tiers in one tap, enter a custom amount for pay-what-you-want,
 * or initiate Stripe checkout for paid tiers.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, Sparkles, Loader2, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatTierPrice, monthlyEquivalent, INTERVAL_LABEL, type BillingInterval } from "@/lib/tierFormat";

interface Props {
  creatorId: string;
  creatorName?: string;
  isOwnProfile: boolean;
}

export default function CreatorTiersSubscribe({ creatorId, creatorName, isOwnProfile }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState<string | null>(null);
  const [pwywTier, setPwywTier] = useState<any | null>(null);
  const [pwywAmount, setPwywAmount] = useState("");

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ["public-creator-tiers", creatorId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subscription_tiers")
        .select("*")
        .eq("creator_id", creatorId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!creatorId,
  });

  if (isLoading || tiers.length === 0) return null;

  const handleSubscribe = async (tier: any) => {
    if (!user) {
      toast.error("Sign in to subscribe");
      navigate("/auth");
      return;
    }
    if (tier.is_custom_price) {
      setPwywAmount(((tier.price_cents ?? 99) / 100).toFixed(2));
      setPwywTier(tier);
      return;
    }
    await doSubscribe(tier, tier.price_cents);
  };

  const doSubscribe = async (tier: any, cents: number) => {
    setJoining(tier.id);
    try {
      if (tier.is_free) {
        const { error } = await (supabase as any).from("creator_subscriptions").insert({
          creator_id: creatorId,
          subscriber_id: user!.id,
          tier_id: tier.id,
          status: "active",
          price_cents: 0,
        });
        if (error) throw error;
        toast.success(`Joined ${tier.name}`);
      } else {
        const { data, error } = await (supabase as any).functions.invoke("subscribe-to-tier", {
          body: {
            tier_id: tier.id,
            creator_id: creatorId,
            amount_cents: cents,
          },
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        toast.success("Subscription started");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to subscribe");
    } finally {
      setJoining(null);
      setPwywTier(null);
    }
  };

  // Featured tier = lowest paid (the headline OF-style "SUBSCRIBE" card)
  const paidTiers = tiers.filter((t: any) => !t.is_free);
  const featured = paidTiers.length > 0
    ? [...paidTiers].sort((a, b) => (a.price_cents ?? 0) - (b.price_cents ?? 0))[0]
    : tiers[0];
  const others = tiers.filter((t: any) => t.id !== featured?.id);

  const renderPriceLine = (tier: any) => {
    const interval = (tier.billing_interval || "month") as BillingInterval;
    const cents = tier.price_cents ?? 0;
    const pct = Number(tier.discount_percent || 0);
    const discounted = pct > 0 ? Math.round(cents * (1 - pct / 100)) : cents;
    const intervalLabel = tier.is_free ? "" : `/ ${INTERVAL_LABEL[interval].toLowerCase()}`;
    if (tier.is_free) return <span>FREE</span>;
    return (
      <span className="flex items-baseline gap-1.5 flex-wrap">
        {pct > 0 && (
          <span className="text-base text-white/60 line-through font-semibold">${(cents / 100).toFixed(2)}</span>
        )}
        <span>{tier.is_custom_price ? "FROM " : ""}${(discounted / 100).toFixed(2)}</span>
        <span className="text-xs font-semibold opacity-80">{intervalLabel}</span>
      </span>
    );
  };

  const FeaturedCard = ({ tier }: { tier: any }) => {
    const interval = (tier.billing_interval || "month") as BillingInterval;
    const monthly = !tier.is_free && !tier.is_custom_price
      ? monthlyEquivalent(tier.price_cents ?? 0, interval)
      : null;
    const pct = Number(tier.discount_percent || 0);
    const badgeColor = tier.badge_color || "#00AFF0";
    return (
      <motion.div
        whileTap={{ scale: 0.99 }}
        className="relative overflow-hidden rounded-2xl shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${badgeColor} 0%, ${badgeColor}dd 60%, #0a0a0a 140%)`,
        }}
      >
        {/* discount ribbon */}
        {pct > 0 && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-black text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow">
            Limited offer · Save {pct}%
          </div>
        )}

        <div className="p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{tier.badge_emoji || "⭐"}</span>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-80">Subscription bundle</p>
          </div>

          <h4 className="text-xl font-extrabold leading-tight">{tier.name?.toUpperCase() || "SUBSCRIBE"}</h4>

          <div className="mt-2 text-3xl font-extrabold">
            {renderPriceLine(tier)}
          </div>
          {monthly && (
            <p className="text-[11px] opacity-80 mt-0.5">{monthly}</p>
          )}

          {/* perks list */}
          {Array.isArray(tier.benefits) && tier.benefits.length > 0 && (
            <ul className="mt-3 space-y-1">
              {tier.benefits.slice(0, 6).map((b: string, i: number) => (
                <li key={i} className="text-[12px] flex items-start gap-1.5 opacity-95">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {!isOwnProfile && (
            <button
              onClick={() => handleSubscribe(tier)}
              disabled={joining === tier.id}
              className="w-full mt-4 bg-white text-black font-extrabold uppercase tracking-wide rounded-full py-3 text-sm hover:bg-white/90 active:scale-[0.99] transition shadow disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {joining === tier.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : tier.is_free ? (
                "JOIN FOR FREE"
              ) : tier.trial_days > 0 ? (
                `START ${tier.trial_days}-DAY FREE TRIAL`
              ) : (
                "SUBSCRIBE"
              )}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const MiniTierRow = ({ tier }: { tier: any }) => {
    const interval = (tier.billing_interval || "month") as BillingInterval;
    const cents = tier.price_cents ?? 0;
    const pct = Number(tier.discount_percent || 0);
    const discounted = pct > 0 ? Math.round(cents * (1 - pct / 100)) : cents;
    const badgeColor = tier.badge_color || "hsl(var(--primary))";
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-card">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: badgeColor + "26", color: badgeColor }}
        >
          {tier.badge_emoji || (tier.is_free ? "🎁" : "⭐")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-bold text-sm truncate">{tier.name}</p>
            {tier.trial_days > 0 && !tier.is_free && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600">{tier.trial_days}d trial</span>
            )}
            {pct > 0 && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600">−{pct}%</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {tier.is_free ? "Free" : `$${(discounted / 100).toFixed(2)} / ${INTERVAL_LABEL[interval].toLowerCase()}`}
          </p>
        </div>
        {!isOwnProfile && (
          <button
            onClick={() => handleSubscribe(tier)}
            disabled={joining === tier.id}
            className="text-[11px] font-extrabold uppercase tracking-wide px-3 py-2 rounded-full bg-foreground text-background hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center gap-1"
          >
            {joining === tier.id ? <Loader2 className="w-3 h-3 animate-spin" /> : tier.is_free ? "Join" : "Subscribe"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 max-w-3xl mx-auto mt-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-primary" />
          Subscribe
        </h3>
        {isOwnProfile && (
          <button
            onClick={() => navigate("/creator/setup?step=tier")}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Manage tiers
          </button>
        )}
      </div>

      {featured && <FeaturedCard tier={featured} />}

      {others.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground px-1">More options</p>
          {others.map((t: any) => <MiniTierRow key={t.id} tier={t} />)}
        </div>
      )}

      {/* Pay-what-you-want dialog */}
      <Dialog open={!!pwywTier} onOpenChange={(o) => !o && setPwywTier(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Choose your amount
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Suggested minimum: ${((pwywTier?.price_cents ?? 99) / 100).toFixed(2)}
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">$</span>
              <Input
                value={pwywAmount}
                onChange={(e) => setPwywAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                className="pl-7 text-base font-bold h-12"
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwywTier(null)}>Cancel</Button>
            <Button
              onClick={() => {
                const cents = Math.round(parseFloat(pwywAmount) * 100);
                const min = pwywTier?.price_cents ?? 99;
                if (!Number.isFinite(cents) || cents < min) {
                  toast.error(`Minimum is $${(min / 100).toFixed(2)}`);
                  return;
                }
                doSubscribe(pwywTier, cents);
              }}
              disabled={joining === pwywTier?.id}
              className="font-bold"
            >
              {joining === pwywTier?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
