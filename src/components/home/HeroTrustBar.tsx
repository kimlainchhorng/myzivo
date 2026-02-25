/**
 * Hero Trust Bar
 * Premium glass chips with green accent icons + shimmer effect
 */

import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const trustItems = [
  "Secure Checkout",
  "Instant Confirmation", 
  "24/7 Customer Support",
  "No Hidden Fees",
];

interface HeroTrustBarProps {
  className?: string;
  variant?: "default" | "compact";
}

export default function HeroTrustBar({ className, variant = "default" }: HeroTrustBarProps) {
  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-3 sm:gap-4",
      variant === "default" && "py-3 px-3",
      variant === "compact" && "py-2",
      className
    )}>
      {trustItems.map((item, index) => (
        <div
          key={item}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-full",
            "glass-chip shimmer-chip",
            "animate-in fade-in zoom-in-95"
          )}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <CheckCircle className="w-3.5 h-3.5 shrink-0 text-primary" />
          <span className={cn(
            "font-medium text-foreground/90 whitespace-nowrap",
            variant === "default" ? "text-xs sm:text-sm" : "text-xs"
          )}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}
