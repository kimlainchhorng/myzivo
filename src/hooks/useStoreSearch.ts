/**
 * useStoreSearch - Generic product search hook driven by store config
 */
import { useState, useCallback } from "react";
import type { StoreName } from "@/config/groceryStores";
import { getStoreConfig } from "@/config/groceryStores";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface StoreProduct {
  productId: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  rating: number | null;
  inStock: boolean;
  store: StoreName;
}

export function useStoreSearch(store: StoreName) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setProducts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const cfg = getStoreConfig(store);
        const url = `${SUPABASE_URL}/functions/v1/${cfg.edgeFunction}?q=${encodeURIComponent(query)}`;
        console.log(`[StoreSearch][${store}] Searching:`, query);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${SUPABASE_KEY}`,
            apikey: SUPABASE_KEY,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }

        const data = await res.json();
        const mapped: StoreProduct[] = (data.products || []).map((p: any) => ({
          ...p,
          store,
        }));
        console.log(`[StoreSearch][${store}] Results:`, mapped.length);
        setProducts(mapped);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Search failed";
        setError(msg);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [store]
  );

  const clearResults = useCallback(() => {
    setProducts([]);
    setError(null);
  }, []);

  return { products, isLoading, error, search, clearResults };
}
