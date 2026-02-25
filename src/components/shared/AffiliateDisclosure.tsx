import { Info, ExternalLink, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AFFILIATE_DISCLOSURE_TEXT } from '@/config/affiliateLinks';

/**
 * ZIVO Affiliate Disclosure Component
 * 
 * REQUIRED on all pages with affiliate links
 * Ensures FTC compliance and user transparency
 */

interface AffiliateDisclosureProps {
  variant?: 'inline' | 'footer' | 'banner' | 'minimal';
  className?: string;
}

export function AffiliateDisclosure({ 
  variant = 'inline',
  className 
}: AffiliateDisclosureProps) {
  if (variant === 'minimal') {
    return (
      <p className={cn("text-[10px] text-muted-foreground", className)}>
        ZIVO may earn a commission at no extra cost to you.
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl",
        "bg-amber-500/10 border border-amber-500/20",
        className
      )}>
        <Info className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="text-sm">
          <p className="text-foreground font-medium">Affiliate Disclosure</p>
          <p className="text-muted-foreground mt-0.5">
            {AFFILIATE_DISCLOSURE_TEXT.detailed}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={cn(
        "text-center py-6 border-t border-border/50 mt-8",
        className
      )}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-foreground">Trusted Travel Partner Network</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          {AFFILIATE_DISCLOSURE_TEXT.detailed}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {AFFILIATE_DISCLOSURE_TEXT.payment}
        </p>
        <a 
          href="/affiliate-disclosure" 
          className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
        >
          Learn more about our affiliate partnerships
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-xl",
      "bg-muted/30 border border-border/50",
      className
    )}>
      <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="text-xs text-muted-foreground">
        <p>{AFFILIATE_DISCLOSURE_TEXT.short}</p>
        <p className="mt-1">{AFFILIATE_DISCLOSURE_TEXT.full}</p>
      </div>
    </div>
  );
}

/**
 * Price Disclaimer for affiliate prices
 */
interface PriceDisclaimerProps {
  className?: string;
}

export function AffiliatePriceDisclaimer({ className }: PriceDisclaimerProps) {
  return (
    <p className={cn(
      "text-[10px] sm:text-xs text-muted-foreground text-center",
      className
    )}>
      *{AFFILIATE_DISCLOSURE_TEXT.price}
    </p>
  );
}

/**
 * Redirect notice for booking CTAs
 */
interface RedirectNoticeProps {
  partnerName?: string;
  className?: string;
}

export function RedirectNotice({ partnerName, className }: RedirectNoticeProps) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground",
      className
    )}>
      <ExternalLink className="w-3 h-3" />
      <span>
        Redirects to {partnerName || 'partner site'} to complete booking
      </span>
    </div>
  );
}
