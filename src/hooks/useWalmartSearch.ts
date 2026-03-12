/**
 * useWalmartSearch - Search Walmart products via edge function
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error: fnError } = await supabase.functions.invoke("walmart-search", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: null,
        // Pass query as URL search params via the function URL
      });

      // supabase.functions.invoke doesn't support query params natively,
      // so we use the POST body approach instead
      const { data: result, error: err } = await supabase.functions.invoke("walmart-search?q=" + encodeURIComponent(query));

      if (err) throw new Error(err.message);
      if (result?.error) throw new Error(result.error);

      setProducts(result?.products || []);
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
