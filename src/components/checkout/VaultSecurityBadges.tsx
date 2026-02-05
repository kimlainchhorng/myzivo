/**
 * VaultSecurityBadges - Trust anchor badges for secure checkout
 * Displays PCI DSS, encryption, and Stripe security indicators
 */

import { Shield, Lock, CheckCircle2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface VaultSecurityBadgesProps {
  className?: string;
  variant?: "horizontal" | "vertical" | "compact";
}

const badges = [
  {
    id: "encryption",
    icon: Lock,
    label: "256-BIT",
    sublabel: "ENCRYPTION",
  },
  {
    id: "pci",
    icon: Shield,
    label: "PCI DSS",
    sublabel: "COMPLIANT",
  },
  {
    id: "stripe",
    icon: CheckCircle2,
    label: "STRIPE",
    sublabel: "SECURED",
  },
];

export default function VaultSecurityBadges({ 
  className,
  variant = "horizontal"
}: VaultSecurityBadgesProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-4 text-muted-foreground", className)}>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">256-bit Encryption</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">PCI Compliant</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      variant === "horizontal" 
        ? "flex items-center justify-center gap-6 flex-wrap" 
        : "flex flex-col gap-3",
      className
    )}>
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.id}
            className="trust-badge flex items-center gap-2 px-3 py-2 rounded-lg"
          >
            <Icon className="w-4 h-4" />
            <div className="text-left">
              <p className="text-[10px] font-bold tracking-wider leading-none">
                {badge.label}
              </p>
              <p className="text-[9px] opacity-70 leading-none mt-0.5">
                {badge.sublabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}