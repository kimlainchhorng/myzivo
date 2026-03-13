/**
 * useStoreSearch - Generic product search hook with pagination
 */
import { useState, useCallback, useRef } from "react";
import type { StoreName } from "@/config/groceryStores";
import { getStoreConfig } from "@/config/groceryStores";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://slirphzzwcogdbkeicff.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI";

export interface StoreProduct {
  productId: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  rating: number | null;
  inStock: boolean;
  store: string;
}

export function useStoreSearch(store: StoreName) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const lastQueryRef = useRef("");

  const fetchPage = useCallback(
    async (query: string, page: number, append: boolean) => {
      const cfg = getStoreConfig(store);
      const url = `${SUPABASE_URL}/functions/v1/${cfg.edgeFunction}?q=${encodeURIComponent(query)}&page=${page}`;
      console.log(`[StoreSearch][${store}] Fetching page ${page}:`, query);

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

      console.log(`[StoreSearch][${store}] Page ${page} results:`, mapped.length);

      if (append) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.productId));
          const newItems = mapped.filter((p) => !existingIds.has(p.productId));
          return [...prev, ...newItems];
        });
      } else {
        // Deduplicate even the first page
        const seen = new Set<string>();
        const deduped = mapped.filter((p) => {
          if (seen.has(p.productId)) return false;
          seen.add(p.productId);
          return true;
        });
        setProducts(deduped);
      }

      setHasMore(mapped.length >= 10);
    },
    [store]
  );

  const search = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setProducts([]);
        setHasMore(false);
        return;
      }

      pageRef.current = 1;
      lastQueryRef.current = query;
      setIsLoading(true);
      setError(null);

      try {
        await fetchPage(query, 1, false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Search failed";
        setError(msg);
        setProducts([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPage]
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !lastQueryRef.current) return;

    const nextPage = pageRef.current + 1;
    setIsLoadingMore(true);

    try {
      await fetchPage(lastQueryRef.current, nextPage, true);
      pageRef.current = nextPage;
    } catch (e) {
      console.error("[StoreSearch] loadMore error:", e);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, isLoadingMore]);

  const clearResults = useCallback(() => {
    setProducts([]);
    setError(null);
    setHasMore(false);
    pageRef.current = 1;
    lastQueryRef.current = "";
  }, []);

  return { products, isLoading, isLoadingMore, hasMore, error, search, loadMore, clearResults };
}
