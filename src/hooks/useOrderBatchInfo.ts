/**
 * useOrderBatchInfo Hook
 * Fetches batch position and ETA for customer order visibility
 * Uses secure RPC to avoid exposing other customers' data
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OrderBatchInfo {
  isBatched: boolean;
  batchId: string | null;
  totalStops: number;
  customerStopOrder: number | null;
  stopsBeforeCustomer: number;
  isDriverOnEarlierStop: boolean;
  customerStopEta: string | null;
  currentStopOrder: number | null;
}

const DEFAULT_BATCH_INFO: OrderBatchInfo = {
  isBatched: false,
  batchId: null,
  totalStops: 0,
  customerStopOrder: null,
  stopsBeforeCustomer: 0,
  isDriverOnEarlierStop: false,
  customerStopEta: null,
  currentStopOrder: null,
};

export function useOrderBatchInfo(
  orderId: string | undefined,
  batchId: string | null | undefined
) {
  const [batchInfo, setBatchInfo] = useState<OrderBatchInfo>(DEFAULT_BATCH_INFO);
  const [loading, setLoading] = useState(false);

  const fetchBatchInfo = useCallback(async () => {
    if (!orderId) {
      setBatchInfo(DEFAULT_BATCH_INFO);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_order_batch_info", {
        p_order_id: orderId,
      });

      if (error) {
        console.error("Error fetching batch info:", error);
        setBatchInfo(DEFAULT_BATCH_INFO);
        return;
      }

      if (data) {
        const result = data as any;
        setBatchInfo({
          isBatched: result.is_batched ?? false,
          batchId: result.batch_id ?? null,
          totalStops: result.total_stops ?? 0,
          customerStopOrder: result.customer_stop_order ?? null,
          stopsBeforeCustomer: result.stops_before_customer ?? 0,
          isDriverOnEarlierStop: result.is_driver_on_earlier_stop ?? false,
          customerStopEta: result.customer_stop_eta ?? null,
          currentStopOrder: result.current_stop_order ?? null,
        });
      }
    } catch (err) {
      console.error("Failed to fetch batch info:", err);
      setBatchInfo(DEFAULT_BATCH_INFO);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    fetchBatchInfo();
  }, [fetchBatchInfo]);

  // Subscribe to batch_stops changes for real-time updates
  useEffect(() => {
    if (!batchId) return;

    const channel = supabase
      .channel(`batch-customer-${batchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "batch_stops",
          filter: `batch_id=eq.${batchId}`,
        },
        () => {
          // Refetch when any stop in this batch changes
          fetchBatchInfo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [batchId, fetchBatchInfo]);

  return { batchInfo, loading, refetch: fetchBatchInfo };
}
