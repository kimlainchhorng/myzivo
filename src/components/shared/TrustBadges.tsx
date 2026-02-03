import { Shield, Users, Zap, Clock, CreditCard, RefreshCw, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ZIVO TRUST BADGES
 * Consistent trust indicators across all pages
 * Use in hero sections and near CTAs
 */

export type ServiceType = "flights" | "hotels" | "cars";

interface TrustBadge {
  icon: LucideIcon;
  text: string;
  color: string;
}

const universalBadges: TrustBadge[] = [
  { icon: Shield, text: "Secure ZIVO Checkout", color: "text-emerald-500" },
  { icon: Users, text: "Licensed Partners", color: "text-sky-500" },
  { icon: Zap, text: "Real-Time Prices", color: "text-amber-500" },
  { icon: Clock, text: "24/7 Support", color: "text-violet-500" },
];

const serviceBadges: Record<ServiceType, TrustBadge[]> = {
  flights: [
    { icon: Shield, text: "Secure ZIVO Checkout", color: "text-emerald-500" },
    { icon: Users, text: "Global Airlines", color: "text-sky-500" },
    { icon: Zap, text: "Real-Time Prices", color: "text-amber-500" },
    { icon: CreditCard, text: "No Booking Fees", color: "text-violet-500" },
  ],
  hotels: [
    { icon: Shield, text: "Secure Comparison", color: "text-emerald-500" },
    { icon: Users, text: "Verified Reviews", color: "text-amber-500" },
    { icon: RefreshCw, text: "Free Cancellation Options", color: "text-sky-500" },
    { icon: CreditCard, text: "No Hidden Fees", color: "text-violet-500" },
  ],
  cars: [
    { icon: Shield, text: "Secure Booking", color: "text-emerald-500" },
    { icon: Users, text: "Top Providers", color: "text-violet-500" },
    { icon: Zap, text: "Instant Confirmation", color: "text-amber-500" },
    { icon: CreditCard, text: "No Prepayment Options", color: "text-sky-500" },
  ],
};

interface TrustBadgesProps {
  service?: ServiceType;
  variant?: "inline" | "grid" | "compact";
  className?: string;
}

export function TrustBadges({ 
  service, 
  variant = "inline",
  className 
}: TrustBadgesProps) {
  const badges = service ? serviceBadges[service] : universalBadges;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-4 text-xs sm:text-sm", className)}>
        {badges.slice(0, 3).map((badge) => (
          <div key={badge.text} className="flex items-center gap-1.5 text-muted-foreground">
            <badge.icon className={cn("w-3.5 h-3.5", badge.color)} />
            <span>{badge.text}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
        {badges.map((badge) => (
          <div
            key={badge.text}
            className="flex items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/50"
          >
            <badge.icon className={cn("w-5 h-5 shrink-0", badge.color)} />
            <span className="text-sm text-foreground">{badge.text}</span>
          </div>
        ))}
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={cn("flex flex-wrap justify-center gap-4", className)}>
      {badges.map((badge) => (
        <div
          key={badge.text}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <badge.icon className={cn("w-4 h-4", badge.color)} />
          <span className="text-sm text-white/80">{badge.text}</span>
        </div>
      ))}
    </div>
  );
}
