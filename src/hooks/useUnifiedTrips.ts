/**
 * Unified Trips Hook
 * Aggregates bookings across all ZIVO services
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export type ServiceType = "flights" | "cars" | "p2p_cars" | "rides" | "eats" | "move" | "hotels";

export interface UnifiedTrip {
  id: string;
  service: ServiceType;
  title: string;
  subtitle: string;
  status: string;
  date: string;
  amount: number;
  currency: string;
  icon: string;
  details: Record<string, unknown>;
}

export interface TripsFilter {
  services?: ServiceType[];
  status?: "upcoming" | "active" | "completed" | "cancelled" | "all";
  limit?: number;
}

export function useUnifiedTrips(filter: TripsFilter = {}) {
  const { user } = useAuth();
  const { services, status = "all", limit = 50 } = filter;

  return useQuery({
    queryKey: ["unified-trips", user?.id, services, status, limit],
    queryFn: async () => {
      const trips: UnifiedTrip[] = [];

      // Fetch P2P Car Rentals
      if (!services || services.includes("p2p_cars")) {
        const { data } = await supabase
          .from("p2p_bookings")
          .select("id, status, pickup_date, return_date, total_amount")
          .eq("renter_id", user!.id)
          .order("pickup_date", { ascending: false })
          .limit(limit);

        (data || []).forEach((b: any) => {
          trips.push({
            id: b.id,
            service: "p2p_cars",
            title: "Car Rental",
            subtitle: `${format(new Date(b.pickup_date), "MMM d")} - ${format(new Date(b.return_date), "MMM d")}`,
            status: b.status || "pending",
            date: b.pickup_date,
            amount: Number(b.total_amount),
            currency: "USD",
            icon: "🚙",
            details: { booking: b },
          });
        });
      }

      // Fetch Ride bookings
      if (!services || services.includes("rides")) {
        const { data } = await (supabase as any)
          .from("trips")
          .select("id, status, created_at, pickup_address, dropoff_address")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(limit);

        (data || []).forEach((t: any) => {
          trips.push({
            id: t.id,
            service: "rides",
            title: "ZIVO Ride",
            subtitle: `${t.pickup_address?.split(",")[0] || "Pickup"} → ${t.dropoff_address?.split(",")[0] || "Dropoff"}`,
            status: t.status,
            date: t.created_at,
            amount: 0,
            currency: "USD",
            icon: "🚕",
            details: { trip: t },
          });
        });
      }

      // Fetch Food orders
      if (!services || services.includes("eats")) {
        const { data } = await (supabase as any)
          .from("food_orders")
          .select("id, status, created_at, total_amount")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(limit);

        (data || []).forEach((o: any) => {
          trips.push({
            id: o.id,
            service: "eats",
            title: "Food Order",
            subtitle: format(new Date(o.created_at), "MMM d, h:mm a"),
            status: o.status,
            date: o.created_at,
            amount: Number(o.total_amount) || 0,
            currency: "USD",
            icon: "🍔",
            details: { order: o },
          });
        });
      }

      // Fetch Car Rental bookings
      if (!services || services.includes("cars")) {
        const { data } = await supabase
          .from("car_rentals")
          .select("id, status, pickup_date, return_date, total_amount")
          .eq("customer_id", user!.id)
          .order("pickup_date", { ascending: false })
          .limit(limit);

        (data || []).forEach((r: any) => {
          trips.push({
            id: r.id,
            service: "cars",
            title: "Car Rental",
            subtitle: `${format(new Date(r.pickup_date), "MMM d")} - ${format(new Date(r.return_date), "MMM d")}`,
            status: r.status || "confirmed",
            date: r.pickup_date,
            amount: Number(r.total_amount),
            currency: "USD",
            icon: "🚗",
            details: { rental: r },
          });
        });
      }

      // Filter by status
      let filtered = trips;
      if (status !== "all") {
        const statusMap: Record<string, string[]> = {
          upcoming: ["pending", "confirmed", "approved", "scheduled"],
          active: ["in_progress", "active", "picked_up", "en_route"],
          completed: ["completed", "delivered", "returned"],
          cancelled: ["cancelled", "rejected", "failed"],
        };
        const validStatuses = statusMap[status] || [];
        filtered = trips.filter((t) => validStatuses.includes(t.status));
      }

      return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!user,
  });
}

export function useRecentActivity() {
  return useUnifiedTrips({ limit: 5 });
}

export function useUpcomingTrips() {
  return useUnifiedTrips({ status: "upcoming", limit: 10 });
}

export function useActiveTrips() {
  return useUnifiedTrips({ status: "active", limit: 10 });
}
