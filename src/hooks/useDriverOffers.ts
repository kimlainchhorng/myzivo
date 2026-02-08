/**
 * useDriverOffers Hook
 * Fetches pending order offers for a driver with accept/reject mutations
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderOffer {
  id: string;
  order_id: string;
  driver_id: string;
  status: string;
  distance_miles: number | null;
  expires_at: string | null;
  created_at: string;
  responded_at: string | null;
  order?: {
    id: string;
    delivery_address: string | null;
    total_amount: number;
    driver_payout_cents: number | null;
    restaurants?: {
      name: string;
      address: string | null;
    };
  };
}

export function useDriverOffers(driverId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch pending offers for this driver
  const offersQuery = useQuery({
    queryKey: ["driver-offers", driverId],
    queryFn: async () => {
      if (!driverId) return [];

      const { data, error } = await supabase
        .from("order_offers")
        .select(`
          id,
          order_id,
          driver_id,
          status,
          distance_miles,
          expires_at,
          created_at,
          responded_at,
          food_orders:order_id (
            id,
            delivery_address,
            total_amount,
            driver_payout_cents,
            restaurants:restaurant_id (
              name,
              address
            )
          )
        `)
        .eq("driver_id", driverId)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((offer: any) => ({
        ...offer,
        order: offer.food_orders,
      })) as OrderOffer[];
    },
    enabled: !!driverId,
    refetchInterval: 5000, // Check for new offers every 5 seconds
  });

  // Accept offer mutation
  const acceptOffer = useMutation({
    mutationFn: async (offerId: string) => {
      const { data: offer, error: offerError } = await supabase
        .from("order_offers")
        .select("order_id")
        .eq("id", offerId)
        .single();

      if (offerError || !offer) throw new Error("Offer not found");

      // Update offer status
      const { error: updateOfferError } = await supabase
        .from("order_offers")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
        })
        .eq("id", offerId);

      if (updateOfferError) throw updateOfferError;

      // Update order with driver assignment
      const { error: updateOrderError } = await supabase
        .from("food_orders")
        .update({
          driver_id: driverId,
          status: "in_progress",
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", offer.order_id)
        .eq("status", "ready_for_pickup");

      if (updateOrderError) throw updateOrderError;

      // Cancel other pending offers for this order
      await supabase
        .from("order_offers")
        .update({
          status: "cancelled",
          responded_at: new Date().toISOString(),
        })
        .eq("order_id", offer.order_id)
        .eq("status", "pending")
        .neq("id", offerId);

      return { offerId, orderId: offer.order_id };
    },
    onSuccess: () => {
      toast.success("Offer accepted! Navigate to pickup.");
      queryClient.invalidateQueries({ queryKey: ["driver-offers"] });
      queryClient.invalidateQueries({ queryKey: ["driver-eats-orders"] });
    },
    onError: (error) => {
      toast.error(`Failed to accept: ${error.message}`);
    },
  });

  // Reject offer mutation
  const rejectOffer = useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase
        .from("order_offers")
        .update({
          status: "rejected",
          responded_at: new Date().toISOString(),
        })
        .eq("id", offerId);

      if (error) throw error;
      return offerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-offers"] });
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  return {
    offers: offersQuery.data || [],
    isLoading: offersQuery.isLoading,
    error: offersQuery.error,
    acceptOffer,
    rejectOffer,
  };
}
