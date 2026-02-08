/**
 * useEatsDriver Hook
 * Fetches assigned driver info for an order with real-time location updates
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EatsDriver {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  rating: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  license_plate: string | null;
  current_lat: number | null;
  current_lng: number | null;
}

export function useEatsDriver(driverId: string | null | undefined) {
  const [driver, setDriver] = useState<EatsDriver | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!driverId) {
      setDriver(null);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchDriver = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("drivers")
          .select(
            "id, full_name, phone, avatar_url, rating, current_lat, current_lng"
          )
          .eq("id", driverId)
          .single();

        if (fetchError) throw fetchError;
        setDriver(data as unknown as EatsDriver);
        setError(null);
      } catch (e) {
        setError(e as Error);
        setDriver(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();

    // Subscribe to driver location updates
    channel = supabase
      .channel(`eats-driver-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
          filter: `id=eq.${driverId}`,
        },
        (payload) => {
          if (payload.new) {
            setDriver((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                current_lat: (payload.new as any).current_lat,
                current_lng: (payload.new as any).current_lng,
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [driverId]);

  return { driver, loading, error };
}
