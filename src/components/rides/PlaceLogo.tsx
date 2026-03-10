/**
 * PlaceLogo – Shows brand logos for known chains, Google Places photo for others.
 * Uses locally stored brand logos for reliability.
 */
import { useState, useCallback, memo } from "react";
import { UtensilsCrossed, ShoppingCart, Fuel, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Local brand logo imports
import logoMcdonalds from "@/assets/brand-logos/mcdonalds.png";
import logoBurgerKing from "@/assets/brand-logos/burgerking.png";
import logoJackInTheBox from "@/assets/brand-logos/jackinthebox.png";
import logoTacoBell from "@/assets/brand-logos/tacobell.png";
import logoWendys from "@/assets/brand-logos/wendys.png";
import logoSubway from "@/assets/brand-logos/subway.png";
import logoStarbucks from "@/assets/brand-logos/starbucks.png";
import logoDunkin from "@/assets/brand-logos/dunkin.png";
import logoChickFilA from "@/assets/brand-logos/chickfila.png";
import logoPopeyes from "@/assets/brand-logos/popeyes.png";
import logoKfc from "@/assets/brand-logos/kfc.png";
import logoPizzaHut from "@/assets/brand-logos/pizzahut.png";
import logoDominos from "@/assets/brand-logos/dominos.png";
import logoShell from "@/assets/brand-logos/shell.png";
import logoChevron from "@/assets/brand-logos/chevron.png";
import logoExxon from "@/assets/brand-logos/exxon.png";
import logoMobil from "@/assets/brand-logos/mobil.png";
import logoBp from "@/assets/brand-logos/bp.png";
import logoValero from "@/assets/brand-logos/valero.png";
import logoCitgo from "@/assets/brand-logos/citgo.png";
import logoSunoco from "@/assets/brand-logos/sunoco.png";
import logoMarathon from "@/assets/brand-logos/marathon.png";
import logoCircleK from "@/assets/brand-logos/circlek.png";
import logoSpeedway from "@/assets/brand-logos/speedway.png";
import logoWalmart from "@/assets/brand-logos/walmart.png";
import logoTarget from "@/assets/brand-logos/target.png";
import logoCostco from "@/assets/brand-logos/costco.png";
import logo7Eleven from "@/assets/brand-logos/7eleven.png";
import logoWalgreens from "@/assets/brand-logos/walgreens.png";
import logoCvs from "@/assets/brand-logos/cvs.png";

// Brand keyword → local logo image mapping
// Keys are matched against lowercase place names using .includes()
const BRAND_LOGOS: [string, string][] = [
  // Restaurants (longer keys first for specificity)
  ["jack in the box", logoJackInTheBox],
  ["chick-fil-a", logoChickFilA],
  ["pizza hut", logoPizzaHut],
  ["burger king", logoBurgerKing],
  ["taco bell", logoTacoBell],
  ["panda express", logoStarbucks], // fallback
  ["mcdonald", logoMcdonalds],
  ["wendy", logoWendys],
  ["subway", logoSubway],
  ["starbucks", logoStarbucks],
  ["dunkin", logoDunkin],
  ["popeyes", logoPopeyes],
  ["kfc", logoKfc],
  ["domino", logoDominos],
  
  // Gas Stations
  ["exxonmobil", logoExxon],
  ["circle k", logoCircleK],
  ["chevron", logoChevron],
  ["marathon", logoMarathon],
  ["speedway", logoSpeedway],
  ["shell", logoShell],
  ["exxon", logoExxon],
  ["mobil", logoMobil],
  ["valero", logoValero],
  ["citgo", logoCitgo],
  ["sunoco", logoSunoco],
  ["bp", logoBp],

  // Shops & Grocery
  ["7-eleven", logo7Eleven],
  ["seven eleven", logo7Eleven],
  ["walgreens", logoWalgreens],
  ["walmart", logoWalmart],
  ["target", logoTarget],
  ["costco", logoCostco],
  ["cvs", logoCvs],
];

function getBrandLogoUrl(name: string): string | null {
  const lower = name.toLowerCase().trim();
  for (const [key, url] of BRAND_LOGOS) {
    if (lower.includes(key)) return url;
  }
  return null;
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
  const brandUrl = getBrandLogoUrl(name);
  const sources = [
    ...(brandUrl ? [brandUrl] : []),
    ...(googlePhotoUrl ? [googlePhotoUrl] : []),
  ];

  const [srcIndex, setSrcIndex] = useState(0);
  const [showIcon, setShowIcon] = useState(sources.length === 0);

  const handleError = useCallback(() => {
    setSrcIndex((prev) => {
      const next = prev + 1;
      if (next >= sources.length) {
        setShowIcon(true);
        return prev;
      }
      return next;
    });
  }, [sources.length]);

  const FallbackIcon = CAT_ICONS[categoryType] || UtensilsCrossed;
  const currentSrc = sources[srcIndex];
  const isBrandLogo = brandUrl && srcIndex === 0;

  return (
    <div className={cn(
      "w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-border/10",
      className
    )}>
      {showIcon ? (
        <FallbackIcon className="w-5 h-5 text-primary/50" />
      ) : (
        <img
          src={currentSrc}
          alt={name}
          className={cn(
            isBrandLogo ? "w-8 h-8 object-contain" : "w-full h-full object-cover"
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