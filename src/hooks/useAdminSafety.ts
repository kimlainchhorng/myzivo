/**
 * Admin Safety Hook
 * Moderation tools for incidents, blocks, fraud signals, and user holds
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { IncidentReport } from "./useIncidentReports";

export interface FraudSignal {
  id: string;
  event_type: string;
  severity: number;
  score: number;
  user_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

export interface UserWithHold {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  payout_hold: boolean;
  status: string | null;
  created_at: string;
}

export interface BlockedUser {
  id: string;
  blocker_user_id: string;
  blocked_user_id: string;
  reason: string | null;
  created_at: string;
  blocker?: {
    full_name: string | null;
    email: string | null;
  };
  blocked?: {
    full_name: string | null;
    email: string | null;
  };
}

interface AdminActionParams {
  userId: string;
  reason: string;
}

export function useAdminSafety() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all incident reports
  const incidents = useQuery({
    queryKey: ["admin-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as IncidentReport[];
    },
  });

  // Fetch fraud signals (risk events)
  const fraudSignals = useQuery({
    queryKey: ["admin-fraud-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as FraudSignal[];
    },
  });

  // Fetch users with payout holds
  const payoutHolds = useQuery({
    queryKey: ["admin-payout-holds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, phone, payout_hold, status, created_at")
        .eq("payout_hold", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserWithHold[];
    },
  });

  // Fetch all blocked user relationships
  const blockedUsers = useQuery({
    queryKey: ["admin-blocked-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_blocks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch profile info for blocked users
      const blockerIds = [...new Set(data.map((b) => b.blocker_user_id))];
      const blockedIds = [...new Set(data.map((b) => b.blocked_user_id))];
      const allUserIds = [...new Set([...blockerIds, ...blockedIds])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", allUserIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return data.map((block) => ({
        ...block,
        blocker: profileMap.get(block.blocker_user_id) || null,
        blocked: profileMap.get(block.blocked_user_id) || null,
      })) as BlockedUser[];
    },
  });

  // Suspend user
  const suspendUser = useMutation({
    mutationFn: async ({ userId, reason }: AdminActionParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("user_id", userId);

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "suspend_user",
        entity_type: "user",
        entity_id: userId,
        payload_json: { reason },
      });
    },
    onSuccess: () => {
      toast.success("User suspended");
      queryClient.invalidateQueries({ queryKey: ["admin-payout-holds"] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Unsuspend user
  const unsuspendUser = useMutation({
    mutationFn: async ({ userId, reason }: AdminActionParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("user_id", userId);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "unsuspend_user",
        entity_type: "user",
        entity_id: userId,
        payload_json: { reason },
      });
    },
    onSuccess: () => {
      toast.success("User reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-payout-holds"] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Apply payout hold
  const applyPayoutHold = useMutation({
    mutationFn: async ({ userId, reason }: AdminActionParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ payout_hold: true })
        .eq("user_id", userId);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "apply_payout_hold",
        entity_type: "user",
        entity_id: userId,
        payload_json: { reason },
      });
    },
    onSuccess: () => {
      toast.success("Payout hold applied");
      queryClient.invalidateQueries({ queryKey: ["admin-payout-holds"] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Release payout hold
  const releasePayoutHold = useMutation({
    mutationFn: async ({ userId, reason }: AdminActionParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ payout_hold: false })
        .eq("user_id", userId);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "release_payout_hold",
        entity_type: "user",
        entity_id: userId,
        payload_json: { reason },
      });
    },
    onSuccess: () => {
      toast.success("Payout hold released");
      queryClient.invalidateQueries({ queryKey: ["admin-payout-holds"] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Resolve incident
  const resolveIncident = useMutation({
    mutationFn: async ({ incidentId, notes }: { incidentId: string; notes: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("incident_reports")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", incidentId);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "resolve_incident",
        entity_type: "incident_report",
        entity_id: incidentId,
        payload_json: { notes },
      });
    },
    onSuccess: () => {
      toast.success("Incident resolved");
      queryClient.invalidateQueries({ queryKey: ["admin-incidents"] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Dismiss incident
  const dismissIncident = useMutation({
    mutationFn: async ({ incidentId, notes }: { incidentId: string; notes: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("incident_reports")
        .update({
          status: "dismissed",
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", incidentId);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "dismiss_incident",
        entity_type: "incident_report",
        entity_id: incidentId,
        payload_json: { notes },
      });
    },
    onSuccess: () => {
      toast.success("Incident dismissed");
      queryClient.invalidateQueries({ queryKey: ["admin-incidents"] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Remove block (admin override)
  const removeBlock = useMutation({
    mutationFn: async ({ blockId, reason }: { blockId: string; reason: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("id", blockId);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "remove_block",
        entity_type: "user_block",
        entity_id: blockId,
        payload_json: { reason },
      });
    },
    onSuccess: () => {
      toast.success("Block removed");
      queryClient.invalidateQueries({ queryKey: ["admin-blocked-users"] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  return {
    incidents,
    fraudSignals,
    payoutHolds,
    blockedUsers,
    suspendUser,
    unsuspendUser,
    applyPayoutHold,
    releasePayoutHold,
    resolveIncident,
    dismissIncident,
    removeBlock,
  };
}
