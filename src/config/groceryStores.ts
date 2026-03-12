/**
 * Grocery store configuration — single source of truth.
 * Add a new store here and it appears everywhere automatically.
 */
import logoWalmart from "@/assets/brand-logos/walmart.png";
import logoCostco from "@/assets/brand-logos/costco.png";
import logoTarget from "@/assets/brand-logos/target.png";
import logoKroger from "@/assets/brand-logos/kroger.png";
import logoSamsClub from "@/assets/brand-logos/samsclub.png";
import logoBestBuy from "@/assets/brand-logos/bestbuy.png";
import logoLowes from "@/assets/brand-logos/lowes.png";
import logoPetco from "@/assets/brand-logos/petco.png";
import logoWalgreens from "@/assets/brand-logos/walgreens.png";

export type StoreName =
  | "Walmart"
  | "Costco"
  | "Target"
  | "Kroger"
  | "Sam's Club"
  | "Walgreens"
  | "Best Buy"
  | "Lowe's"
  | "Petco";

export interface StoreConfig {
  name: StoreName;
  /** URL-safe slug used in /grocery/store/:slug */
  slug: string;
  logo: string;
  /** Edge-function name under /functions/v1/ */
  edgeFunction: string;
  placeholder: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Optional promo badge shown on marketplace card */
  promo?: string;
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
  },
  {
    name: "Costco",
    slug: "costco",
    logo: logoCostco,
    edgeFunction: "costco-search",
    placeholder: "Search Costco products…",
    emptyTitle: "Search Costco Products",
    emptyDescription: "Browse Costco's bulk deals and everyday essentials. A ZIVO driver handles the shopping for you.",
    promo: "$10 off",
  },
  {
    name: "Sam's Club",
    slug: "sams-club",
    logo: logoSamsClub,
    edgeFunction: "walmart-search",
    placeholder: "Search Sam's Club products…",
    emptyTitle: "Search Sam's Club Products",
    emptyDescription: "Shop warehouse prices and bulk deals from Sam's Club. A ZIVO driver delivers right to you.",
  },
  {
    name: "Target",
    slug: "target",
    logo: logoTarget,
    edgeFunction: "target-search",
    placeholder: "Search Target products…",
    emptyTitle: "Search Target Products",
    emptyDescription: "Find everyday essentials and top brands at Target. A ZIVO driver will shop and deliver to your door.",
  },
  {
    name: "Walgreens",
    slug: "walgreens",
    logo: logoWalgreens,
    edgeFunction: "walmart-search",
    placeholder: "Search Walgreens products…",
    emptyTitle: "Search Walgreens Products",
    emptyDescription: "Shop pharmacy, health, and everyday essentials from Walgreens.",
    promo: "No markups",
  },
  {
    name: "Best Buy",
    slug: "best-buy",
    logo: logoBestBuy,
    edgeFunction: "walmart-search",
    placeholder: "Search Best Buy products…",
    emptyTitle: "Search Best Buy Products",
    emptyDescription: "Shop electronics, appliances, and tech from Best Buy. A ZIVO driver delivers to your door.",
    promo: "No markups",
  },
  {
    name: "Lowe's",
    slug: "lowes",
    logo: logoLowes,
    edgeFunction: "walmart-search",
    placeholder: "Search Lowe's products…",
    emptyTitle: "Search Lowe's Products",
    emptyDescription: "Shop home improvement, tools, and hardware from Lowe's.",
    promo: "$15 off",
  },
  {
    name: "Petco",
    slug: "petco",
    logo: logoPetco,
    edgeFunction: "walmart-search",
    placeholder: "Search Petco products…",
    emptyTitle: "Search Petco Products",
    emptyDescription: "Shop pet food, supplies, and essentials from Petco.",
    promo: "$10 off",
  },
  {
    name: "Kroger",
    slug: "kroger",
    logo: logoKroger,
    edgeFunction: "kroger-search",
    placeholder: "Search Kroger products…",
    emptyTitle: "Search Kroger Products",
    emptyDescription: "Shop fresh groceries and household staples from Kroger. A ZIVO driver delivers right to you.",
  },
];

export const DEFAULT_STORE: StoreName = "Walmart";

/** Look up by name */
export function getStoreConfig(name: StoreName): StoreConfig {
  return GROCERY_STORES.find((s) => s.name === name) ?? GROCERY_STORES[0];
}

/** Look up by URL slug */
export function getStoreBySlug(slug: string): StoreConfig | undefined {
  return GROCERY_STORES.find((s) => s.slug === slug);
}
