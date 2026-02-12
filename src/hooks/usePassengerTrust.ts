import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TRUST_TIERS, getTierForScore, TrustLevel } from "@/config/trustLevel";

export interface PassengerTrustData {
  level: TrustLevel;
  tierLabel: string;
  tierColor: string;
  score: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  avgRiderRating: number;
  totalTrips: number;
  isLoading: boolean;
}

export function usePassengerTrust(riderId: string | null | undefined): PassengerTrustData {
  const { data, isLoading } = useQuery({
    queryKey: ["passenger-trust", riderId],
    queryFn: async () => {
      if (!riderId) return null;

      // Fetch profile and verification in parallel
      const [profileRes, verificationRes, tripsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, phone, email_verified, phone_verified, created_at")
          .eq("user_id", riderId)
          .maybeSingle(),
        supabase
          .from("customer_identity_verifications")
          .select("status")
          .eq("user_id", riderId)
          .maybeSingle(),
        supabase
          .from("trips")
          .select("status, rider_rating")
          .eq("rider_id", riderId),
      ]);

      const profile = profileRes.data;
      const verification = verificationRes.data;
      const trips = tripsRes.data ?? [];

      const now = new Date();
      const createdAt = profile?.created_at ? new Date(profile.created_at) : now;
      const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      const totalTrips = trips.length;
      const cancelledTrips = trips.filter(t => t.status === "cancelled").length;
      const ratedTrips = trips.filter(t => t.rider_rating != null);
      const avgRiderRating = ratedTrips.length >= 2
        ? ratedTrips.reduce((sum, t) => sum + (t.rider_rating ?? 0), 0) / ratedTrips.length
        : 0;
      const cancellationRate = totalTrips >= 3 ? cancelledTrips / totalTrips : 0;

      // Calculate score using same weights as config
      let score = 0;
      if (profile?.email_verified) score += 15;
      if (profile?.phone_verified) score += 15;
      if (verification?.status === "verified") score += 20;
      if (accountAgeDays >= 30) score += 10;
      if (accountAgeDays >= 90) score += 10;
      if (totalTrips > 0) score += 5;
      if (totalTrips >= 5) score += 5;
      if (profile?.full_name && profile?.phone) score += 10;
      if (totalTrips >= 3 && cancellationRate < 0.15) score += 5;
      if (ratedTrips.length >= 2 && avgRiderRating >= 4.0) score += 5;

      return {
        score,
        emailVerified: !!profile?.email_verified,
        phoneVerified: !!profile?.phone_verified,
        identityVerified: verification?.status === "verified",
        avgRiderRating: Math.round(avgRiderRating * 10) / 10,
        totalTrips,
      };
    },
    enabled: !!riderId,
    staleTime: 60_000,
  });

  const score = data?.score ?? 0;
  const level = getTierForScore(score);
  const tier = TRUST_TIERS[level];

  return {
    level,
    tierLabel: tier.label,
    tierColor: tier.color,
    score,
    emailVerified: data?.emailVerified ?? false,
    phoneVerified: data?.phoneVerified ?? false,
    identityVerified: data?.identityVerified ?? false,
    avgRiderRating: data?.avgRiderRating ?? 0,
    totalTrips: data?.totalTrips ?? 0,
    isLoading,
  };
}
