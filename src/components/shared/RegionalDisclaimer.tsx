/**
 * RegionalDisclaimer - Country-specific legal disclaimers
 */

import { Info, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Region = "EU" | "UK" | "US" | "AU" | "CA" | "OTHER";

interface RegionalDisclaimerProps {
  region?: Region;
  showIcon?: boolean;
  variant?: "inline" | "block";
  className?: string;
}

const regionDisclaimers: Record<Region, {
  title: string;
  notices: string[];
}> = {
  EU: {
    title: "EU Consumer Information",
    notices: [
      "Prices include VAT where applicable",
      "Your rights under EU consumer protection laws apply",
      "GDPR: Your data is processed in accordance with EU regulations",
    ],
  },
  UK: {
    title: "UK Consumer Information",
    notices: [
      "Prices include VAT at 20%",
      "UK Consumer Rights Act 2015 applies",
      "Package Travel Regulations may apply to combined bookings",
    ],
  },
  US: {
    title: "US Consumer Notice",
    notices: [
      "State sales taxes may apply and vary by location",
      "Final price confirmed at checkout",
      "California SOT registration: pending",
    ],
  },
  AU: {
    title: "Australian Consumer Information",
    notices: [
      "Prices include GST at 10%",
      "Australian Consumer Law guarantees apply",
      "ABN: Pending registration",
    ],
  },
  CA: {
    title: "Canadian Consumer Information",
    notices: [
      "Provincial taxes (GST/HST/PST) may apply",
      "TICO registration: Pending (Ontario)",
      "Final price includes all applicable fees",
    ],
  },
  OTHER: {
    title: "International Booking",
    notices: [
      "Local taxes and fees may apply",
      "Final price confirmed at checkout",
      "Terms subject to partner provider policies",
    ],
  },
};

export function RegionalDisclaimer({
  region = "US",
  showIcon = true,
  variant = "block",
  className,
}: RegionalDisclaimerProps) {
  const disclaimer = regionDisclaimers[region];

  if (variant === "inline") {
    return (
      <div className={cn("flex items-start gap-2 text-xs text-muted-foreground", className)}>
        {showIcon && <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
        <span>{disclaimer.notices[0]}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Globe2 className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">{disclaimer.title}</h4>
      </div>
      <ul className="space-y-1">
        {disclaimer.notices.map((notice, index) => (
          <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="text-muted-foreground/50">•</span>
            {notice}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Auto-detect region from browser/locale (placeholder)
export function useDetectedRegion(): Region {
  // In production, this would use IP geolocation or user preferences
  if (typeof window === "undefined") return "US";
  
  const locale = navigator.language || "en-US";
  const country = locale.split("-")[1]?.toUpperCase() || "US";
  
  const regionMap: Record<string, Region> = {
    US: "US",
    GB: "UK",
    UK: "UK",
    AU: "AU",
    CA: "CA",
    DE: "EU",
    FR: "EU",
    IT: "EU",
    ES: "EU",
    NL: "EU",
    BE: "EU",
    AT: "EU",
    IE: "EU",
    PT: "EU",
    PL: "EU",
    SE: "EU",
    DK: "EU",
    FI: "EU",
    NO: "EU",
  };
  
  return regionMap[country] || "OTHER";
}

export default RegionalDisclaimer;
