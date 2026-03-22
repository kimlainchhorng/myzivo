import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { airports } from "@/data/airports";

export interface SmartDeal {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  destinationKey: string;
  price: number;
  departureDate: string;
  returnDate: string | null;
  airline: string;
  airlineLogo: string | null;
  stops: number;
  duration: string;
  aiDescription: string;
  aiTip: string;
  dealScore: number;
  dealTag: string;
  savingsPercent: number;
  category: 'beach' | 'city' | 'adventure' | 'culture' | 'nightlife' | 'family';
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestAirport(lat: number, lng: number): string {
  const majorAirports = airports.filter(a => a.type === "international" && a.popularity >= 7);
  let nearest = "LAX";
  let minDist = Infinity;
  for (const ap of majorAirports) {
    const d = haversineDistance(lat, lng, ap.lat, ap.lng);
    if (d < minDist) { minDist = d; nearest = ap.code; }
  }
  return nearest;
}

export function useAISmartDeals(category?: string, autoDetectOrigin = false) {
  const [origin, setOrigin] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!autoDetectOrigin || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin(findNearestAirport(pos.coords.latitude, pos.coords.longitude)),
      () => setOrigin(undefined),
      { timeout: 5000 }
    );
  }, [autoDetectOrigin]);

  return useQuery({
    queryKey: ["ai-smart-deals", origin, category],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-smart-deals", {
        body: { origin, category },
      });
      if (error) {
        console.error("Failed to fetch AI smart deals:", error);
        return [] as SmartDeal[];
      }
      return (data?.deals || []) as SmartDeal[];
    },
    staleTime: 2 * 60 * 60 * 1000,
    gcTime: 4 * 60 * 60 * 1000,
    retry: 1,
  });
}
