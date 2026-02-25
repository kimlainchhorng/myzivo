/**
 * Why Book with ZIVO
 * 4-card value proposition section with glow borders and floating icons
 */

import { Search, ShieldCheck, BadgeCheck, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const valueProps = [
  {
    icon: Search,
    title: "Compare Multiple Providers",
    description: "Search across hundreds of airlines, hotels, and rental partners to compare prices per trip.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Pricing",
    description: "See prices from multiple providers upfront. No hidden fees from ZIVO — what you see is what partners charge.",
  },
  {
    icon: BadgeCheck,
    title: "Price Alerts",
    description: "Track routes you care about and get notified when prices change. Never miss a price drop.",
  },
  {
    icon: Globe,
    title: "Flexible Search",
    description: "Flexible dates and nearby airport suggestions help you find the best options available.",
  },
];

interface WhyBookWithZivoProps {
  className?: string;
  variant?: "default" | "compact";
}

export function WhyBookWithZivo({ className, variant = "default" }: WhyBookWithZivoProps) {
  const isCompact = variant === "compact";

  return (
    <section className={cn(
      "relative overflow-hidden",
      isCompact ? "py-8" : "py-12 sm:py-16",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={cn(
          "text-center",
          isCompact ? "mb-6" : "mb-10 sm:mb-12"
        )}>
          <h2 className={cn(
            "font-display font-bold",
            isCompact ? "text-xl" : "text-2xl sm:text-3xl lg:text-4xl"
          )}>
            Why Compare with{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              ZIVO
            </span>
            ?
          </h2>
          {!isCompact && (
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mt-3">
              Your trusted travel comparison platform
            </p>
          )}
        </div>

        {/* Value Props Grid */}
        <div className={cn(
          "grid gap-6",
          isCompact ? "grid-cols-1 sm:grid-cols-4 max-w-4xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto sm:gap-8"
        )}>
          {valueProps.map((prop, index) => (
            <div
              key={prop.title}
              className={cn(
                "group text-center",
                isCompact ? "p-4" : "p-6 sm:p-8",
                "rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50",
                "glow-border-hover",
                "hover:-translate-y-1",
                "transition-all duration-300",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "mx-auto rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/20",
                "group-hover:scale-110 transition-transform duration-300",
                "float-gentle",
                isCompact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-5"
              )}
              style={{ animationDelay: `${index * 200}ms` }}
              >
                <prop.icon className={cn(
                  isCompact ? "w-6 h-6" : "w-8 h-8",
                  "text-primary"
                )} />
              </div>

              {/* Content */}
              <h3 className={cn(
                "font-bold mb-2",
                isCompact ? "text-base" : "text-lg sm:text-xl"
              )}>
                {prop.title}
              </h3>
              <p className={cn(
                "text-muted-foreground leading-relaxed",
                isCompact ? "text-xs" : "text-sm sm:text-base"
              )}>
                {prop.description}
              </p>
            </div>
          ))}
        </div>

        {/* Compliance note */}
        <p className={cn(
          "text-center text-muted-foreground/70 max-w-lg mx-auto",
          isCompact ? "text-[10px] mt-4" : "text-xs mt-8"
        )}>
          ZIVO does not issue tickets or process payments. All bookings are completed on partner sites.
        </p>
      </div>
    </section>
  );
}

export default WhyBookWithZivo;
