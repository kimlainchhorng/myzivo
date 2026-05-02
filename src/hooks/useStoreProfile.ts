/**
 * useStoreProfile - Fetch store profile and products from Supabase
 * For manual-catalog stores (e.g. Cambodia market)
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  market: string;
  category: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  rating: number | null;
  delivery_min: number | null;
  gallery_images: string[] | null;
  is_active: boolean;
  facebook_url: string | null;
  latitude: number | null;
  longitude: number | null;
  payment_types: string[];
}

export interface StoreProductItem {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  brand: string | null;
  sku: string | null;
  in_stock: boolean;
  sort_order: number;
}

export function useStoreProfile(slug: string) {
  return useQuery({
    queryKey: ["store-profile", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as StoreProfile | null;
    },
    enabled: !!slug,
    staleTime: 30_000, // refetch after 30s so admin changes appear quickly
    refetchOnWindowFocus: true,
  });
}

export function useStoreProducts(storeId: string | undefined, category?: string) {
  return useQuery({
    queryKey: ["store-products", storeId, category],
    queryFn: async () => {
      let q = supabase
        .from("store_products")
        .select("*")
        .eq("store_id", storeId!)
        .eq("in_stock", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (category) {
        q = q.eq("category", category);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as StoreProductItem[];
    },
    enabled: !!storeId,
  });
}

export function useStoreProductCategories(storeId: string | undefined) {
  return useQuery({
    queryKey: ["store-product-categories", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_products")
        .select("category")
        .eq("store_id", storeId!)
        .eq("in_stock", true);
      if (error) throw error;
      const cats = new Set<string>();
      (data || []).forEach((d: any) => { if (d.category) cats.add(d.category); });
      return Array.from(cats).sort();
    },
    enabled: !!storeId,
  });
}

export function useMarketStores(market: string) {
  return useQuery({
    queryKey: ["market-stores", market],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("*")
        .eq("market", market)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data || []) as StoreProfile[];
    },
    enabled: !!market,
  });
}
