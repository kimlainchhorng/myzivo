/**
 * User Blocks Hook
 * Block/unblock users and check blocked status
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserBlock {
  id: string;
  blocker_user_id: string;
  blocked_user_id: string;
  reason: string | null;
  created_at: string;
}

interface BlockUserParams {
  blockedUserId: string;
  reason: string;
}

export function useUserBlocks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Block a user
  const blockUser = useMutation({
    mutationFn: async ({ blockedUserId, reason }: BlockUserParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if already blocked
      const { data: existing } = await supabase
        .from("user_blocks")
        .select("id")
        .eq("blocker_user_id", user.id)
        .eq("blocked_user_id", blockedUserId)
        .maybeSingle();

      if (existing) {
        throw new Error("User already blocked");
      }

      const { data, error } = await supabase
        .from("user_blocks")
        .insert({
          blocker_user_id: user.id,
          blocked_user_id: blockedUserId,
          reason,
        })
        .select()
        .single();

      if (error) throw error;

      // Log risk event
      await supabase.from("risk_events").insert({
        event_type: "user_blocked",
        severity: 2,
        score: 10,
        user_id: user.id,
        details: {
          blocked_user_id: blockedUserId,
          reason,
        },
      });

      return data;
    },
    onSuccess: () => {
      toast.success("User blocked successfully");
      queryClient.invalidateQueries({ queryKey: ["my-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["is-blocked"] });
    },
    onError: (error) => {
      toast.error(`Failed to block user: ${error.message}`);
    },
  });

  // Unblock a user
  const unblockUser = useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_user_id", user.id)
        .eq("blocked_user_id", blockedUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User unblocked");
      queryClient.invalidateQueries({ queryKey: ["my-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["is-blocked"] });
    },
    onError: (error) => {
      toast.error(`Failed to unblock user: ${error.message}`);
    },
  });

  // Get my blocked users list
  const myBlocks = useQuery({
    queryKey: ["my-blocks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_blocks")
        .select("*")
        .eq("blocker_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserBlock[];
    },
    enabled: !!user?.id,
  });

  // Check if a specific user is blocked by me
  const useIsBlocked = (userId: string | undefined) => {
    return useQuery({
      queryKey: ["is-blocked", user?.id, userId],
      queryFn: async () => {
        if (!user?.id || !userId) return false;

        const { data, error } = await supabase
          .from("user_blocks")
          .select("id")
          .eq("blocker_user_id", user.id)
          .eq("blocked_user_id", userId)
          .maybeSingle();

        if (error) throw error;
        return !!data;
      },
      enabled: !!user?.id && !!userId,
    });
  };

  return {
    blockUser,
    unblockUser,
    myBlocks,
    useIsBlocked,
  };
}
