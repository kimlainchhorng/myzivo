/**
 * Renter Invites Hooks
 * Hooks for managing renter beta invitations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { addDays } from "date-fns";

export interface RenterInvite {
  id: string;
  email: string;
  invite_code: string;
  expires_at: string | null;
  used: boolean;
  used_at: string | null;
  created_by: string | null;
  waitlist_id: string | null;
  created_at: string;
}

interface CreateInviteInput {
  email: string;
  expiresInDays?: number;
  waitlistId?: string;
}

/**
 * Generate a random 8-character invite code
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars (0,O,1,I)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Admin: Get all invites
 */
export function useAdminInvites(filter?: "all" | "used" | "unused") {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["adminRenterInvites", filter],
    queryFn: async () => {
      let query = supabase
        .from("p2p_renter_invites")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (filter === "used") {
        query = query.eq("used", true);
      } else if (filter === "unused") {
        query = query.eq("used", false);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as RenterInvite[];
    },
    enabled: isAdmin,
  });
}

/**
 * Admin: Create a new invite
 */
export function useCreateRenterInvite() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, expiresInDays, waitlistId }: CreateInviteInput) => {
      if (!isAdmin) {
        throw new Error("Admin access required");
      }

      const inviteCode = generateInviteCode();
      
      const { data, error } = await supabase
        .from("p2p_renter_invites")
        .insert({
          email: email.toLowerCase().trim(),
          invite_code: inviteCode,
          expires_at: expiresInDays 
            ? addDays(new Date(), expiresInDays).toISOString() 
            : null,
          waitlist_id: waitlistId || null,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          throw new Error("An invite with this code already exists");
        }
        throw error;
      }
      
      // Update waitlist status if from waitlist
      if (waitlistId) {
        await supabase
          .from("p2p_renter_waitlist")
          .update({ status: "invited" })
          .eq("id", waitlistId);
      }
      
      return data as RenterInvite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRenterInvites"] });
      queryClient.invalidateQueries({ queryKey: ["adminRenterWaitlist"] });
      queryClient.invalidateQueries({ queryKey: ["renterInviteStats"] });
      toast.success("Invite created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create invite");
    },
  });
}

/**
 * Admin: Send invite email
 */
export function useSendInviteEmail() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      if (!isAdmin) {
        throw new Error("Admin access required");
      }

      const response = await supabase.functions.invoke("send-renter-invite", {
        body: { inviteId },
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRenterInvites"] });
      toast.success("Invite email sent");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invite email");
    },
  });
}

/**
 * Validate an invite code
 */
export function useValidateInviteCode() {
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const { data, error } = await supabase
        .from("p2p_renter_invites")
        .select("*")
        .eq("invite_code", code.toUpperCase().trim())
        .eq("used", false)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Invalid or expired invite code");
      
      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error("Invite code has expired");
      }
      
      return data as RenterInvite;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid invite code");
    },
  });
}

/**
 * Mark invite as used
 */
export function useRedeemInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteId, waitlistId }: { inviteId: string; waitlistId?: string | null }) => {
      const { error } = await supabase
        .from("p2p_renter_invites")
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", inviteId);
      
      if (error) throw error;
      
      // Update waitlist status if linked
      if (waitlistId) {
        await supabase
          .from("p2p_renter_waitlist")
          .update({ status: "joined" })
          .eq("id", waitlistId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRenterInvites"] });
      queryClient.invalidateQueries({ queryKey: ["adminRenterWaitlist"] });
      queryClient.invalidateQueries({ queryKey: ["renterInviteStats"] });
    },
  });
}

/**
 * Admin: Revoke an invite
 */
export function useRevokeInvite() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      if (!isAdmin) {
        throw new Error("Admin access required");
      }

      const { error } = await supabase
        .from("p2p_renter_invites")
        .delete()
        .eq("id", inviteId)
        .eq("used", false); // Only allow deleting unused invites

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRenterInvites"] });
      queryClient.invalidateQueries({ queryKey: ["renterInviteStats"] });
      toast.success("Invite revoked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke invite");
    },
  });
}

/**
 * Admin: Get invite stats
 */
export function useInviteStats() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["renterInviteStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("p2p_renter_invites")
        .select("used");
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        used: data.filter(e => e.used).length,
        unused: data.filter(e => !e.used).length,
      };
      
      return stats;
    },
    enabled: isAdmin,
  });
}
