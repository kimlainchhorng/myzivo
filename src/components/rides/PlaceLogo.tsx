/**
 * PlaceLogo – tries brand logo APIs, then Google Places photo, then category icon.
 * Uses free logo APIs (no API key needed).
 */
import { useState, useCallback, memo } from "react";
import { UtensilsCrossed, ShoppingCart, Fuel, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Well-known brand → domain mapping
const BRAND_DOMAINS: Record<string, string> = {
  "mcdonald's": "mcdonalds.com",
  "mcdonalds": "mcdonalds.com",
  "burger king": "bk.com",
  "jack in the box": "jackinthebox.com",
  "taco bell": "tacobell.com",
  "wendy's": "wendys.com",
  "wendys": "wendys.com",
  "subway": "subway.com",
  "starbucks": "starbucks.com",
  "dunkin": "dunkindonuts.com",
  "dunkin'": "dunkindonuts.com",
  "chick-fil-a": "chick-fil-a.com",
  "popeyes": "popeyes.com",
  "kfc": "kfc.com",
  "pizza hut": "pizzahut.com",
  "domino's": "dominos.com",
  "dominos": "dominos.com",
  "papa john's": "papajohns.com",
  "chipotle": "chipotle.com",
  "panda express": "pandaexpress.com",
  "sonic": "sonicdrivein.com",
  "whataburger": "whataburger.com",
  "arby's": "arbys.com",
  "dairy queen": "dairyqueen.com",
  "five guys": "fiveguys.com",
  "in-n-out": "in-n-out.com",
  "chili's": "chilis.com",
  "applebee's": "applebees.com",
  "ihop": "ihop.com",
  "denny's": "dennys.com",
  "waffle house": "wafflehouse.com",
  "cracker barrel": "crackerbarrel.com",
  "olive garden": "olivegarden.com",
  "red lobster": "redlobster.com",
  "outback steakhouse": "outback.com",
  "7-eleven": "7-eleven.com",
  "walgreens": "walgreens.com",
  "cvs": "cvs.com",
  "walmart": "walmart.com",
  "target": "target.com",
  "costco": "costco.com",
  "kroger": "kroger.com",
  "safeway": "safeway.com",
  "whole foods": "wholefoodsmarket.com",
  "trader joe's": "traderjoes.com",
  "aldi": "aldi.us",
  "publix": "publix.com",
  "dollar general": "dollargeneral.com",
  "dollar tree": "dollartree.com",
  "family dollar": "familydollar.com",
  "home depot": "homedepot.com",
  "lowe's": "lowes.com",
  "autozone": "autozone.com",
  "o'reilly": "oreillyauto.com",
  "advance auto parts": "advanceautoparts.com",
  "shell": "shell.com",
  "chevron": "chevron.com",
  "exxon": "exxon.com",
  "bp": "bp.com",
  "valero": "valero.com",
  "circle k": "circlek.com",
  "speedway": "speedway.com",
  "racetrac": "racetrac.com",
  "wawa": "wawa.com",
  "sheetz": "sheetz.com",
  "quiktrip": "quiktrip.com",
  "murphy usa": "murphyusa.com",
  "sam's club": "samsclub.com",
  "buc-ee's": "buc-ees.com",
  "scenic seafood": "",
  "snowcone island": "",
  "empire wings": "",
};

function getBrandDomain(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (lower in BRAND_DOMAINS) {
    return BRAND_DOMAINS[lower] || null;
  }
  for (const [key, domain] of Object.entries(BRAND_DOMAINS)) {
    if (domain && (lower.includes(key) || key.includes(lower))) return domain;
  }
  return null;
}

// Build logo URL chain for a brand domain
function getLogoUrls(domain: string): string[] {
  return [
    // DeBounce free logo API (high quality, no key needed)
    `https://logo.debounce.com/${domain}`,
    // Google favicon (always works, lower quality but reliable)
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];
}

const CAT_ICONS: Record<string, LucideIcon> = {
  restaurant: UtensilsCrossed,
  shop: ShoppingCart,
  gas: Fuel,
};

interface PlaceLogoProps {
  name: string;
  googlePhotoUrl: string;
  categoryType: string;
  className?: string;
}

function PlaceLogoInner({ name, googlePhotoUrl, categoryType, className }: PlaceLogoProps) {
  const domain = getBrandDomain(name);
  const logoUrls = domain ? getLogoUrls(domain) : [];
  
  // Build full fallback chain: [logo APIs..., google photo]
  const allSources = [...logoUrls, ...(googlePhotoUrl ? [googlePhotoUrl] : [])];
  
  const [srcIndex, setSrcIndex] = useState(0);
  const [showIcon, setShowIcon] = useState(allSources.length === 0);

  const handleError = useCallback(() => {
    setSrcIndex((prev) => {
      const next = prev + 1;
      if (next >= allSources.length) {
        setShowIcon(true);
        return prev;
      }
      return next;
    });
  }, [allSources.length]);

  const FallbackIcon = CAT_ICONS[categoryType] || UtensilsCrossed;
  const currentSrc = allSources[srcIndex];
  const isLogoSource = srcIndex < logoUrls.length;

  return (
    <div className={cn(
      "w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden border border-border/10",
      className
    )}>
      {showIcon ? (
        <FallbackIcon className="w-5 h-5 text-primary/50" />
      ) : (
        <img
          src={currentSrc}
          alt={name}
          className={cn(
            isLogoSource ? "w-7 h-7 object-contain" : "w-full h-full object-cover"
          )}
          loading="lazy"
          onError={handleError}
        />
      )}
    </div>
  );
}

export const PlaceLogo = memo(PlaceLogoInner);
export default PlaceLogo;
