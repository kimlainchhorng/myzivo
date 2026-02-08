/**
 * Real-time Eats Order Hook
 * Subscribes to Supabase realtime updates for order status
 * Uses shared tables with Merchant app
 */
import { useState, useEffect } from "react";
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
  tax: number | null;
  total_amount: number;
  delivery_address: string | null;
  promo_code?: string | null;
  discount_amount?: number | null;
  created_at: string;
  updated_at: string;
  restaurants?: {
    name: string;
    logo_url: string | null;
    phone: string | null;
    address: string | null;
  };
}

export function useLiveEatsOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<LiveEatsOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Initial fetch
    const fetchOrder = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Real-time subscription - listens for merchant status updates
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
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [orderId]);

  return { order, loading, error };
}
