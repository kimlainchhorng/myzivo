/**
 * Flight Seller Disclaimer Component
 * 
 * REQUIRED on all flight search, results, and detail pages
 * Displays MoR (Merchant of Record) compliance text
 * ZIVO is the seller of travel
 */

import { Shield, Lock, AlertCircle, Plane, CreditCard, CheckCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { FLIGHT_DISCLAIMERS, FLIGHT_TRUST_BADGES } from "@/config/flightCompliance";
import { ZIVO_SOT_REGISTRATION } from "@/config/flightMoRCompliance";

interface FlightSellerDisclaimerProps {
  variant?: 'banner' | 'inline' | 'footer' | 'card' | 'minimal' | 'checkout' | 'registration';
  className?: string;
}

export default function FlightSellerDisclaimer({
  variant = 'banner',
  className,
}: FlightSellerDisclaimerProps) {
  // Registration variant - shows SOT status
  if (variant === 'registration') {
    return (
      <div className={cn(
        "p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20",
        className
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium">Licensed Seller of Travel</span>
        </div>
        <p className="text-xs text-muted-foreground mb-1">
          {ZIVO_SOT_REGISTRATION.status}
        </p>
        <p className="text-[10px] text-muted-foreground">
          CA SOT: pending · FL SOT: pending
        </p>
      </div>
    );
  }

  // Minimal inline disclaimer
  if (variant === 'minimal') {
    return (
      <p className={cn("text-xs text-muted-foreground flex items-center gap-1.5", className)}>
        <Plane className="w-3 h-3 text-sky-500" />
        {FLIGHT_DISCLAIMERS.ticketingShort}
      </p>
    );
  }

  // Inline disclaimer
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>{FLIGHT_DISCLAIMERS.ticketingShort}</span>
      </div>
    );
  }

  // Footer disclaimer
  if (variant === 'footer') {
    return (
      <div className={cn("py-4 border-t border-border/50 text-center", className)}>
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          {FLIGHT_DISCLAIMERS.footer}
        </p>
      </div>
    );
  }

  // Checkout variant - more prominent for payment page
  if (variant === 'checkout') {
    return (
      <div className={cn(
        "p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3",
        className
      )}>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-500" />
          <p className="font-medium text-sm">Secure ZIVO Checkout</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {FLIGHT_DISCLAIMERS.payment}
        </p>
        <div className="flex flex-wrap gap-3 pt-2 border-t border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CreditCard className="w-3 h-3 text-emerald-500" />
            <span>{FLIGHT_TRUST_BADGES.secureCheckout}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-sky-500" />
            <span>{FLIGHT_TRUST_BADGES.dataEncrypted}</span>
          </div>
        </div>
      </div>
    );
  }

  // Card variant with full details
  if (variant === 'card') {
    return (
      <div className={cn(
        "p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-3",
        className
      )}>
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-sky-500" />
          <p className="font-medium text-sm">{FLIGHT_DISCLAIMERS.ticketingShort}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {FLIGHT_DISCLAIMERS.ticketing}
        </p>
        <div className="flex flex-wrap gap-3 pt-2 border-t border-sky-500/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>{FLIGHT_TRUST_BADGES.secureCheckout}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="w-3 h-3 text-sky-500" />
            <span>{FLIGHT_TRUST_BADGES.licensedPartner}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default banner variant
  return (
    <div className={cn(
      "flex items-center justify-center gap-2 p-3 rounded-xl",
      "bg-sky-500/5 border border-sky-500/20",
      "text-xs sm:text-sm text-muted-foreground",
      className
    )}>
      <Shield className="w-4 h-4 text-sky-500 shrink-0" />
      <span>{FLIGHT_DISCLAIMERS.ticketingShort}</span>
    </div>
  );
}

/**
 * Trust badges for flight checkout
 */
export function FlightTrustBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-xs text-muted-foreground", className)}>
      <span className="flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-emerald-500" />
        {FLIGHT_TRUST_BADGES.secureCheckout}
      </span>
      <span className="flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-sky-500" />
        {FLIGHT_TRUST_BADGES.transparentPricing}
      </span>
      <span className="flex items-center gap-1.5">
        <Plane className="w-3.5 h-3.5 text-amber-500" />
        {FLIGHT_TRUST_BADGES.licensedPartner}
      </span>
    </div>
  );
}

/**
 * Payment disclaimer - shows ZIVO handles payments
 */
export function FlightPaymentDisclaimer({ className }: { className?: string }) {
  return (
    <div className={cn(
      "p-3 rounded-xl bg-muted/50 border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200",
      "text-xs text-muted-foreground",
      className
    )}>
      <div className="flex items-start gap-2">
        <CreditCard className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">{FLIGHT_DISCLAIMERS.payment}</p>
          <p className="mt-1">{FLIGHT_DISCLAIMERS.support}</p>
        </div>
      </div>
    </div>
  );
}
