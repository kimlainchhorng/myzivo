import { ShieldCheck, Shield, ShieldAlert, LucideIcon } from "lucide-react";

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
  { id: "has_orders", label: "Completed at least 1 order", weight: 10, improvement: "Complete your first booking" },
  { id: "frequent_user", label: "Completed 5+ orders", weight: 10, improvement: "Keep booking to build trust" },
  { id: "profile_complete", label: "Profile complete", weight: 10, improvement: "Add your full name and phone number", improvementPath: "/profile" },
];

export const TRUST_TIERS: Record<string, TrustTier> = {
  excellent: {
    min: 80,
    label: "Excellent",
    color: "emerald",
    icon: ShieldCheck,
    benefits: [
      "Faster checkout experience",
      "Fewer verifications required",
      "Best promotional offers",
      "Priority customer support",
    ],
  },
  good: {
    min: 50,
    label: "Good",
    color: "amber",
    icon: Shield,
    benefits: [
      "Standard checkout experience",
      "Occasional verifications",
      "Regular promotional offers",
    ],
  },
  needs_attention: {
    min: 0,
    label: "Needs Attention",
    color: "red",
    icon: ShieldAlert,
    benefits: [
      "Additional verifications required",
      "Limited promotional offers",
    ],
  },
};

export type TrustLevel = "excellent" | "good" | "needs_attention";

export function getTierForScore(score: number): TrustLevel {
  if (score >= 80) return "excellent";
  if (score >= 50) return "good";
  return "needs_attention";
}
