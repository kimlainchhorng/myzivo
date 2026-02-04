/**
 * INTERNATIONAL COMPLIANCE COMPONENTS
 * 
 * Country-specific disclaimers and notices
 */

import { Globe, Info, Shield, CreditCard } from "lucide-react";
import { 
  INTERNATIONAL_COMPLIANCE, 
  getCountryByCode,
  type CountryConfig 
} from "@/config/internationalExpansion";
import { useGeoDetection } from "@/hooks/useGeoDetection";
import { cn } from "@/lib/utils";

interface GlobalDisclaimerProps {
  className?: string;
  variant?: "full" | "compact" | "inline";
}

/**
 * Global booking facilitator disclaimer
 */
export function GlobalDisclaimer({ className, variant = "full" }: GlobalDisclaimerProps) {
  if (variant === "inline") {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        {INTERNATIONAL_COMPLIANCE.globalDisclaimer}
      </p>
    );
  }
  
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>{INTERNATIONAL_COMPLIANCE.globalDisclaimer}</span>
      </div>
    );
  }
  
  return (
    <div className={cn("p-4 rounded-lg bg-muted/50 border border-border", className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Global Booking Facilitator</p>
          <p className="text-xs text-muted-foreground">
            {INTERNATIONAL_COMPLIANCE.globalDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

interface CurrencyDisclaimerProps {
  className?: string;
}

/**
 * Currency conversion disclaimer
 */
export function CurrencyDisclaimer({ className }: CurrencyDisclaimerProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <CreditCard className="w-3.5 h-3.5 shrink-0" />
      <span>{INTERNATIONAL_COMPLIANCE.currencyDisclaimer}</span>
    </div>
  );
}

interface TaxDisclaimerProps {
  className?: string;
}

/**
 * Tax and fees disclaimer
 */
export function TaxDisclaimer({ className }: TaxDisclaimerProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <Info className="w-3.5 h-3.5 shrink-0" />
      <span>{INTERNATIONAL_COMPLIANCE.taxDisclaimer}</span>
    </div>
  );
}

interface CountryNoticeProps {
  countryCode?: string;
  className?: string;
}

/**
 * Country-specific legal notice
 */
export function CountryNotice({ countryCode, className }: CountryNoticeProps) {
  const { country: detectedCountry } = useGeoDetection();
  const code = countryCode || detectedCountry?.code;
  
  if (!code) return null;
  
  const notices: Record<string, string> = {
    GB: INTERNATIONAL_COMPLIANCE.ukNotice,
    DE: INTERNATIONAL_COMPLIANCE.euNotice,
    FR: INTERNATIONAL_COMPLIANCE.euNotice,
    ES: INTERNATIONAL_COMPLIANCE.euNotice,
    IT: INTERNATIONAL_COMPLIANCE.euNotice,
    NL: INTERNATIONAL_COMPLIANCE.euNotice,
    US: INTERNATIONAL_COMPLIANCE.usNotice,
    AU: INTERNATIONAL_COMPLIANCE.auNotice,
  };
  
  const notice = notices[code];
  if (!notice) return null;
  
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      <span>{notice}</span>
    </div>
  );
}

interface InternationalFooterProps {
  className?: string;
}

/**
 * Complete international footer with all disclaimers
 */
export function InternationalFooter({ className }: InternationalFooterProps) {
  const { country } = useGeoDetection();
  
  return (
    <div className={cn("space-y-3 py-4 border-t border-border/50", className)}>
      <GlobalDisclaimer variant="compact" />
      <div className="flex flex-wrap gap-4">
        <CurrencyDisclaimer />
        <TaxDisclaimer />
      </div>
      <CountryNotice countryCode={country?.code} />
    </div>
  );
}
