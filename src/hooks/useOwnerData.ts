/**
 * Owner Data Hooks
 * Convenience hooks for owner dashboard data
 */

import { useAuth } from "@/contexts/AuthContext";
import { useCarOwnerProfile } from "./useCarOwner";
import { useOwnerEarnings as useOwnerEarningsBase, useOwnerPayouts as useOwnerPayoutsBase } from "./useP2PPayment";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Re-export earnings with auto-ownerId
export function useOwnerEarnings() {
  const { data: profile } = useCarOwnerProfile();
  
  return useQuery({
    queryKey: ["ownerEarningsList", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("p2p_bookings")
        .select("id, owner_payout, platform_fee, status, payment_status, created_at")
        .eq("owner_id", profile.id)
        .eq("payment_status", "captured")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []).map(d => ({ ...d, booking_id: d.id }));
    },
    enabled: !!profile?.id,
  });
}

// Re-export payouts with auto-ownerId
export function useOwnerPayouts() {
  const { data: profile } = useCarOwnerProfile();
  
  return useQuery({
    queryKey: ["ownerPayoutsList", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("p2p_payouts")
        .select("*")
        .eq("owner_id", profile.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });
}

// Owner earnings summary
export function useOwnerEarningsSummary() {
  const { data: profile } = useCarOwnerProfile();
  const ownerIdToUse = profile?.id;
  
  return useOwnerEarningsBase(ownerIdToUse);
}

// Owner payouts with auto-ownerId
export function useOwnerPayoutsList() {
  const { data: profile } = useCarOwnerProfile();
  const ownerIdToUse = profile?.id;
  
  return useOwnerPayoutsBase(ownerIdToUse);
}
