/**
 * Grocery store configuration — single source of truth.
 * Only stores with real product API integrations are listed.
 */
import logoWalmart from "@/assets/brand-logos/walmart.png";
import logoCostco from "@/assets/brand-logos/costco.png";
import logoTarget from "@/assets/brand-logos/target.png";
import logoKroger from "@/assets/brand-logos/kroger.png";

export type StoreName =
  | "Walmart"
  | "Costco"
  | "Target"
  | "Kroger";

export type StoreCategory =
  | "grocery"
  | "food-market"
  | "fashion"
  | "restaurant"
  | "drink"
  | "mall"
  | "supermarket"
  | "car-rental"
  | "car-dealership"
  | "auto-repair"
  | "tire-shop"
  | "auto-parts"
  | "salon"
  | "electronics"
  | "pharmacy"
  | "other";

export const STORE_CATEGORY_OPTIONS: { value: StoreCategory; label: string }[] = [
  { value: "grocery", label: "Grocery" },
  { value: "food-market", label: "Food Market" },
  { value: "fashion", label: "Fashion Market" },
  { value: "restaurant", label: "Restaurant" },
  { value: "drink", label: "Drink" },
  { value: "mall", label: "Mall" },
  { value: "supermarket", label: "Supermarket" },
  { value: "car-rental", label: "Rental Car" },
  { value: "car-dealership", label: "Car Dealership" },
  { value: "auto-repair", label: "Auto Repair" },
  { value: "tire-shop", label: "Tire Shop" },
  { value: "auto-parts", label: "Auto Parts" },
  { value: "salon", label: "Salon" },
  { value: "electronics", label: "Electronics" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "other", label: "Other" },
];

export interface StoreConfig {
  name: StoreName;
  slug: string;
  logo: string;
  edgeFunction: string;
  placeholder: string;
  emptyTitle: string;
  emptyDescription: string;
  promo?: string;
  defaultQuery: string;
  category: StoreCategory;
  /** Estimated delivery time in minutes */
  deliveryMin: number;
  /** Store rating (1-5) */
  rating: number;
  /** Store hours display */
  hours: string;
  /** Markets where this store is available (ISO country codes). Empty = all markets */
  markets?: string[];
}

export const GROCERY_STORES: StoreConfig[] = [
  {
    name: "Walmart",
    slug: "walmart",
    logo: logoWalmart,
    edgeFunction: "walmart-search",
    placeholder: "Search Walmart products…",
    emptyTitle: "Search Walmart Products",
    emptyDescription: "Search for groceries, household items, and more. A ZIVO driver will shop and deliver to your door.",
    defaultQuery: "chips soda milk bread chicken eggs cheese cookies juice water cereal pizza snacks candy ice cream coffee frozen vegetables beef bacon shrimp garden tools patio furniture toys shoes clothes detergent soap vitamins diapers dog food cat food batteries toothpaste shampoo paper towels yogurt butter rice pasta sauce",
    category: "grocery",
    deliveryMin: 35,
    rating: 4.6,
    hours: "6am–11pm",
    markets: ["US"],
  },
  {
    name: "Costco",
    slug: "costco",
    logo: logoCostco,
    edgeFunction: "costco-search",
    placeholder: "Search Costco products…",
    emptyTitle: "Search Costco Products",
    emptyDescription: "Browse Costco's bulk deals and everyday essentials. A ZIVO driver handles the shopping for you.",
    defaultQuery: "chips soda milk bread chicken eggs cheese cookies juice water cereal pizza snacks candy ice cream coffee frozen vegetables beef bacon shrimp garden tools patio furniture toys shoes clothes detergent soap vitamins diapers dog food cat food batteries toothpaste shampoo paper towels yogurt butter rice pasta sauce",
    category: "grocery",
    deliveryMin: 50,
    rating: 4.8,
    hours: "10am–8:30pm",
    markets: ["US"],
  },
  {
    name: "Target",
    slug: "target",
    logo: logoTarget,
    edgeFunction: "target-search",
    placeholder: "Search Target products…",
    emptyTitle: "Search Target Products",
    emptyDescription: "Find everyday essentials and top brands at Target. A ZIVO driver will shop and deliver to your door.",
    defaultQuery: "chips soda milk bread chicken eggs cheese cookies juice water cereal pizza snacks candy ice cream coffee frozen vegetables beef bacon shrimp garden tools patio furniture toys shoes clothes detergent soap vitamins diapers dog food cat food batteries toothpaste shampoo paper towels yogurt butter rice pasta sauce",
    category: "grocery",
    deliveryMin: 40,
    rating: 4.7,
    hours: "8am–10pm",
    markets: ["US"],
  },
  {
    name: "Kroger",
    slug: "kroger",
    logo: logoKroger,
    edgeFunction: "kroger-search",
    placeholder: "Search Kroger products…",
    emptyTitle: "Search Kroger Products",
    emptyDescription: "Shop fresh groceries and household staples from Kroger. A ZIVO driver delivers right to you.",
    defaultQuery: "chips soda milk bread chicken eggs cheese cookies juice water cereal pizza snacks candy ice cream coffee frozen vegetables beef bacon shrimp garden tools patio furniture toys shoes clothes detergent soap vitamins diapers dog food cat food batteries toothpaste shampoo paper towels yogurt butter rice pasta sauce",
    category: "grocery",
    deliveryMin: 35,
    rating: 4.5,
    hours: "6am–12am",
    markets: ["US"],
  },
];

export const DEFAULT_STORE: StoreName = "Walmart";

/** Filter stores available in a specific market (ISO country code, e.g. "US", "KH") */
export function getStoresForMarket(countryCode: string): StoreConfig[] {
  const code = countryCode.toUpperCase();
  return GROCERY_STORES.filter((s) => !s.markets || s.markets.length === 0 || s.markets.includes(code));
}

/** Look up by name */
export function getStoreConfig(name: StoreName): StoreConfig {
  return GROCERY_STORES.find((s) => s.name === name) ?? GROCERY_STORES[0];
}

/** Look up by URL slug */
export function getStoreBySlug(slug: string): StoreConfig | undefined {
  return GROCERY_STORES.find((s) => s.slug === slug);
}
