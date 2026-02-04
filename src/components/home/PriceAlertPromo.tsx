/**
 * Price Alert Promo Section
 * High-conversion CTA for price tracking feature
 */

import { Link } from "react-router-dom";
import { Bell, ArrowRight, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PriceAlertPromoProps {
  className?: string;
  variant?: "default" | "compact";
}

export default function PriceAlertPromo({ className, variant = "default" }: PriceAlertPromoProps) {
  const isCompact = variant === "compact";

  return (
    <section className={cn(
      "relative overflow-hidden",
      isCompact ? "py-8" : "py-12 sm:py-16",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className={cn(
          "relative rounded-2xl overflow-hidden",
          "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
          "border border-primary/20"
        )}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className={cn(
            "relative z-10 text-center",
            isCompact ? "px-6 py-8" : "px-8 py-12 sm:py-16"
          )}>
            {/* Icon */}
            <div className={cn(
              "inline-flex items-center justify-center rounded-2xl mb-6",
              "bg-gradient-to-br from-primary to-primary/80",
              isCompact ? "w-14 h-14" : "w-16 h-16"
            )}>
              <Bell className={cn(
                "text-primary-foreground",
                isCompact ? "w-7 h-7" : "w-8 h-8"
              )} />
            </div>

            {/* Content */}
            <h2 className={cn(
              "font-bold mb-3",
              isCompact ? "text-xl" : "text-2xl sm:text-3xl"
            )}>
              Never Miss a Price Drop
            </h2>
            <p className={cn(
              "text-muted-foreground max-w-md mx-auto mb-6",
              isCompact ? "text-sm" : "text-base sm:text-lg"
            )}>
              Track routes and get notified when prices change.
            </p>

            {/* CTA */}
            <Link to="/price-alerts">
              <Button 
                size={isCompact ? "default" : "lg"}
                className={cn(
                  "font-semibold gap-2 rounded-xl",
                  isCompact ? "h-11 px-6" : "h-14 px-8 text-lg"
                )}
              >
                Create Price Alert
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
              <span>Free • No signup required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
