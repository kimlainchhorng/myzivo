/**
 * useLiveActivityCount — counts how many things are "live" for the user
 * across rides, food orders, and upcoming flights/hotels.
 *
 * Subscribes to Supabase realtime channels for `trips`, `food_orders`,
 * `flight_bookings`, and `hotel_bookings` so the count updates the moment a
 * driver accepts, an order changes status, or a booking is added — no
 * polling lag. A 5-minute heartbeat keeps the count fresh in case a realtime
 * event was dropped (e.g. on app resume).
 *
 * Used by the bottom nav and AppMore tab to show a red dot / count badge.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface LiveActivity {
  rides: number;
  orders: number;
  upcoming: number;
  total: number;
}

const ZERO: LiveActivity = { rides: 0, orders: 0, upcoming: 0, total: 0 };

const HEARTBEAT_MS = 5 * 60_000;

export function useLiveActivityCount(): LiveActivity {
  const { user } = useAuth();
  const [state, setState] = useState<LiveActivity>(ZERO);

  useEffect(() => {
    if (!user?.id) {
      setState(ZERO);
      return;
    }
    let cancelled = false;
    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const refetch = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const sb = supabase as unknown as {
        from: (t: string) => {
          select: (c: string, o: { count: "exact"; head: true }) => {
            eq: (col: string, v: string) => {
              in: (col: string, v: string[]) => Promise<{ count: number | null }>;
              gte: (col: string, v: string) => Promise<{ count: number | null }>;
            };
          };
        };
      };
      const [rides, orders, flights, hotels] = await Promise.all([
        sb.from("trips").select("id", { count: "exact", head: true })
          .eq("rider_id", user.id)
          .in("status", ["accepted", "en_route", "arriving", "in_progress"]),
        sb.from("food_orders").select("id", { count: "exact", head: true })
          .eq("customer_id", user.id)
          .in("status", ["confirmed", "preparing", "ready", "out_for_delivery"]),
        sb.from("flight_bookings").select("id", { count: "exact", head: true })
          .eq("customer_id", user.id)
          .gte("departure_date", today),
        sb.from("hotel_bookings").select("id", { count: "exact", head: true })
          .eq("customer_id", user.id)
          .gte("check_in_date", today),
      ]);

      if (cancelled) return;
      const r = rides.count ?? 0;
      const o = orders.count ?? 0;
      const f = flights.count ?? 0;
      const h = hotels.count ?? 0;
      const upcoming = f + h;
      setState({ rides: r, orders: o, upcoming, total: r + o + upcoming });
    };

    refetch().catch(() => {});

    const channel = supabase
      .channel(`live-activity:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "trips", filter: `rider_id=eq.${user.id}` }, () => refetch().catch(() => {}))
      .on("postgres_changes", { event: "*", schema: "public", table: "food_orders", filter: `customer_id=eq.${user.id}` }, () => refetch().catch(() => {}))
      .on("postgres_changes", { event: "*", schema: "public", table: "flight_bookings", filter: `user_id=eq.${user.id}` }, () => refetch().catch(() => {}))
      .on("postgres_changes", { event: "*", schema: "public", table: "hotel_bookings", filter: `user_id=eq.${user.id}` }, () => refetch().catch(() => {}))
      .subscribe();

    heartbeat = setInterval(() => refetch().catch(() => {}), HEARTBEAT_MS);

    return () => {
      cancelled = true;
      if (heartbeat) clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return state;
}
