import { Shield, CreditCard, Search, ExternalLink, Users, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Trust Signals Component
 * Displays trust indicators near search/results areas
 * Helps build user confidence and explains ZIVO's model
 */

interface TrustSignalsProps {
  variant?: 'inline' | 'bar' | 'compact';
  className?: string;
  showPartnerNotice?: boolean;
}

const TRUST_BADGES = [
  { icon: Search, text: "Compare prices from 500+ airlines", shortText: "500+ Airlines" },
  { icon: CreditCard, text: "No booking fees on ZIVO", shortText: "No Fees" },
  { icon: Shield, text: "Secure ZIVO checkout", shortText: "Secure Checkout" },
  { icon: Lock, text: "Your data is protected", shortText: "Data Protected" },
];

export default function TrustSignals({ 
  variant = 'inline', 
  className = '',
  showPartnerNotice = true 
}: TrustSignalsProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap items-center gap-3 text-xs text-muted-foreground", className)}>
        {TRUST_BADGES.slice(0, 3).map((badge, i) => {
          const Icon = badge.icon;
          return (
            <div key={i} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-emerald-500" />
              <span>{badge.shortText}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className={cn("py-4 px-4 bg-muted/30 border-y border-border/50", className)}>
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {TRUST_BADGES.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium">{badge.shortText}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={cn("space-y-4", className)}>
      {/* Trust badges */}
      <div className="flex flex-wrap items-center gap-3">
        {TRUST_BADGES.map((badge, i) => {
          const Icon = badge.icon;
          return (
            <div 
              key={i} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {badge.shortText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Partner redirect notice - for hotels/cars only */}
      {showPartnerNotice && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Hotels and car rentals complete on partner sites.</span>
        </div>
      )}
    </div>
  );
}

/**
 * Inline trust message for CTAs
 */
export function TrustMessage({ className = '' }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground flex items-center gap-1.5", className)}>
      <Shield className="w-3 h-3 text-emerald-500" />
      Secure booking • No ZIVO fees • Partner site redirect
    </p>
  );
}

/**
 * Redirect notice for near CTAs
 */
export function RedirectNotice({ partnerName, className = '' }: { partnerName?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
      <span>
        You will be redirected to {partnerName || 'our trusted travel partner'} to complete your booking.
      </span>
    </div>
  );
}

/**
 * Stats-based trust indicators
 */
export function TrustStats({ className = '' }: { className?: string }) {
  const stats = [
    { value: "500+", label: "Travel Partners" },
    { value: "10M+", label: "Monthly Searches" },
    { value: "0", label: "Booking Fees" },
    { value: "24/7", label: "Price Comparison" },
  ];

  return (
    <div className={cn("flex flex-wrap justify-center gap-6 md:gap-10", className)}>
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
