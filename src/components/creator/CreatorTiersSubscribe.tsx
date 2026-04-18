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

  return (
    <div className="px-4 max-w-3xl mx-auto mt-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-primary" />
          Support {creatorName ? creatorName.split(" ")[0] : "this creator"}
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

      <div className="space-y-2">
        {tiers.map((tier: any) => {
          const interval = (tier.billing_interval || "month") as BillingInterval;
          const monthly = !tier.is_free && !tier.is_custom_price
            ? monthlyEquivalent(tier.price_cents ?? 0, interval)
            : null;
          return (
            <motion.div
              key={tier.id}
              whileTap={{ scale: 0.99 }}
              className="rounded-2xl border border-border/50 bg-card p-3.5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {tier.is_free ? (
                    <Gift className="w-5 h-5 text-primary" />
                  ) : (
                    <Crown className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-sm">{tier.name}</p>
                    {tier.trial_days > 0 && !tier.is_free && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600">
                        {tier.trial_days}-day trial
                      </span>
                    )}
                    {tier.is_custom_price && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-600">
                        Pay what you want
                      </span>
                    )}
                  </div>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    {formatTierPrice(tier)}
                    {monthly && (
                      <span className="text-[10px] font-normal text-muted-foreground ml-1.5">{monthly}</span>
                    )}
                  </p>
                  {Array.isArray(tier.benefits) && tier.benefits.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {tier.benefits.slice(0, 4).map((b: string, i: number) => (
                        <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {!isOwnProfile && (
                <Button
                  onClick={() => handleSubscribe(tier)}
                  disabled={joining === tier.id}
                  className="w-full mt-3 font-bold"
                  size="sm"
                  variant={tier.is_free ? "outline" : "default"}
                >
                  {joining === tier.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : tier.is_free ? (
                    "Join free"
                  ) : tier.trial_days > 0 ? (
                    `Start ${tier.trial_days}-day trial`
                  ) : (
                    `Subscribe · ${INTERVAL_LABEL[interval]}`
                  )}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

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
