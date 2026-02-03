/**
 * Finance Data Hooks
 * Fetch revenue, transactions, and financial metrics
 * Note: Uses explicit types as the new columns may not be in generated types yet
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RevenueMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalRefunds: number;
  netRevenue: number;
  byProduct: {
    hotel: number;
    activity: number;
    transfer: number;
  };
}

export interface FinancialTransaction {
  id: string;
  order_id: string | null;
  order_item_id: string | null;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  created_at: string;
}

export interface OrderWithRevenue {
  id: string;
  order_number: string;
  total: number;
  total_zivo_revenue: number;
  total_supplier_payout: number;
  status: string;
  currency: string;
  created_at: string;
  holder_name: string;
  holder_email: string;
}

// Internal types for raw query results
interface RawOrderRow {
  id: string;
  total: number;
  total_zivo_revenue?: number | null;
  status: string;
}

interface RawOrderItemRow {
  type: string;
  zivo_revenue?: number | null;
}

interface RawDailyOrderRow {
  created_at: string;
  total_zivo_revenue?: number | null;
  total: number;
}

interface RawExportRow {
  id: string;
  order_number: string;
  holder_name: string;
  holder_email: string;
  total: number;
  subtotal: number;
  fees: number;
  taxes: number;
  total_zivo_revenue?: number | null;
  total_supplier_payout?: number | null;
  status: string;
  currency: string;
  created_at: string;
}

// Fetch revenue metrics for a date range
export function useRevenueMetrics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["revenue-metrics", startDate, endDate],
    queryFn: async (): Promise<RevenueMetrics> => {
      // Get orders in date range - cast to avoid generated type issues
      const { data: ordersRaw, error: ordersError } = await supabase
        .from("travel_orders")
        .select("id, total, total_zivo_revenue, status")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (ordersError) throw ordersError;
      const orders = (ordersRaw || []) as unknown as RawOrderRow[];

      // Get order items with revenue breakdown
      const orderIds = orders.map((o) => o.id);
      let items: RawOrderItemRow[] = [];
      
      if (orderIds.length > 0) {
        const { data: itemsRaw, error: itemsError } = await supabase
          .from("travel_order_items")
          .select("type, zivo_revenue")
          .in("order_id", orderIds);

        if (itemsError) throw itemsError;
        items = (itemsRaw || []) as unknown as RawOrderItemRow[];
      }

      // Calculate metrics (refunds tracked separately - start with 0)
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_zivo_revenue || 0), 0);
      const totalOrders = orders.length;
      const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
      const avgOrderValue = totalOrders > 0 ? totalGMV / totalOrders : 0;
      const totalRefunds = 0; // Will be populated when financial_transactions has data
      const netRevenue = totalRevenue - totalRefunds;

      // Revenue by product type
      const byProduct = {
        hotel: items.filter((i) => i.type === "hotel").reduce((sum, i) => sum + (i.zivo_revenue || 0), 0),
        activity: items.filter((i) => i.type === "activity").reduce((sum, i) => sum + (i.zivo_revenue || 0), 0),
        transfer: items.filter((i) => i.type === "transfer").reduce((sum, i) => sum + (i.zivo_revenue || 0), 0),
      };

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalRefunds: Math.round(totalRefunds * 100) / 100,
        netRevenue: Math.round(netRevenue * 100) / 100,
        byProduct,
      };
    },
    staleTime: 60000,
  });
}

// Fetch financial transactions (returns empty until table is populated)
export function useFinancialTransactions(limit = 50) {
  return useQuery({
    queryKey: ["financial-transactions", limit],
    queryFn: async (): Promise<FinancialTransaction[]> => {
      // financial_transactions table exists but may not have data yet
      try {
        const { data, error } = await supabase
          .from("financial_transactions" as "announcements") // Type workaround
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          console.warn("Could not fetch financial transactions:", error.message);
          return [];
        }
        return (data || []) as unknown as FinancialTransaction[];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });
}

// Fetch orders with revenue breakdown
export function useOrdersWithRevenue(startDate?: string, endDate?: string, limit = 100) {
  return useQuery({
    queryKey: ["orders-with-revenue", startDate, endDate, limit],
    queryFn: async (): Promise<OrderWithRevenue[]> => {
      let query = supabase
        .from("travel_orders")
        .select("id, order_number, total, total_zivo_revenue, total_supplier_payout, status, currency, created_at, holder_name, holder_email")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map raw data to typed result
      const rawData = (data || []) as unknown as OrderWithRevenue[];
      return rawData.map((o) => ({
        ...o,
        total_zivo_revenue: o.total_zivo_revenue || 0,
        total_supplier_payout: o.total_supplier_payout || 0,
      }));
    },
    staleTime: 30000,
  });
}

// Daily revenue for charts
export function useDailyRevenue(days = 30) {
  return useQuery({
    queryKey: ["daily-revenue", days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: rawData, error } = await supabase
        .from("travel_orders")
        .select("created_at, total_zivo_revenue, total")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const data = (rawData || []) as unknown as RawDailyOrderRow[];

      // Group by day
      const dailyData: Record<string, { date: string; revenue: number; orders: number; gmv: number }> = {};
      
      data.forEach((order) => {
        const date = order.created_at.split("T")[0];
        if (!dailyData[date]) {
          dailyData[date] = { date, revenue: 0, orders: 0, gmv: 0 };
        }
        dailyData[date].revenue += order.total_zivo_revenue || 0;
        dailyData[date].gmv += order.total || 0;
        dailyData[date].orders += 1;
      });

      return Object.values(dailyData).map((d) => ({
        ...d,
        revenue: Math.round(d.revenue * 100) / 100,
        gmv: Math.round(d.gmv * 100) / 100,
      }));
    },
    staleTime: 60000,
  });
}

// Export orders to CSV
export async function exportOrdersToCSV(startDate: string, endDate: string): Promise<string> {
  const { data: rawOrders, error } = await supabase
    .from("travel_orders")
    .select(`
      id,
      order_number,
      holder_name,
      holder_email,
      total,
      subtotal,
      fees,
      taxes,
      total_zivo_revenue,
      total_supplier_payout,
      status,
      currency,
      created_at
    `)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  const orders = (rawOrders || []) as unknown as RawExportRow[];

  // Build CSV
  const headers = [
    "Order Number",
    "Date",
    "Customer Name",
    "Customer Email",
    "Subtotal",
    "Fees",
    "Taxes",
    "Total",
    "ZIVO Revenue",
    "Supplier Payout",
    "Status",
    "Currency",
  ];

  const rows = orders.map((o) => [
    o.order_number,
    new Date(o.created_at).toLocaleDateString(),
    o.holder_name,
    o.holder_email,
    o.subtotal,
    o.fees,
    o.taxes,
    o.total,
    o.total_zivo_revenue || 0,
    o.total_supplier_payout || 0,
    o.status,
    o.currency,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
  return csv;
}
