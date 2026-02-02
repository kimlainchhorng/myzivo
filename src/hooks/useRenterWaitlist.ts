/**
 * Renter Waitlist Hooks
 * Hooks for managing the renter beta waitlist
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WaitlistEntry {
  id: string;
  full_name: string;
  email: string;
  city: string;
  status: "pending" | "invited" | "joined" | "expired";
  created_at: string;
}

interface JoinWaitlistInput {
  fullName: string;
  email: string;
  city: string;
}

/**
 * Join the renter waitlist (public)
 */
export function useJoinWaitlist() {
  return useMutation({
    mutationFn: async ({ fullName, email, city }: JoinWaitlistInput) => {
      const { data, error } = await supabase
        .from("p2p_renter_waitlist")
        .insert({
          full_name: fullName.trim(),
          email: email.toLowerCase().trim(),
          city: city.trim(),
          status: "pending",
        })
        .select()
        .single();
      
      if (error) {
        // Handle duplicate email
        if (error.code === "23505") {
          throw new Error("This email is already on the waitlist");
        }
        throw error;
      }
      return data as WaitlistEntry;
    },
    onSuccess: () => {
      toast.success("You've been added to the waitlist!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to join waitlist");
    },
  });
}

/**
 * Admin: Get all waitlist entries
 */
export function useAdminWaitlist(status?: string) {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["adminRenterWaitlist", status],
    queryFn: async () => {
      let query = supabase
        .from("p2p_renter_waitlist")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WaitlistEntry[];
    },
    enabled: isAdmin,
  });
}

/**
 * Admin: Update waitlist entry status
 */
export function useUpdateWaitlistStatus() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: WaitlistEntry["status"];
    }) => {
      if (!isAdmin) {
        throw new Error("Admin access required");
      }

      const { error } = await supabase
        .from("p2p_renter_waitlist")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRenterWaitlist"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

/**
 * Admin: Get waitlist stats
 */
export function useWaitlistStats() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["renterWaitlistStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("p2p_renter_waitlist")
        .select("status");
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        pending: data.filter(e => e.status === "pending").length,
        invited: data.filter(e => e.status === "invited").length,
        joined: data.filter(e => e.status === "joined").length,
      };
      
      return stats;
    },
    enabled: isAdmin,
  });
}
