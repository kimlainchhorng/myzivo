/**
 * useSLAMetrics Hook
 * Fetch SLA KPIs, at-risk orders, and performance breakdowns
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export interface SLAKPIs {
  onTimeRate: number;
  onTimeCount: number;
  lateCount: number;
  totalDelivered: number;
  avgAssignSeconds: number;
  avgPrepSeconds: number;
  avgPickupSeconds: number;
  avgDeliverySeconds: number;
  atRiskCount: number;
  breachedCount: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ZonePerformance {
  zone_code: string;
  total_orders: number;
  on_time_count: number;
  late_count: number;
  on_time_rate: number;
  avg_total_seconds: number;
}

export interface MerchantPerformance {
  merchant_id: string;
  merchant_name: string;
  total_orders: number;
  on_time_count: number;
  late_count: number;
  on_time_rate: number;
  avg_prep_seconds: number;
}

export interface DriverPerformance {
  driver_id: string;
  driver_name: string;
  total_orders: number;
  on_time_count: number;
  late_count: number;
  on_time_rate: number;
  avg_delivery_seconds: number;
}

export interface AtRiskOrder {
  id: string;
  short_id: string;
  status: string;
  sla_status: string;
  at_risk_reason: string | null;
  breached_reason: string | null;
  sla_deliver_by: string;
  created_at: string;
  driver_id: string | null;
  driver_name: string | null;
  restaurant_name: string;
  delivery_address: string;
}

export interface PerformanceAdjustment {
  id: string;
  created_at: string;
  driver_id: string;
  driver_name?: string;
  order_id: string | null;
  type: "bonus" | "penalty";
  amount_cents: number;
  reason: string;
  status: "pending" | "approved" | "applied" | "rejected";
}

// Fetch SLA KPIs
export function useSLAKPIs(dateRange: DateRange) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["sla-kpis", currentTenant?.id, dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_sla_kpis", {
        p_tenant_id: currentTenant?.id || null,
        p_date_from: dateRange.from.toISOString(),
        p_date_to: dateRange.to.toISOString(),
      });

      if (error) throw error;

      const result = data as any;
      return {
        onTimeRate: result.on_time_rate || 100,
        onTimeCount: result.on_time_count || 0,
        lateCount: result.late_count || 0,
        totalDelivered: result.total_delivered || 0,
        avgAssignSeconds: result.avg_assign_seconds || 0,
        avgPrepSeconds: result.avg_prep_seconds || 0,
        avgPickupSeconds: result.avg_pickup_seconds || 0,
        avgDeliverySeconds: result.avg_delivery_seconds || 0,
        atRiskCount: result.at_risk_count || 0,
        breachedCount: result.breached_count || 0,
      } as SLAKPIs;
    },
    enabled: true,
    refetchInterval: 30000, // Refresh every 30s
  });
}

// Fetch at-risk and breached orders
export function useAtRiskOrders() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["at-risk-orders", currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select(`
          id,
          status,
          sla_status,
          at_risk_reason,
          breached_reason,
          sla_deliver_by,
          created_at,
          driver_id,
          delivery_address,
          drivers:driver_id (
            full_name
          ),
          restaurants:restaurant_id (
            name
          )
        `)
        .in("sla_status", ["at_risk", "breached"])
        .not("status", "in", '("completed","cancelled","refunded")')
        .order("sla_deliver_by", { ascending: true })
        .limit(50);

      if (error) throw error;

      return (data || []).map((order: any) => ({
        id: order.id,
        short_id: order.id.slice(0, 8).toUpperCase(),
        status: order.status,
        sla_status: order.sla_status,
        at_risk_reason: order.at_risk_reason,
        breached_reason: order.breached_reason,
        sla_deliver_by: order.sla_deliver_by,
        created_at: order.created_at,
        driver_id: order.driver_id,
        driver_name: order.drivers?.full_name || null,
        restaurant_name: order.restaurants?.name || "Unknown",
        delivery_address: order.delivery_address,
      })) as AtRiskOrder[];
    },
    refetchInterval: 15000, // Refresh every 15s for live monitoring
  });
}

// Fetch SLA by zone
export function useSLAByZone(dateRange: DateRange) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["sla-by-zone", currentTenant?.id, dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_sla_by_zone", {
        p_tenant_id: currentTenant?.id || null,
        p_date_from: dateRange.from.toISOString(),
        p_date_to: dateRange.to.toISOString(),
      });

      if (error) throw error;
      return (data || []) as ZonePerformance[];
    },
  });
}

// Fetch SLA by merchant
export function useSLAByMerchant(dateRange: DateRange, limit = 10) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["sla-by-merchant", currentTenant?.id, dateRange.from, dateRange.to, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_sla_by_merchant", {
        p_tenant_id: currentTenant?.id || null,
        p_date_from: dateRange.from.toISOString(),
        p_date_to: dateRange.to.toISOString(),
        p_limit: limit,
      });

      if (error) throw error;
      return (data || []) as MerchantPerformance[];
    },
  });
}

// Fetch SLA by driver
export function useSLAByDriver(dateRange: DateRange, limit = 10) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["sla-by-driver", currentTenant?.id, dateRange.from, dateRange.to, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_sla_by_driver", {
        p_tenant_id: currentTenant?.id || null,
        p_date_from: dateRange.from.toISOString(),
        p_date_to: dateRange.to.toISOString(),
        p_limit: limit,
      });

      if (error) throw error;
      return (data || []) as DriverPerformance[];
    },
  });
}

// Fetch pending performance adjustments
export function usePendingAdjustments() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["pending-adjustments", currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_adjustments")
        .select(`
          id,
          created_at,
          driver_id,
          order_id,
          type,
          amount_cents,
          reason,
          status,
          drivers:driver_id (
            full_name
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((adj: any) => ({
        ...adj,
        driver_name: adj.drivers?.full_name,
      })) as PerformanceAdjustment[];
    },
  });
}

// Approve or reject adjustment
export function useApproveAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adjustmentId, approve }: { adjustmentId: string; approve: boolean }) => {
      const { data, error } = await supabase.rpc("approve_performance_adjustment", {
        p_adjustment_id: adjustmentId,
        p_approve: approve,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-adjustments"] });
    },
  });
}

// Export SLA metrics to CSV
export function exportSLAMetricsCSV(
  metrics: { zone?: ZonePerformance[]; merchants?: MerchantPerformance[]; drivers?: DriverPerformance[] },
  dateRange: DateRange
) {
  const rows: string[] = [];
  const dateStr = `${dateRange.from.toISOString().split("T")[0]} to ${dateRange.to.toISOString().split("T")[0]}`;

  // Zone data
  if (metrics.zone && metrics.zone.length > 0) {
    rows.push("=== Zone Performance ===");
    rows.push("Zone,Total Orders,On-Time,Late,On-Time Rate,Avg Time (min)");
    metrics.zone.forEach((z) => {
      rows.push(`${z.zone_code},${z.total_orders},${z.on_time_count},${z.late_count},${z.on_time_rate}%,${Math.round(z.avg_total_seconds / 60)}`);
    });
    rows.push("");
  }

  // Merchant data
  if (metrics.merchants && metrics.merchants.length > 0) {
    rows.push("=== Merchant Performance ===");
    rows.push("Merchant,Total Orders,On-Time,Late,On-Time Rate,Avg Prep (min)");
    metrics.merchants.forEach((m) => {
      rows.push(`"${m.merchant_name}",${m.total_orders},${m.on_time_count},${m.late_count},${m.on_time_rate}%,${Math.round(m.avg_prep_seconds / 60)}`);
    });
    rows.push("");
  }

  // Driver data
  if (metrics.drivers && metrics.drivers.length > 0) {
    rows.push("=== Driver Performance ===");
    rows.push("Driver,Total Orders,On-Time,Late,On-Time Rate,Avg Delivery (min)");
    metrics.drivers.forEach((d) => {
      rows.push(`"${d.driver_name}",${d.total_orders},${d.on_time_count},${d.late_count},${d.on_time_rate}%,${Math.round(d.avg_delivery_seconds / 60)}`);
    });
  }

  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sla-metrics-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
