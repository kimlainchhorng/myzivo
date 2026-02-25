import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Shield, ShieldAlert, Star, Users, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const tierConfig = [
  { key: "top_rider", label: "Top Rider", icon: Star, color: "text-violet-500", bg: "bg-violet-500/10", min: 85 },
  { key: "trusted", label: "Trusted", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", min: 65 },
  { key: "verified", label: "Verified", icon: Shield, color: "text-amber-500", bg: "bg-amber-500/10", min: 30 },
  { key: "new_rider", label: "New", icon: ShieldAlert, color: "text-slate-500", bg: "bg-slate-500/10", min: 0 },
];

export default function AdminTrustDistribution() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-trust-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, email_verified, phone_verified, created_at");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 120_000,
  });

  const { data: flaggedUsers } = useQuery({
    queryKey: ["admin-flagged-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_limits")
        .select("user_id, is_blocked, block_reason")
        .eq("is_blocked", true)
        .limit(20);
      if (error) return [];
      return data ?? [];
    },
    staleTime: 120_000,
  });

  // Simple score estimation for distribution (server-side would be more accurate)
  const distribution = profiles
    ? tierConfig.map((tier) => {
        // Rough estimation: count profiles that likely fall in each tier
        const count = profiles.filter((p) => {
          let score = 0;
          if (p.email_verified) score += 15;
          if (p.phone_verified) score += 15;
          if (p.full_name && p.phone) score += 10;
          const age = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24));
          if (age >= 30) score += 10;
          if (age >= 90) score += 10;
          const nextTier = tierConfig.find((t) => t.min > tier.min);
          return score >= tier.min && (!nextTier || score < nextTier.min);
        }).length;
        return { ...tier, count };
      })
    : [];

  const totalUsers = profiles?.length ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Trust Level Distribution
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {totalUsers} total users across all trust tiers
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {distribution.map((tier) => {
          const Icon = tier.icon;
          const pct = totalUsers > 0 ? Math.round((tier.count / totalUsers) * 100) : 0;
          return (
            <Card key={tier.key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("p-2 rounded-xl", tier.bg)}>
                    <Icon className={cn("w-4 h-4", tier.color)} />
                  </div>
                  <span className="text-sm font-medium">{tier.label}</span>
                </div>
                <p className="text-2xl font-bold">{tier.count}</p>
                <p className="text-xs text-muted-foreground">{pct}% of users</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Distribution Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            {distribution.map((tier) => {
              const pct = totalUsers > 0 ? (tier.count / totalUsers) * 100 : 0;
              if (pct === 0) return null;
              const barColor = {
                top_rider: "bg-violet-500",
                trusted: "bg-emerald-500",
                verified: "bg-amber-500",
                new_rider: "bg-slate-400",
              }[tier.key];
              return (
                <div
                  key={tier.key}
                  className={cn("h-full transition-all", barColor)}
                  style={{ width: `${pct}%` }}
                  title={`${tier.label}: ${tier.count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 flex-wrap">
            {distribution.map((tier) => {
              const dotColor = {
                top_rider: "bg-violet-500",
                trusted: "bg-emerald-500",
                verified: "bg-amber-500",
                new_rider: "bg-slate-400",
              }[tier.key];
              return (
                <div key={tier.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={cn("w-2.5 h-2.5 rounded-full", dotColor)} />
                  {tier.label}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Flagged Users */}
      {(flaggedUsers?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Flagged Users ({flaggedUsers?.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flaggedUsers?.map((u) => (
                <div key={u.user_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm font-mono text-muted-foreground">{u.user_id.slice(0, 8)}...</span>
                  <Badge variant="destructive" className="text-xs">
                    {u.block_reason || "Blocked"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
