/**
 * Hero Trust Bar
 * Critical trust indicators visible without scrolling
 */

import { ShieldCheck, Zap, Ticket, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const trustItems = [
  { 
    icon: ShieldCheck, 
    label: "Secure ZIVO checkout",
    color: "text-emerald-500"
  },
  { 
    icon: Zap, 
    label: "Real-time prices",
    color: "text-sky-500"
  },
  { 
    icon: Ticket, 
    label: "Instant e-tickets",
    color: "text-violet-500"
  },
  { 
    icon: BadgeCheck, 
    label: "Licensed seller of travel",
    color: "text-amber-500"
  },
];

export default function HeroTrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-4 px-4 bg-muted/30 rounded-xl border border-border/50">
      {trustItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-2 text-sm",
              "animate-in fade-in zoom-in-95"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Icon className={cn("w-4 h-4 shrink-0", item.color)} />
            <span className="font-medium text-foreground/80 whitespace-nowrap text-xs sm:text-sm">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
