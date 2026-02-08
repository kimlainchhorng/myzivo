/**
 * Centralized Analytics Library
 * Reusable data fetching functions for Admin, Merchant, and Driver dashboards
 */

import { supabase } from "@/integrations/supabase/client";

// ============ Types ============

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsKPIs {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  gmv: number;
  platformRevenue: number;
  avgDeliveryTime: number; // in minutes
}

export interface OrdersTrend {
  date: string;
  orders: number;
  delivered: number;
  cancelled: number;
}

export interface RevenueTrend {
  date: string;
  gmv: number;
  platformRevenue: number;
  tips: number;
}

export interface PeakHoursData {
  hour: number;
  label: string;
  orders: number;
  revenue: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface TopRestaurant {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  avgPrepTime: number;
  rating: number;
}

export interface TopDriver {
  id: string;
  name: string;
  deliveries: number;
  earnings: number;
  avgDeliveryTime: number;
  rating: number;
}

export interface TopSellingItem {
  id: string;
  name: string;
  orders: number;
  revenue: number;
}

export interface HeatmapLocation {
  lat: number;
  lng: number;
  type: "pickup" | "delivery";
  weight: number;
}

// ============ Helper Functions ============

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getHourLabel(hour: number): string {
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

// ============ Admin Analytics Functions ============

export async function getKpis(dateRange: DateRange): Promise<AnalyticsKPIs> {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  // Get all orders in date range
  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("id, status, total_amount, platform_fee, tip_amount, accepted_at, delivered_at")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw error;

  const totalOrders = orders?.length || 0;
  const deliveredOrders = orders?.filter((o) => o.status === "completed").length || 0;
  const cancelledOrders = orders?.filter((o) => o.status === "cancelled").length || 0;
  const gmv = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  const platformRevenue = orders
    ?.filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.platform_fee || 0), 0) || 0;

  // Calculate average delivery time for completed orders
  const completedWithTimes = orders?.filter(
    (o) => o.status === "completed" && o.accepted_at && o.delivered_at
  ) || [];
  
  let avgDeliveryTime = 0;
  if (completedWithTimes.length > 0) {
    const totalMinutes = completedWithTimes.reduce((sum, o) => {
      const accepted = new Date(o.accepted_at!).getTime();
      const delivered = new Date(o.delivered_at!).getTime();
      return sum + (delivered - accepted) / (1000 * 60);
    }, 0);
    avgDeliveryTime = Math.round(totalMinutes / completedWithTimes.length);
  }

  return {
    totalOrders,
    deliveredOrders,
    cancelledOrders,
    gmv,
    platformRevenue,
    avgDeliveryTime,
  };
}

export async function getOrdersTrend(dateRange: DateRange): Promise<OrdersTrend[]> {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("created_at, status")
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Group by date
  const byDate: Record<string, { orders: number; delivered: number; cancelled: number }> = {};
  
  orders?.forEach((order) => {
    const date = formatDate(new Date(order.created_at));
    if (!byDate[date]) {
      byDate[date] = { orders: 0, delivered: 0, cancelled: 0 };
    }
    byDate[date].orders++;
    if (order.status === "completed") byDate[date].delivered++;
    if (order.status === "cancelled") byDate[date].cancelled++;
  });

  return Object.entries(byDate).map(([date, data]) => ({
    date,
    ...data,
  }));
}

export async function getRevenueTrend(dateRange: DateRange): Promise<RevenueTrend[]> {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("created_at, total_amount, platform_fee, tip_amount, status")
    .eq("status", "completed")
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Group by date
  const byDate: Record<string, { gmv: number; platformRevenue: number; tips: number }> = {};
  
  orders?.forEach((order) => {
    const date = formatDate(new Date(order.created_at));
    if (!byDate[date]) {
      byDate[date] = { gmv: 0, platformRevenue: 0, tips: 0 };
    }
    byDate[date].gmv += order.total_amount || 0;
    byDate[date].platformRevenue += order.platform_fee || 0;
    byDate[date].tips += order.tip_amount || 0;
  });

  return Object.entries(byDate).map(([date, data]) => ({
    date,
    gmv: Math.round(data.gmv * 100) / 100,
    platformRevenue: Math.round(data.platformRevenue * 100) / 100,
    tips: Math.round(data.tips * 100) / 100,
  }));
}

export async function getPeakHours(dateRange: DateRange): Promise<PeakHoursData[]> {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("created_at, total_amount")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw error;

  // Group by hour
  const byHour: Record<number, { orders: number; revenue: number }> = {};
  
  // Initialize all hours
  for (let h = 0; h < 24; h++) {
    byHour[h] = { orders: 0, revenue: 0 };
  }

  orders?.forEach((order) => {
    const hour = new Date(order.created_at).getHours();
    byHour[hour].orders++;
    byHour[hour].revenue += order.total_amount || 0;
  });

  return Object.entries(byHour).map(([hour, data]) => ({
    hour: parseInt(hour),
    label: getHourLabel(parseInt(hour)),
    orders: data.orders,
    revenue: Math.round(data.revenue * 100) / 100,
  }));
}

export async function getOrdersByStatus(dateRange: DateRange): Promise<StatusBreakdown[]> {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("status")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw error;

  const total = orders?.length || 0;
  const byStatus: Record<string, number> = {};

  orders?.forEach((order) => {
    const status = order.status || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  return Object.entries(byStatus).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

export async function getTopRestaurants(
  dateRange: DateRange,
  limit: number = 20
): Promise<TopRestaurant[]> {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  // Get orders grouped by restaurant
  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("restaurant_id, total_amount, platform_fee, accepted_at, ready_at, status")
    .eq("status", "completed")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw error;

  // Get restaurant details
  const restaurantIds = [...new Set(orders?.map((o) => o.restaurant_id).filter(Boolean))];
  
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, rating")
    .in("id", restaurantIds);

  const restaurantMap = new Map(restaurants?.map((r) => [r.id, r]));

  // Aggregate by restaurant
  const byRestaurant: Record<string, { orders: number; revenue: number; prepTimes: number[] }> = {};

  orders?.forEach((order) => {
    const rid = order.restaurant_id;
    if (!rid) return;
    
    if (!byRestaurant[rid]) {
      byRestaurant[rid] = { orders: 0, revenue: 0, prepTimes: [] };
    }
    byRestaurant[rid].orders++;
    byRestaurant[rid].revenue += order.total_amount || 0;
    
    // Calculate prep time if available
    if (order.accepted_at && order.ready_at) {
      const accepted = new Date(order.accepted_at).getTime();
      const ready = new Date(order.ready_at).getTime();
      byRestaurant[rid].prepTimes.push((ready - accepted) / (1000 * 60));
    }
  });

  // Build result
  const results: TopRestaurant[] = Object.entries(byRestaurant)
    .map(([id, data]) => {
      const restaurant = restaurantMap.get(id);
      const avgPrepTime = data.prepTimes.length > 0
        ? Math.round(data.prepTimes.reduce((a, b) => a + b, 0) / data.prepTimes.length)
        : 0;
      
      return {
        id,
        name: restaurant?.name || "Unknown Restaurant",
        orders: data.orders,
        revenue: Math.round(data.revenue * 100) / 100,
        avgPrepTime,
        rating: restaurant?.rating || 0,
      };
    })
    .sort((a, b) => b.orders - a.orders)
    .slice(0, limit);

  return results;
}

export async function getTopDrivers(
  dateRange: DateRange,
  limit: number = 20
): Promise<TopDriver[]> {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  // Get completed orders with driver info
  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("driver_id, driver_earnings_cents, accepted_at, delivered_at")
    .eq("status", "completed")
    .not("driver_id", "is", null)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw error;

  // Get driver details
  const driverIds = [...new Set(orders?.map((o) => o.driver_id).filter(Boolean))];
  
  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, full_name, rating")
    .in("id", driverIds);

  const driverMap = new Map(drivers?.map((d) => [d.id, d]));

  // Aggregate by driver
  const byDriver: Record<string, { deliveries: number; earnings: number; deliveryTimes: number[] }> = {};

  orders?.forEach((order) => {
    const did = order.driver_id;
    if (!did) return;
    
    if (!byDriver[did]) {
      byDriver[did] = { deliveries: 0, earnings: 0, deliveryTimes: [] };
    }
    byDriver[did].deliveries++;
    byDriver[did].earnings += (order.driver_earnings_cents || 0) / 100;
    
    if (order.accepted_at && order.delivered_at) {
      const accepted = new Date(order.accepted_at).getTime();
      const delivered = new Date(order.delivered_at).getTime();
      byDriver[did].deliveryTimes.push((delivered - accepted) / (1000 * 60));
    }
  });

  // Build result
  const results: TopDriver[] = Object.entries(byDriver)
    .map(([id, data]) => {
      const driver = driverMap.get(id);
      const avgDeliveryTime = data.deliveryTimes.length > 0
        ? Math.round(data.deliveryTimes.reduce((a, b) => a + b, 0) / data.deliveryTimes.length)
        : 0;
      
      return {
        id,
        name: driver?.full_name || "Unknown Driver",
        deliveries: data.deliveries,
        earnings: Math.round(data.earnings * 100) / 100,
        avgDeliveryTime,
        rating: driver?.rating || 0,
      };
    })
    .sort((a, b) => b.deliveries - a.deliveries)
    .slice(0, limit);

  return results;
}

// ============ Heatmap Data ============

export async function getHeatmapLocations(dateRange: DateRange): Promise<HeatmapLocation[]> {
  const startDate = dateRange.start.toISOString();
  const endDate = dateRange.end.toISOString();

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("pickup_lat, pickup_lng, delivery_lat, delivery_lng")
    .eq("status", "completed")
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .limit(1000); // Limit for performance

  if (error) throw error;

  const locations: HeatmapLocation[] = [];

  orders?.forEach((order) => {
    if (order.pickup_lat && order.pickup_lng) {
      locations.push({
        lat: order.pickup_lat,
        lng: order.pickup_lng,
        type: "pickup",
        weight: 1,
      });
    }
    if (order.delivery_lat && order.delivery_lng) {
      locations.push({
        lat: order.delivery_lat,
        lng: order.delivery_lng,
        type: "delivery",
        weight: 1,
      });
    }
  });

  return locations;
}

// ============ Merchant Analytics Functions ============

export async function getMerchantRevenueByDay(
  restaurantId: string,
  days: number = 7
): Promise<{ date: string; revenue: number; orders: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("created_at, total_amount, platform_fee")
    .eq("restaurant_id", restaurantId)
    .eq("status", "completed")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byDate: Record<string, { revenue: number; orders: number }> = {};

  orders?.forEach((order) => {
    const date = formatDate(new Date(order.created_at));
    if (!byDate[date]) {
      byDate[date] = { revenue: 0, orders: 0 };
    }
    // Merchant revenue = total - platform fee
    byDate[date].revenue += (order.total_amount || 0) - (order.platform_fee || 0);
    byDate[date].orders++;
  });

  return Object.entries(byDate).map(([date, data]) => ({
    date,
    revenue: Math.round(data.revenue * 100) / 100,
    orders: data.orders,
  }));
}

export async function getMerchantTopItems(
  restaurantId: string,
  limit: number = 10
): Promise<TopSellingItem[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("items")
    .eq("restaurant_id", restaurantId)
    .eq("status", "completed")
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error) throw error;

  // Extract items from JSONB
  const itemStats: Record<string, { name: string; orders: number; revenue: number }> = {};

  orders?.forEach((order) => {
    const items = order.items as Array<{ id?: string; name?: string; price?: number; quantity?: number }> | null;
    if (!items || !Array.isArray(items)) return;

    items.forEach((item) => {
      const id = item.id || item.name || "unknown";
      const name = item.name || "Unknown Item";
      const price = item.price || 0;
      const quantity = item.quantity || 1;

      if (!itemStats[id]) {
        itemStats[id] = { name, orders: 0, revenue: 0 };
      }
      itemStats[id].orders += quantity;
      itemStats[id].revenue += price * quantity;
    });
  });

  return Object.entries(itemStats)
    .map(([id, data]) => ({
      id,
      name: data.name,
      orders: data.orders,
      revenue: Math.round(data.revenue * 100) / 100,
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, limit);
}

export async function getMerchantStats(restaurantId: string): Promise<{
  totalOrders: number;
  avgPrepTime: number;
  newCustomers: number;
  repeatRate: number;
}> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("customer_id, accepted_at, ready_at, status")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", sevenDaysAgo.toISOString());

  if (error) throw error;

  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter((o) => o.status === "completed") || [];

  // Calculate avg prep time
  let avgPrepTime = 0;
  const ordersWithPrepTime = completedOrders.filter((o) => o.accepted_at && o.ready_at);
  if (ordersWithPrepTime.length > 0) {
    const totalMinutes = ordersWithPrepTime.reduce((sum, o) => {
      const accepted = new Date(o.accepted_at!).getTime();
      const ready = new Date(o.ready_at!).getTime();
      return sum + (ready - accepted) / (1000 * 60);
    }, 0);
    avgPrepTime = Math.round(totalMinutes / ordersWithPrepTime.length);
  }

  // Calculate unique and repeat customers
  const customerOrders: Record<string, number> = {};
  orders?.forEach((o) => {
    if (o.customer_id) {
      customerOrders[o.customer_id] = (customerOrders[o.customer_id] || 0) + 1;
    }
  });
  
  const uniqueCustomers = Object.keys(customerOrders).length;
  const repeatCustomers = Object.values(customerOrders).filter((c) => c > 1).length;
  const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

  return {
    totalOrders,
    avgPrepTime,
    newCustomers: uniqueCustomers,
    repeatRate,
  };
}

// ============ Driver Analytics Functions ============

export async function getDriverEarningsByDay(
  driverId: string,
  days: number = 7
): Promise<{ date: string; earnings: number; deliveries: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("delivered_at, driver_earnings_cents")
    .eq("driver_id", driverId)
    .eq("status", "completed")
    .gte("delivered_at", startDate.toISOString())
    .order("delivered_at", { ascending: true });

  if (error) throw error;

  const byDate: Record<string, { earnings: number; deliveries: number }> = {};

  orders?.forEach((order) => {
    if (!order.delivered_at) return;
    const date = formatDate(new Date(order.delivered_at));
    if (!byDate[date]) {
      byDate[date] = { earnings: 0, deliveries: 0 };
    }
    byDate[date].earnings += (order.driver_earnings_cents || 0) / 100;
    byDate[date].deliveries++;
  });

  return Object.entries(byDate).map(([date, data]) => ({
    date,
    earnings: Math.round(data.earnings * 100) / 100,
    deliveries: data.deliveries,
  }));
}

export async function getDriverStats(driverId: string): Promise<{
  totalDeliveries: number;
  totalEarnings: number;
  avgDeliveryTime: number;
  todayEarnings: number;
  weekEarnings: number;
}> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: orders, error } = await supabase
    .from("food_orders")
    .select("driver_earnings_cents, accepted_at, delivered_at")
    .eq("driver_id", driverId)
    .eq("status", "completed")
    .gte("delivered_at", monthStart.toISOString());

  if (error) throw error;

  let totalDeliveries = 0;
  let totalEarnings = 0;
  let todayEarnings = 0;
  let weekEarnings = 0;
  const deliveryTimes: number[] = [];

  orders?.forEach((order) => {
    totalDeliveries++;
    const earnings = (order.driver_earnings_cents || 0) / 100;
    totalEarnings += earnings;

    if (order.delivered_at) {
      const deliveredDate = new Date(order.delivered_at);
      if (deliveredDate >= todayStart) todayEarnings += earnings;
      if (deliveredDate >= weekStart) weekEarnings += earnings;
    }

    if (order.accepted_at && order.delivered_at) {
      const accepted = new Date(order.accepted_at).getTime();
      const delivered = new Date(order.delivered_at).getTime();
      deliveryTimes.push((delivered - accepted) / (1000 * 60));
    }
  });

  const avgDeliveryTime = deliveryTimes.length > 0
    ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length)
    : 0;

  return {
    totalDeliveries,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    avgDeliveryTime,
    todayEarnings: Math.round(todayEarnings * 100) / 100,
    weekEarnings: Math.round(weekEarnings * 100) / 100,
  };
}
