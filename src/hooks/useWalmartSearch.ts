/**
 * useWalmartSearch - Search Walmart products via edge function
 */
import { useState, useCallback } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface WalmartProduct {
  productId: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  rating: number | null;
  inStock: boolean;
}

export function useWalmartSearch() {
  const [products, setProducts] = useState<WalmartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `${SUPABASE_URL}/functions/v1/walmart-search?q=${encodeURIComponent(query)}`;
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
      const mapped = data.products || [];
      console.log("[WalmartSearch] Raw response:", data);
      console.log("[WalmartSearch] Mapped products:", mapped);
      console.log("[WalmartSearch] Result count:", mapped.length);
      setProducts(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Search failed";
      setError(msg);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setProducts([]);
    setError(null);
  }, []);

  return { products, isLoading, error, search, clearResults };
}
