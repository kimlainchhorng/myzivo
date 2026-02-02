/**
 * Global Trust Bar
 * Compact trust indicators for key pages (Home, Flights, Hotels, Cars, Extras)
 * Premium, non-intrusive design with compliance disclaimer
 */

import { ShieldCheck, Zap, BadgeCheck, Smartphone, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const trustItems = [
  { 
    icon: ShieldCheck, 
    label: "Secure partner checkout",
    color: "text-emerald-500"
  },
  { 
    icon: Zap, 
    label: "Real-time prices",
    color: "text-sky-500"
  },
  { 
    icon: BadgeCheck, 
    label: "No hidden fees from ZIVO",
    color: "text-violet-500"
  },
  { 
    icon: Smartphone, 
    label: "Mobile-friendly booking",
    color: "text-amber-500"
  },
];

interface GlobalTrustBarProps {
  className?: string;
  variant?: "default" | "compact";
  showDisclaimer?: boolean;
}

export default function GlobalTrustBar({ 
  className,
  variant = "default",
  showDisclaimer = true
}: GlobalTrustBarProps) {
  return (
    <section 
      className={cn(
        "border-y border-border/30 bg-muted/20 backdrop-blur-sm",
        variant === "compact" ? "py-3" : "py-4 sm:py-5",
        className
      )}
    >
      <div className="container mx-auto px-4">
        {/* Trust Icons */}
        <div className={cn(
          "flex items-center justify-center gap-4 sm:gap-8 md:gap-10 overflow-x-auto scrollbar-hide flex-wrap",
          variant === "compact" && "gap-3 sm:gap-6"
        )}>
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 flex-shrink-0",
                  "animate-in fade-in zoom-in-95"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className={cn(
                  "shrink-0",
                  variant === "compact" ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5",
                  item.color
                )} />
                <span className={cn(
                  "font-medium whitespace-nowrap text-foreground/80",
                  variant === "compact" ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
                )}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Compliance Disclaimer */}
        {showDisclaimer && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-border/30">
            <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground text-center">
              Hizivo does not issue airline tickets. Flight bookings are completed with licensed airline partners.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
