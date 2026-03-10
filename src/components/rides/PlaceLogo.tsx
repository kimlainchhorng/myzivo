/**
 * PlaceLogo – tries brand logo (Clearbit), then Google Places photo, then category icon.
 * Clearbit Logo API is free and requires no API key.
 */
import { useState, useCallback, memo } from "react";
import { UtensilsCrossed, ShoppingCart, Fuel, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Normalize business name → probable domain
function guessDomain(name: string): string | null {
  const cleaned = name
    .toLowerCase()
    .replace(/[''\u2019]/g, "")        // McDonald's → McDonalds
    .replace(/[^a-z0-9\s-]/g, "")      // strip special chars
    .replace(/\s+/g, "")               // join words
    .trim();

  if (!cleaned || cleaned.length < 2) return null;
  return `${cleaned}.com`;
}

// Well-known brand overrides for accurate domain mapping
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
  "arbys": "arbys.com",
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
  "lowes": "lowes.com",
  "autozone": "autozone.com",
  "o'reilly": "oreillyauto.com",
  "advance auto parts": "advanceautoparts.com",
  "shell": "shell.com",
  "chevron": "chevron.com",
  "exxon": "exxon.com",
  "exxonmobil": "exxonmobil.com",
  "bp": "bp.com",
  "valero": "valero.com",
  "marathon": "marathonpetroleum.com",
  "circle k": "circlek.com",
  "speedway": "speedway.com",
  "racetrac": "racetrac.com",
  "wawa": "wawa.com",
  "sheetz": "sheetz.com",
  "quiktrip": "quiktrip.com",
  "qt": "quiktrip.com",
  "murphy usa": "murphyusa.com",
  "sam's club": "samsclub.com",
  "buc-ee's": "buc-ees.com",
};

function getBrandDomain(name: string): string | null {
  const lower = name.toLowerCase().trim();
  // Try exact match first
  if (BRAND_DOMAINS[lower]) return BRAND_DOMAINS[lower];
  // Try partial match (e.g. "McDonald's Restaurant" contains "mcdonald's")
  for (const [key, domain] of Object.entries(BRAND_DOMAINS)) {
    if (lower.includes(key) || key.includes(lower)) return domain;
  }
  return guessDomain(name);
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
  // State: 0 = trying clearbit, 1 = trying google photo, 2 = icon fallback
  const [stage, setStage] = useState(0);

  const domain = getBrandDomain(name);
  const clearbitUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

  const handleClearbitError = useCallback(() => {
    setStage(googlePhotoUrl ? 1 : 2);
  }, [googlePhotoUrl]);

  const handleGoogleError = useCallback(() => {
    setStage(2);
  }, []);

  const FallbackIcon = CAT_ICONS[categoryType] || UtensilsCrossed;

  return (
    <div className={cn(
      "w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden border border-border/10",
      className
    )}>
      {stage === 0 && clearbitUrl ? (
        <img
          src={clearbitUrl}
          alt={name}
          className="w-7 h-7 object-contain"
          loading="lazy"
          onError={handleClearbitError}
        />
      ) : stage === 0 && !clearbitUrl ? (
        // No clearbit domain guess, skip to google photo
        googlePhotoUrl ? (
          <img
            src={googlePhotoUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleGoogleError}
          />
        ) : (
          <FallbackIcon className="w-5 h-5 text-primary/50" />
        )
      ) : stage === 1 ? (
        <img
          src={googlePhotoUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleGoogleError}
        />
      ) : (
        <FallbackIcon className="w-5 h-5 text-primary/50" />
      )}
    </div>
  );
}

export const PlaceLogo = memo(PlaceLogoInner);
export default PlaceLogo;
