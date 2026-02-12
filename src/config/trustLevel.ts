import { ShieldCheck, Shield, ShieldAlert, Star, LucideIcon } from "lucide-react";

export interface TrustSignal {
  id: string;
  label: string;
  weight: number;
  improvement?: string;
  improvementPath?: string;
}

export interface TrustTier {
  min: number;
  label: string;
  color: string;
  icon: LucideIcon;
  benefits: string[];
}

export const TRUST_SIGNALS: TrustSignal[] = [
  { id: "email_verified", label: "Email verified", weight: 15, improvement: "Verify your email address", improvementPath: "/profile" },
  { id: "phone_verified", label: "Phone verified", weight: 15, improvement: "Add and verify your phone number", improvementPath: "/profile" },
  { id: "identity_verified", label: "Identity verified", weight: 20, improvement: "Complete identity verification", improvementPath: "/account/verification" },
  { id: "account_age_30", label: "Account older than 30 days", weight: 10 },
  { id: "account_age_90", label: "Account older than 90 days", weight: 10 },
  { id: "has_orders", label: "Completed at least 1 trip", weight: 5, improvement: "Complete your first trip" },
  { id: "frequent_user", label: "Completed 5+ trips", weight: 5, improvement: "Keep riding to build trust" },
  { id: "profile_complete", label: "Profile complete", weight: 10, improvement: "Add your full name and phone number", improvementPath: "/profile" },
  { id: "low_cancellation_rate", label: "Low cancellation rate", weight: 5, improvement: "Keep your cancellation rate below 15%" },
  { id: "good_rider_rating", label: "Good passenger rating", weight: 5, improvement: "Maintain a 4.0+ rider rating" },
];

export const TRUST_TIERS: Record<string, TrustTier> = {
  top_rider: {
    min: 85,
    label: "Top Rider",
    color: "violet",
    icon: Star,
    benefits: [
      "Priority matching with top-rated drivers",
      "Fastest checkout experience",
      "Exclusive promotional offers",
      "Priority customer support",
      "VIP recognition badge",
    ],
  },
  trusted: {
    min: 65,
    label: "Trusted",
    color: "emerald",
    icon: ShieldCheck,
    benefits: [
      "Faster checkout experience",
      "Fewer verifications required",
      "Best promotional offers",
      "Priority customer support",
    ],
  },
  verified: {
    min: 30,
    label: "Verified",
    color: "amber",
    icon: Shield,
    benefits: [
      "Standard checkout experience",
      "Occasional verifications",
      "Regular promotional offers",
    ],
  },
  new_rider: {
    min: 0,
    label: "New",
    color: "slate",
    icon: ShieldAlert,
    benefits: [
      "Complete verifications to unlock benefits",
      "Build trust by completing trips",
    ],
  },
};

export type TrustLevel = "top_rider" | "trusted" | "verified" | "new_rider";

export function getTierForScore(score: number): TrustLevel {
  if (score >= 85) return "top_rider";
  if (score >= 65) return "trusted";
  if (score >= 30) return "verified";
  return "new_rider";
}
