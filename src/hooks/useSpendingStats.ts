import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UnifiedOrder {
  id: string;
  type: "eats" | "rides" | "travel";
  title: string;
  amount: number;
  date: string;
  status: string;
}

export interface SpendingStats {
  thisMonth: {
    total: number;
    orderCount: number;
    averageOrder: number;
    byService: { eats: number; rides: number; travel: number };
  };
  allTime: { total: number; orderCount: number };
  recentOrders: UnifiedOrder[];
  isLoading: boolean;
}

export function useSpendingStats(): SpendingStats {
  const { user } = useAuth();

  const { data: eatsOrders = [], isLoading: eatsLoading } = useQuery({
    queryKey: ["spending-eats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select("id, total_amount, status, created_at, restaurant:restaurants(name)")
        .eq("customer_id", user!.id)
        .eq("status", "delivered")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: rides = [], isLoading: ridesLoading } = useQuery({
    queryKey: ["spending-rides", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, fare_amount, status, created_at, dropoff_address")
        .eq("rider_id", user!.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: travelOrders = [], isLoading: travelLoading } = useQuery({
    queryKey: ["spending-travel", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_orders")
        .select("id, total, status, created_at, order_number, travel_order_items(title, type)")
        .eq("user_id", user!.id)
        .in("status", ["confirmed", "completed"])
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isLoading = eatsLoading || ridesLoading || travelLoading;

  // Normalize into unified orders
  const allOrders: UnifiedOrder[] = [
    ...eatsOrders.map((o: any) => ({
      id: o.id,
      type: "eats" as const,
      title: (o.restaurant as any)?.name || "Food Order",
      amount: o.total_amount || 0,
      date: o.created_at,
      status: o.status,
    })),
    ...rides.map((r: any) => ({
      id: r.id,
      type: "rides" as const,
      title: `Ride to ${r.dropoff_address?.split(",")[0] || "destination"}`,
      amount: r.fare_amount || 0,
      date: r.created_at,
      status: r.status,
    })),
    ...travelOrders.map((t: any) => {
      const firstItem = t.travel_order_items?.[0];
      return {
        id: t.id,
        type: "travel" as const,
        title: firstItem?.title || `Travel #${t.order_number?.slice(0, 8) || ""}`,
        amount: t.total || 0,
        date: t.created_at,
        status: t.status,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // This month stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthOrders = allOrders.filter(
    (o) => new Date(o.date) >= monthStart
  );

  const thisMonthTotal = thisMonthOrders.reduce((s, o) => s + o.amount, 0);
  const thisMonthCount = thisMonthOrders.length;

  const eatsTotal = thisMonthOrders
    .filter((o) => o.type === "eats")
    .reduce((s, o) => s + o.amount, 0);
  const ridesTotal = thisMonthOrders
    .filter((o) => o.type === "rides")
    .reduce((s, o) => s + o.amount, 0);
  const travelTotal = thisMonthOrders
    .filter((o) => o.type === "travel")
    .reduce((s, o) => s + o.amount, 0);

  const allTimeTotal = allOrders.reduce((s, o) => s + o.amount, 0);

  return {
    thisMonth: {
      total: thisMonthTotal,
      orderCount: thisMonthCount,
      averageOrder: thisMonthCount > 0 ? thisMonthTotal / thisMonthCount : 0,
      byService: { eats: eatsTotal, rides: ridesTotal, travel: travelTotal },
    },
    allTime: { total: allTimeTotal, orderCount: allOrders.length },
    recentOrders: allOrders.slice(0, 50),
    isLoading,
  };
}
