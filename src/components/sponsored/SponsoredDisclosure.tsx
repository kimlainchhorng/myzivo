/**
 * Sponsored Disclosure Components
 * Site-wide and page-level compliance disclosures
 */

import { Info, Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SPONSORED_DISCLOSURE_TEXT,
  SITE_WIDE_DISCLOSURE,
  SPONSORED_FOOTER_TEXT,
} from "@/config/sponsoredAds";
import { cn } from "@/lib/utils";

interface SponsoredDisclosureProps {
  variant?: "inline" | "alert" | "footer" | "tooltip" | "banner";
  className?: string;
}

export function SponsoredDisclosure({
  variant = "inline",
  className,
}: SponsoredDisclosureProps) {
  if (variant === "tooltip") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
                className
              )}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Why sponsored?</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{SPONSORED_DISCLOSURE_TEXT.results}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "alert") {
    return (
      <Alert className={cn("border-amber-500/20 bg-amber-500/5", className)}>
        <Info className="w-4 h-4 text-amber-500" />
        <AlertDescription className="text-sm text-muted-foreground ml-2">
          {SITE_WIDE_DISCLOSURE}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-2 px-4",
          "bg-amber-500/5 border-y border-amber-500/10",
          "text-xs text-muted-foreground",
          className
        )}
      >
        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <p>{SITE_WIDE_DISCLOSURE}</p>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={cn("py-6 border-t border-border/50 bg-muted/20", className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">
                Advertising Disclosure
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {SPONSORED_FOOTER_TEXT}
            </p>
            <p className="text-xs text-muted-foreground">
              {SPONSORED_DISCLOSURE_TEXT.pricing}
            </p>
            <Link
              to="/advertising-disclosure"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              Learn more about advertising on ZIVO
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div
      className={cn(
        "flex items-start gap-2 p-3 rounded-xl",
        "bg-amber-500/5 border border-amber-500/10",
        className
      )}
    >
      <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="text-xs text-muted-foreground">
        <p>{SITE_WIDE_DISCLOSURE}</p>
        <p className="mt-1">{SPONSORED_DISCLOSURE_TEXT.results}</p>
      </div>
    </div>
  );
}

/**
 * Compact sponsored indicator for result lists
 */
export function SponsoredIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[10px] text-muted-foreground",
        className
      )}
    >
      <Info className="w-3 h-3" />
      <span>Some results are sponsored</span>
    </div>
  );
}

/**
 * Page-level disclosure for pages with sponsored content
 */
export function PageSponsoredNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-2 px-4",
        "rounded-xl bg-muted/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">
        This page may include sponsored listings clearly marked with "Sponsored" labels.
      </p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-xs text-primary hover:underline shrink-0">
              Learn more
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">{SPONSORED_DISCLOSURE_TEXT.results}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default SponsoredDisclosure;
