/**
 * useStorePins — shared query for active store pins
 * Used by StoreMapPage (pins) and StoresListPage (full list).
 * Adds localStorage cache + offline fallback so the list paints
 * instantly on weak/offline connections.
 */
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StorePin {
  id: string;
  name: string;
  slug: string;
  category: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  rating: number | null;
  logo_url: string | null;
  latitude: number;
  longitude: number;
}

const CACHE_KEY = "zivo:stores:cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

interface CachedStores {
  data: StorePin[];
  ts: number;
}

function readCache(): CachedStores | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedStores;
    if (!parsed?.data || !Array.isArray(parsed.data)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: StorePin[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    /* quota or private mode — best effort */
  }
}

function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function useStorePins() {
  const online = useOnline();
  const cached = useMemo(() => readCache(), []);
  const cacheFresh = cached && Date.now() - cached.ts < CACHE_TTL ? cached.data : undefined;

  const query = useQuery({
    queryKey: ["store-map-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select(
          "id, name, slug, category, address, phone, hours, rating, logo_url, latitude, longitude"
        )
        .eq("is_active", true);
      if (error) throw error;
      const rows = (data || []) as StorePin[];
      writeCache(rows);
      return rows;
    },
    staleTime: 60_000,
    placeholderData: cacheFresh,
    enabled: online, // when offline, rely on cache only
  });

  // When offline, surface cached data directly.
  const effectiveData = !online && cached ? cached.data : query.data;

  const stores = useMemo(
    () =>
      (effectiveData || []).filter((s) => s.latitude != null && s.longitude != null),
    [effectiveData]
  );

  const isOffline = !online;
  const cacheAgeMs = cached ? Date.now() - cached.ts : null;

  return {
    ...query,
    data: effectiveData,
    stores,
    allStores: (effectiveData || []) as StorePin[],
    isOffline,
    cacheAgeMs,
  };
}

/** Haversine distance in miles. */
export function distanceMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
