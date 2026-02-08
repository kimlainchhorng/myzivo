/**
 * Real-time Eats Order Hook
 * Subscribes to Supabase realtime updates for order status
 * Uses shared tables with Merchant app
 * Includes reconnection handling for reliability
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EATS_TABLES } from "@/lib/eatsTables";

export interface LiveEatsOrder {
  id: string;
  customer_id: string;
  restaurant_id: string;
  driver_id?: string | null;
  status: string;
  payment_status?: string | null;
  payment_type?: string | null;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  service_fee?: number | null;
  tax: number | null;
  tip_amount?: number | null;
  total_amount: number;
  delivery_address: string | null;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  promo_code?: string | null;
  discount_amount?: number | null;
  created_at: string;
  updated_at: string;
  // Timestamp fields for timeline
  placed_at?: string | null;
  accepted_at?: string | null;
  prepared_at?: string | null;
  ready_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  assigned_at?: string | null;
  cancelled_at?: string | null;
  // ETA fields
  eta_pickup?: string | null;
  eta_dropoff?: string | null;
  eta_minutes?: number | null;
  // Delivery PIN fields
  delivery_pin?: string | null;
  delivery_pin_verified?: boolean | null;
  pin_attempts?: number | null;
  restaurants?: {
    name: string;
    logo_url: string | null;
    phone: string | null;
    address: string | null;
  };
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useLiveEatsOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<LiveEatsOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  // Refetch function for reconnection scenarios
  const refetch = useCallback(async () => {
    if (!orderId) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from(EATS_TABLES.orders)
        .select("*, restaurants:restaurant_id(name, logo_url, phone, address)")
        .eq("id", orderId)
        .single();

      if (fetchError) throw fetchError;
      setOrder(data as LiveEatsOrder);
      setError(null);
    } catch (e) {
      setError(e as Error);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    // Initial fetch
    const fetchOrder = async () => {
      setLoading(true);
      setConnectionStatus("connecting");
      
      try {
        const { data, error: fetchError } = await supabase
          .from(EATS_TABLES.orders)
          .select("*, restaurants:restaurant_id(name, logo_url, phone, address)")
          .eq("id", orderId)
          .single();

        if (fetchError) throw fetchError;
        setOrder(data as LiveEatsOrder);
        setError(null);
      } catch (e) {
        setError(e as Error);
        setOrder(null);
        setConnectionStatus("error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Real-time subscription with reconnection handling
    channel = supabase
      .channel(`eats-order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: EATS_TABLES.orders,
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new) {
            // Merge with existing restaurant data since realtime doesn't include joins
            setOrder((prev) => ({
              ...(payload.new as LiveEatsOrder),
              restaurants: prev?.restaurants,
            }));
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setConnectionStatus("disconnected");
          
          // Auto-reconnect after 2 seconds
          reconnectTimeout = setTimeout(() => {
            refetch();
            channel?.subscribe();
          }, 2000);
        }
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [orderId, refetch]);

  return { order, loading, error, connectionStatus, refetch };
}
