/**
 * PlaceLogo – Shows brand logos for known chains, Google Places photo for others.
 * Uses direct Wikipedia/brand CDN logo URLs for reliability.
 */
import { useState, useCallback, memo } from "react";
import { UtensilsCrossed, ShoppingCart, Fuel, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Direct logo URLs from reliable CDNs (Wikipedia commons, brand CDNs)
const BRAND_LOGOS: Record<string, string> = {
  // ── Restaurants ──
  "mcdonald": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/120px-McDonald%27s_Golden_Arches.svg.png",
  "burger king": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/120px-Burger_King_logo_%281999%29.svg.png",
  "jack in the box": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jack_in_the_Box_2009_logo.svg/120px-Jack_in_the_Box_2009_logo.svg.png",
  "taco bell": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Taco_Bell_2016.svg/120px-Taco_Bell_2016.svg.png",
  "wendy": "https://upload.wikimedia.org/wikipedia/en/thumb/3/32/Wendy%27s_full_logo_2012.svg/120px-Wendy%27s_full_logo_2012.svg.png",
  "subway": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Subway_2016_logo.svg/120px-Subway_2016_logo.svg.png",
  "starbucks": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/120px-Starbucks_Corporation_Logo_2011.svg.png",
  "dunkin": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Dunkin%27_Donuts_logo.svg/120px-Dunkin%27_Donuts_logo.svg.png",
  "chick-fil-a": "https://upload.wikimedia.org/wikipedia/en/thumb/0/02/Chick-fil-A_Logo.svg/120px-Chick-fil-A_Logo.svg.png",
  "popeyes": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Popeyes_logo.svg/120px-Popeyes_logo.svg.png",
  "kfc": "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/120px-KFC_logo.svg.png",
  "pizza hut": "https://upload.wikimedia.org/wikipedia/sco/thumb/d/d2/Pizza_Hut_logo.svg/120px-Pizza_Hut_logo.svg.png",
  "domino": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Dominos_pizza_logo.svg/120px-Dominos_pizza_logo.svg.png",
  "papa john": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Papa_John%27s_Logo_2019.svg/120px-Papa_John%27s_Logo_2019.svg.png",
  "chipotle": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Chipotle_Mexican_Grill_logo.svg/120px-Chipotle_Mexican_Grill_logo.svg.png",
  "panda express": "https://upload.wikimedia.org/wikipedia/en/thumb/8/85/Panda_Express_logo.svg/120px-Panda_Express_logo.svg.png",
  "sonic": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sonic_Drive-In_logo.svg/120px-Sonic_Drive-In_logo.svg.png",
  "whataburger": "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Whataburger_logo.svg/120px-Whataburger_logo.svg.png",
  "arby": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Arby%27s_logo.svg/120px-Arby%27s_logo.svg.png",
  "dairy queen": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/DQ_logo.svg/120px-DQ_logo.svg.png",
  "five guys": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Five_Guys_logo.svg/120px-Five_Guys_logo.svg.png",
  "in-n-out": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/In-N-Out_Burger_logo.svg/120px-In-N-Out_Burger_logo.svg.png",
  "chili": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Chili%27s_Logo.svg/120px-Chili%27s_Logo.svg.png",
  "applebee": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Applebees_logo.svg/120px-Applebees_logo.svg.png",
  "ihop": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/IHOP_logo.svg/120px-IHOP_logo.svg.png",
  "denny": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Dennys-logo.svg/120px-Dennys-logo.svg.png",
  "waffle house": "https://upload.wikimedia.org/wikipedia/en/thumb/3/35/Waffle_House_Logo.svg/120px-Waffle_House_Logo.svg.png",
  "olive garden": "https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Olive_Garden_Logo.svg/120px-Olive_Garden_Logo.svg.png",
  "red lobster": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Red_Lobster_Logo.svg/120px-Red_Lobster_Logo.svg.png",
  "outback": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Outback_Steakhouse.svg/120px-Outback_Steakhouse.svg.png",
  "panera": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Panera_Bread_logo.svg/120px-Panera_Bread_logo.svg.png",
  "wingstop": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Wingstop_logo.svg/120px-Wingstop_logo.svg.png",
  "raising cane": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Raising_Cane%27s_Chicken_Fingers_logo.svg/120px-Raising_Cane%27s_Chicken_Fingers_logo.svg.png",
  "zaxby": "https://upload.wikimedia.org/wikipedia/en/thumb/7/73/Zaxby%27s_logo.svg/120px-Zaxby%27s_logo.svg.png",
  "bojangles": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Bojangles%27_logo.svg/120px-Bojangles%27_logo.svg.png",
  "church": "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Church%27s_Chicken_logo.svg/120px-Church%27s_Chicken_logo.svg.png",
  "el pollo loco": "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/El_Pollo_Loco_logo.svg/120px-El_Pollo_Loco_logo.svg.png",
  "jimmy john": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Jimmy_Johns_logo.svg/120px-Jimmy_Johns_logo.svg.png",
  "jersey mike": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Jersey_Mike%27s_Subs_Logo.svg/120px-Jersey_Mike%27s_Subs_Logo.svg.png",
  "firehouse sub": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/Firehouse_Subs_logo.svg/120px-Firehouse_Subs_logo.svg.png",
  "little caesars": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Little_Caesars_logo.svg/120px-Little_Caesars_logo.svg.png",
  "cracker barrel": "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Cracker_Barrel_Old_Country_Store_logo.svg/120px-Cracker_Barrel_Old_Country_Store_logo.svg.png",
  "golden corral": "https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Golden_Corral_logo.svg/120px-Golden_Corral_logo.svg.png",

  // ── Gas Stations ──
  "shell": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Shell_logo.svg/120px-Shell_logo.svg.png",
  "chevron": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Chevron_Logo.svg/120px-Chevron_Logo.svg.png",
  "exxon": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/ExxonMobil_Logo.svg/120px-ExxonMobil_Logo.svg.png",
  "mobil": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/ExxonMobil_Logo.svg/120px-ExxonMobil_Logo.svg.png",
  "bp": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/BP_Helios_logo.svg/120px-BP_Helios_logo.svg.png",
  "valero": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Valero_logo.svg/120px-Valero_logo.svg.png",
  "citgo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Citgo_logo.svg/120px-Citgo_logo.svg.png",
  "sunoco": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Sunoco_LP_logo.svg/120px-Sunoco_LP_logo.svg.png",
  "marathon": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Marathon_Petroleum_logo.svg/120px-Marathon_Petroleum_logo.svg.png",
  "circle k": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Circle_K_logo_2016.svg/120px-Circle_K_logo_2016.svg.png",
  "speedway": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Speedway_LLC_logo.svg/120px-Speedway_LLC_logo.svg.png",
  "racetrac": "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/RaceTrac_logo.svg/120px-RaceTrac_logo.svg.png",
  "wawa": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Wawa_logo.svg/120px-Wawa_logo.svg.png",
  "sheetz": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Sheetz_logo.svg/120px-Sheetz_logo.svg.png",
  "quiktrip": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/QuikTrip_Logo.svg/120px-QuikTrip_Logo.svg.png",
  "love": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Love%27s_Travel_Stops_%26_Country_Stores_logo.svg/120px-Love%27s_Travel_Stops_%26_Country_Stores_logo.svg.png",
  "pilot": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Pilot_Travel_Centers_logo.svg/120px-Pilot_Travel_Centers_logo.svg.png",
  "flying j": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Pilot_Travel_Centers_logo.svg/120px-Pilot_Travel_Centers_logo.svg.png",
  "casey": "https://upload.wikimedia.org/wikipedia/en/thumb/6/62/Casey%27s_General_Stores_logo.svg/120px-Casey%27s_General_Stores_logo.svg.png",
  "sinclair": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sinclair_Oil_logo.svg/120px-Sinclair_Oil_logo.svg.png",
  "phillips 66": "https://upload.wikimedia.org/wikipedia/en/thumb/4/40/Phillips_66_logo.svg/120px-Phillips_66_logo.svg.png",
  "conoco": "https://upload.wikimedia.org/wikipedia/en/thumb/4/40/Phillips_66_logo.svg/120px-Phillips_66_logo.svg.png",
  "murphy": "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Murphy_USA_logo.svg/120px-Murphy_USA_logo.svg.png",
  "buc-ee": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Buc-ee%27s_logo.svg/120px-Buc-ee%27s_logo.svg.png",

  // ── Shops & Grocery ──
  "walmart": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/120px-Walmart_logo.svg.png",
  "target": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Target_logo.svg/120px-Target_logo.svg.png",
  "costco": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Costco_Wholesale_logo_2010-10-26.svg/120px-Costco_Wholesale_logo_2010-10-26.svg.png",
  "kroger": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Kroger_logo_%281961-2019%29.svg/120px-Kroger_logo_%281961-2019%29.svg.png",
  "safeway": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Safeway_Logo.svg/120px-Safeway_Logo.svg.png",
  "whole foods": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Whole_Foods_Market_201x_logo.svg/120px-Whole_Foods_Market_201x_logo.svg.png",
  "trader joe": "https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Trader_Joe%27s_Logo.svg/120px-Trader_Joe%27s_Logo.svg.png",
  "aldi": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/ALDI_Nord_Logo_2015.svg/120px-ALDI_Nord_Logo_2015.svg.png",
  "publix": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Publix_Logo.svg/120px-Publix_Logo.svg.png",
  "7-eleven": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/7-eleven_logo.svg/120px-7-eleven_logo.svg.png",
  "walgreens": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Walgreens_Logo.svg/120px-Walgreens_Logo.svg.png",
  "cvs": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/CVS_Health_logo.svg/120px-CVS_Health_logo.svg.png",
  "dollar general": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Dollar_General_logo.svg/120px-Dollar_General_logo.svg.png",
  "dollar tree": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Dollar_Tree_logo.svg/120px-Dollar_Tree_logo.svg.png",
  "family dollar": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Family_Dollar_logo.svg/120px-Family_Dollar_logo.svg.png",
  "home depot": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TheHomeDepot.svg/120px-TheHomeDepot.svg.png",
  "lowe": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Lowes_Companies_Logo.svg/120px-Lowes_Companies_Logo.svg.png",
  "autozone": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/AutoZone_logo.svg/120px-AutoZone_logo.svg.png",
  "o'reilly": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/O%27Reilly_Auto_Parts_Logo.svg/120px-O%27Reilly_Auto_Parts_Logo.svg.png",
  "advance auto": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Advance_Auto_Parts_Logo.svg/120px-Advance_Auto_Parts_Logo.svg.png",
  "sam's club": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Sam%27s_Club.svg/120px-Sam%27s_Club.svg.png",
  "food lion": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Food_Lion_logo.svg/120px-Food_Lion_logo.svg.png",
  "piggly wiggly": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a8/Piggly_Wiggly_logo.svg/120px-Piggly_Wiggly_logo.svg.png",
  "winn-dixie": "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Winn-Dixie_logo.svg/120px-Winn-Dixie_logo.svg.png",
  "ace hardware": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ace_Hardware_Logo.svg/120px-Ace_Hardware_Logo.svg.png",
};

/**
 * Find a brand logo URL by checking if the place name contains a known brand keyword.
 * Sorted by longest key first to match "jack in the box" before "jack".
 */
const SORTED_BRAND_ENTRIES = Object.entries(BRAND_LOGOS)
  .sort((a, b) => b[0].length - a[0].length);

function getBrandLogoUrl(name: string): string | null {
  const lower = name.toLowerCase().trim();
  for (const [key, url] of SORTED_BRAND_ENTRIES) {
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

  // Build fallback chain: [brand logo, google photo]
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
            isBrandLogo ? "w-7 h-7 object-contain" : "w-full h-full object-cover"
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