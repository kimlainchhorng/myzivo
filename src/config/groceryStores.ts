/**
 * Grocery store configuration — single source of truth.
 * Add a new store here and it appears everywhere automatically.
 */
import logoWalmart from "@/assets/brand-logos/walmart.png";
import logoCostco from "@/assets/brand-logos/costco.png";
import logoTarget from "@/assets/brand-logos/target.png";
import logoKroger from "@/assets/brand-logos/kroger.png";

export type StoreName = "Walmart" | "Costco" | "Target" | "Kroger";

export interface StoreConfig {
  name: StoreName;
  logo: string;
  /** Edge-function name under /functions/v1/ */
  edgeFunction: string;
  placeholder: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const GROCERY_STORES: StoreConfig[] = [
  {
    name: "Walmart",
    logo: logoWalmart,
    edgeFunction: "walmart-search",
    placeholder: "Search Walmart products…",
    emptyTitle: "Search Walmart Products",
    emptyDescription:
      "Search for groceries, household items, and more. A ZIVO driver will shop and deliver to your door.",
  },
  {
    name: "Costco",
    logo: logoCostco,
    edgeFunction: "costco-search",
    placeholder: "Search Costco products…",
    emptyTitle: "Search Costco Products",
    emptyDescription:
      "Browse Costco's bulk deals and everyday essentials. A ZIVO driver handles the shopping for you.",
  },
  {
    name: "Target",
    logo: logoTarget,
    edgeFunction: "target-search",
    placeholder: "Search Target products…",
    emptyTitle: "Search Target Products",
    emptyDescription:
      "Find everyday essentials and top brands at Target. A ZIVO driver will shop and deliver to your door.",
  },
  {
    name: "Kroger",
    logo: logoKroger,
    edgeFunction: "kroger-search",
    placeholder: "Search Kroger products…",
    emptyTitle: "Search Kroger Products",
    emptyDescription:
      "Shop fresh groceries and household staples from Kroger. A ZIVO driver delivers right to you.",
  },
];

export const DEFAULT_STORE: StoreName = "Walmart";

/** Quick lookup helpers */
export function getStoreConfig(name: StoreName): StoreConfig {
  return GROCERY_STORES.find((s) => s.name === name) ?? GROCERY_STORES[0];
}
