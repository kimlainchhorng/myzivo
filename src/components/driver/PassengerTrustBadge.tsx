import { ShieldCheck, Mail, Phone, Star } from "lucide-react";
import { usePassengerTrust } from "@/hooks/usePassengerTrust";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TRUST_TIERS } from "@/config/trustLevel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const badgeColorMap: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" },
};

interface PassengerTrustBadgeProps {
  riderId?: string | null;
  tripId?: string | null;
}

export default function PassengerTrustBadge({ riderId, tripId }: PassengerTrustBadgeProps) {
  // If no riderId but tripId, fetch rider from trip
  const { data: fetchedRiderId } = useQuery({
    queryKey: ["trip-rider", tripId],
    queryFn: async () => {
      if (!tripId) return null;
      const { data } = await supabase
        .from("trips")
        .select("rider_id")
        .eq("id", tripId)
        .maybeSingle();
      return data?.rider_id ?? null;
    },
    enabled: !!tripId && !riderId,
    staleTime: 300_000,
  });

  const resolvedRiderId = riderId || fetchedRiderId;

  const {
    level,
    tierLabel,
    tierColor,
    emailVerified,
    phoneVerified,
    identityVerified,
    avgRiderRating,
    totalTrips,
    isLoading,
  } = usePassengerTrust(resolvedRiderId);

  if (isLoading) {
    return <Skeleton className="h-12 w-full rounded-xl" />;
  }

  if (!resolvedRiderId) return null;

  const tier = TRUST_TIERS[level];
  const Icon = tier.icon;
  const colors = badgeColorMap[tierColor] || badgeColorMap.slate;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl border", colors.bg, colors.border)}>
      <div className={cn("p-1.5 rounded-xl", colors.bg)}>
        <Icon className={cn("w-4 h-4", colors.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold", colors.text)}>{tierLabel}</span>
          <div className="flex items-center gap-1">
            {emailVerified && <Mail className="w-3 h-3 text-emerald-400" />}
            {phoneVerified && <Phone className="w-3 h-3 text-emerald-400" />}
            {identityVerified && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/50">
          {avgRiderRating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {avgRiderRating}
            </span>
          )}
          <span>{totalTrips} trip{totalTrips !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
