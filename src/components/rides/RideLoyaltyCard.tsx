/**
 * RideLoyaltyCard — Points balance, tier progress, streaks, and redeemable perks
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Star, Flame, Gift, Zap, ChevronRight, Lock, CheckCircle, Award, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tiers = [
  { id: "explorer", name: "Explorer", minPoints: 0, color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/40" },
  { id: "traveler", name: "Traveler", minPoints: 500, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { id: "elite", name: "Elite", minPoints: 2000, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

const perks = [
  { id: "free-ride", name: "Free Ride (up to $15)", points: 500, icon: Zap, available: true },
  { id: "priority", name: "Priority Matching", points: 300, icon: Crown, available: true },
  { id: "upgrade", name: "Premium Upgrade", points: 750, icon: Sparkles, available: false },
  { id: "airport-lounge", name: "Airport Lounge Pass", points: 2000, icon: Star, available: false },
];

const challenges = [
  { id: "weekend", name: "Weekend Warrior", desc: "Take 3 rides this weekend", progress: 1, goal: 3, reward: 50, icon: Flame },
  { id: "green", name: "Go Green", desc: "Take 5 shared rides", progress: 3, goal: 5, reward: 75, icon: TrendingUp },
  { id: "explorer", name: "City Explorer", desc: "Visit 3 new neighborhoods", progress: 2, goal: 3, reward: 100, icon: Award },
];

export default function RideLoyaltyCard() {
  const [points] = useState(1250);
  const [streak] = useState(7);
  const [showPerks, setShowPerks] = useState(false);

  const currentTier = tiers.reduce((acc, t) => (points >= t.minPoints ? t : acc), tiers[0]);
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const tierProgress = nextTier ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

  return (
    <div className="space-y-4">
      {/* Points + Tier card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/5 to-primary/10 border border-primary/20 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Crown className={cn("w-5 h-5", currentTier.color)} />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{currentTier.name} Member</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-foreground">{points.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground font-bold">pts</span>
          </div>
          {nextTier && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-muted-foreground">{nextTier.minPoints - points} pts to {nextTier.name}</span>
                <span className="font-bold text-primary">{Math.round(tierProgress)}%</span>
              </div>
              <Progress value={tierProgress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 p-4">
        <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-foreground">{streak}-day ride streak!</span>
          <p className="text-[10px] text-muted-foreground">+{streak * 5} bonus pts earned</p>
        </div>
        <span className="text-3xl font-black text-orange-500">🔥</span>
      </div>

      {/* Active challenges */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Active Challenges</h3>
        {challenges.map(ch => {
          const Icon = ch.icon;
          const pct = (ch.progress / ch.goal) * 100;
          return (
            <div key={ch.id} className="rounded-xl bg-card border border-border/40 p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{ch.name}</span>
                    <Badge variant="outline" className="text-[8px] font-bold text-primary">+{ch.reward} pts</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{ch.desc}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-[9px] font-bold text-muted-foreground">{ch.progress}/{ch.goal}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redeemable perks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Redeem Points</h3>
          <button onClick={() => setShowPerks(!showPerks)} className="text-[10px] font-bold text-primary">
            {showPerks ? "Show less" : "View all"}
          </button>
        </div>
        {perks.slice(0, showPerks ? perks.length : 2).map(perk => {
          const Icon = perk.icon;
          const canRedeem = points >= perk.points;
          return (
            <div key={perk.id} className={cn("rounded-xl border p-3 flex items-center gap-3", canRedeem ? "bg-card border-border/40" : "bg-muted/10 border-border/20 opacity-60")}>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", canRedeem ? "bg-primary/10" : "bg-muted/30")}>
                <Icon className={cn("w-4 h-4", canRedeem ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">{perk.name}</p>
                <p className="text-[10px] text-muted-foreground">{perk.points} points</p>
              </div>
              <Button
                size="sm"
                variant={canRedeem ? "default" : "outline"}
                className="h-8 text-[10px] font-bold rounded-lg px-3"
                disabled={!canRedeem}
                onClick={() => toast.success(`Redeemed: ${perk.name}!`)}
              >
                {canRedeem ? "Redeem" : <Lock className="w-3 h-3" />}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Tier benefits */}
      <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your {currentTier.name} Benefits</h3>
        {[
          "2x points on shared rides",
          "Priority customer support",
          "Monthly surprise rewards",
        ].map(benefit => (
          <div key={benefit} className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs text-foreground">{benefit}</span>
          </div>
        ))}
        {nextTier && (
          <p className="text-[10px] text-primary font-bold mt-2">Unlock {nextTier.name} for exclusive perks →</p>
        )}
      </div>
    </div>
  );
}
