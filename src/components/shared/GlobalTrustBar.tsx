/**
 * Global Trust Bar
 * Compact trust indicators for key pages (Home, Flights, Hotels, Cars, Extras)
 * Premium, non-intrusive design
 */

import { Search, ShieldCheck, Smartphone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const trustItems = [
  { 
    icon: Search, 
    label: "Compare options fast",
    color: "text-sky-400"
  },
  { 
    icon: ShieldCheck, 
    label: "Secure partner checkout",
    color: "text-emerald-400"
  },
  { 
    icon: Smartphone, 
    label: "Mobile-friendly",
    color: "text-violet-400"
  },
  { 
    icon: Mail, 
    label: "info@hizivo.com",
    color: "text-amber-400"
  },
];

interface GlobalTrustBarProps {
  className?: string;
  variant?: "default" | "compact";
}

export default function GlobalTrustBar({ 
  className,
  variant = "default" 
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
        <div className={cn(
          "flex items-center justify-center gap-4 sm:gap-8 md:gap-12 overflow-x-auto scrollbar-hide",
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
                  "font-medium whitespace-nowrap text-muted-foreground",
                  variant === "compact" ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
                )}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
