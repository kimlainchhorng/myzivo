/**
 * ZIVO Optimized Sticky CTA
 * 
 * A/B tested sticky footer CTA for mobile devices.
 * Tests sticky vs non-sticky behavior and CTA text/color.
 */

import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCTAText, useCTAColor, useStickyCTA } from "@/hooks/useABTest";
import { AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";
import type { ServiceType } from "@/lib/abTesting";

interface OptimizedStickyCTAProps {
  service: ServiceType;
  onClick: () => void;
  className?: string;
  subtitle?: string;
  showInfo?: React.ReactNode;
}

export function OptimizedStickyCTA({
  service,
  onClick,
  className,
  subtitle,
  showInfo,
}: OptimizedStickyCTAProps) {
  const { primaryText, trackClick: trackTextClick } = useCTAText(service);
  const { className: colorClassName, trackClick: trackColorClick } = useCTAColor(service);
  const { isSticky, trackClick: trackStickyClick } = useStickyCTA();
  
  const handleClick = () => {
    trackTextClick();
    trackColorClick();
    trackStickyClick();
    onClick();
  };
  
  // If not sticky variant, don't render
  if (!isSticky) {
    return null;
  }
  
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
      "bg-gradient-to-t from-background via-background/98 to-background/90 backdrop-blur-lg",
      "border-t border-border/50 shadow-2xl shadow-black/20",
      "safe-area-inset-bottom",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Info Summary */}
          <div className="flex-1 min-w-0">
            {showInfo}
            {subtitle && (
              <p className="text-[10px] text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* CTA Button - Large, easy to tap */}
          <Button
            size="lg"
            className={cn(
              "gap-2 text-white shadow-lg shrink-0 min-h-[48px] px-6 touch-manipulation active:scale-[0.98]",
              colorClassName
            )}
            onClick={handleClick}
          >
            <Sparkles className="w-4 h-4" />
            {primaryText}
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Disclosure */}
        <p className="text-[9px] text-muted-foreground text-center mt-2 leading-tight">
          {AFFILIATE_DISCLOSURE_TEXT.short}
        </p>
      </div>
    </div>
  );
}
