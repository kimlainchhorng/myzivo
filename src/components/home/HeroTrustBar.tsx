/**
 * Hero Trust Bar
 * Critical trust indicators visible without scrolling
 */

import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const trustItems = [
  "500+ Airlines Compared",
  "500,000+ Hotels Worldwide", 
  "Trusted Rental Partners",
  "No Hidden Fees",
];

interface HeroTrustBarProps {
  className?: string;
  variant?: "default" | "compact";
}

export default function HeroTrustBar({ className, variant = "default" }: HeroTrustBarProps) {
  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-4 sm:gap-6",
      variant === "default" && "py-4 px-4 bg-muted/30 rounded-xl border border-border/50",
      variant === "compact" && "py-2",
      className
    )}>
      {trustItems.map((item, index) => (
        <div
          key={item}
          className={cn(
            "flex items-center gap-1.5",
            "animate-in fade-in zoom-in-95"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span className={cn(
            "font-medium text-foreground/80 whitespace-nowrap",
            variant === "default" ? "text-xs sm:text-sm" : "text-xs"
          )}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}
