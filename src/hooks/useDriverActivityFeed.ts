import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityItem {
  id: string;
  type: "delivery" | "bonus" | "wallet_credit" | "payout" | "incentive";
  title: string;
  description: string;
  amount: number;
  timestamp: string;
  iconColor: string;
  status?: string;
}

export type ActivityFilter = "all" | "deliveries" | "earnings" | "payouts";

export function useDriverActivityFeed(driverId: string | undefined) {
  return useQuery({
    queryKey: ["driver-activity-feed", driverId],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!driverId) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      const [tripsRes, foodRes, packagesRes, earningsRes, payoutsRes, incentivesRes] =
        await Promise.all([
          supabase
            .from("trips")
            .select("id, fare_amount, completed_at, pickup_address, dropoff_address")
            .eq("driver_id", driverId)
            .eq("status", "completed")
            .gte("completed_at", since)
            .order("completed_at", { ascending: false }),
          supabase
            .from("food_orders")
            .select("id, delivery_fee, updated_at, delivery_address")
            .eq("driver_id", driverId)
            .eq("status", "completed")
            .gte("updated_at", since)
            .order("updated_at", { ascending: false }),
          supabase
            .from("package_deliveries")
            .select("id, actual_payout, delivered_at, pickup_address, dropoff_address")
            .eq("driver_id", driverId)
            .eq("status", "delivered")
            .gte("delivered_at", since)
            .order("delivered_at", { ascending: false }),
          supabase
            .from("driver_earnings")
            .select("id, net_amount, earning_type, description, created_at")
            .eq("driver_id", driverId)
            .gte("created_at", since)
            .order("created_at", { ascending: false }),
          supabase
            .from("driver_payouts")
            .select("id, amount, status, payout_type, created_at")
            .eq("driver_id", driverId)
            .gte("created_at", since)
            .order("created_at", { ascending: false }),
          supabase
            .from("driver_incentives")
            .select("id, name, bonus_amount, created_at")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

      const items: ActivityItem[] = [];

      // Trips
      tripsRes.data?.forEach((t) => {
        items.push({
          id: `trip-${t.id}`,
          type: "delivery",
          title: "Ride Completed",
          description: `${t.pickup_address || "Pickup"} → ${t.dropoff_address || "Dropoff"}`,
          amount: t.fare_amount || 0,
          timestamp: t.completed_at!,
          iconColor: "green",
        });
      });

      // Food orders
      foodRes.data?.forEach((o) => {
        items.push({
          id: `eats-${o.id}`,
          type: "delivery",
          title: "Eats Delivery",
          description: o.delivery_address || "Delivery",
          amount: o.delivery_fee || 0,
          timestamp: o.updated_at!,
          iconColor: "blue",
        });
      });

      // Packages
      packagesRes.data?.forEach((p) => {
        items.push({
          id: `pkg-${p.id}`,
          type: "delivery",
          title: "Package Delivered",
          description: `${p.pickup_address || "Pickup"} → ${p.dropoff_address || "Dropoff"}`,
          amount: p.actual_payout || 0,
          timestamp: p.delivered_at!,
          iconColor: "green",
        });
      });

      // Earnings
      earningsRes.data?.forEach((e) => {
        items.push({
          id: `earn-${e.id}`,
          type: "wallet_credit",
          title: e.earning_type === "bonus" ? "Bonus Earned" : "Earnings Credited",
          description: e.description || "Wallet credit",
          amount: e.net_amount || 0,
          timestamp: e.created_at,
          iconColor: "amber",
        });
      });

      // Payouts
      payoutsRes.data?.forEach((p) => {
        items.push({
          id: `pay-${p.id}`,
          type: "payout",
          title: "Payout Issued",
          description: `${p.payout_type || "Bank transfer"} — ${p.status || "pending"}`,
          amount: -(p.amount || 0),
          timestamp: p.created_at!,
          iconColor: "purple",
          status: p.status || "pending",
        });
      });

      // Incentives
      incentivesRes.data?.forEach((i) => {
        if (!i.created_at) return;
        items.push({
          id: `inc-${i.id}`,
          type: "incentive",
          title: "Incentive Active",
          description: i.name || "Bonus period",
          amount: i.bonus_amount || 0,
          timestamp: i.created_at,
          iconColor: "amber",
        });
      });

      // Sort descending
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return items;
    },
    enabled: !!driverId,
    refetchInterval: 30000,
  });
}

export function filterActivity(items: ActivityItem[], filter: ActivityFilter): ActivityItem[] {
  switch (filter) {
    case "deliveries":
      return items.filter((i) => i.type === "delivery");
    case "earnings":
      return items.filter((i) => i.type === "wallet_credit" || i.type === "bonus" || i.type === "incentive");
    case "payouts":
      return items.filter((i) => i.type === "payout");
    default:
      return items;
  }
}

export function groupByDate(items: ActivityItem[]): { label: string; items: ActivityItem[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, ActivityItem[]> = {};

  items.forEach((item) => {
    const d = new Date(item.timestamp);
    let label: string;
    if (d >= today) label = "Today";
    else if (d >= yesterday) label = "Yesterday";
    else label = "Earlier";

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });

  const order = ["Today", "Yesterday", "Earlier"];
  return order.filter((l) => groups[l]).map((l) => ({ label: l, items: groups[l] }));
}
