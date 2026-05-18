/**
 * useCloseFriends — Read + mutate the current user's Close Friends list.
 * Mirrors the `close_friends` table (user_id, close_friend_id).
 */
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CloseFriend {
  id: string;
  userId: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface CloseFriendRow {
  id: string;
  close_friend_id: string;
  created_at: string;
}

async function fetchCloseFriends(viewerId: string): Promise<CloseFriend[]> {
  const { data: rows, error } = await (supabase as any)
    .from("close_friends")
    .select("id, close_friend_id, created_at")
    .eq("user_id", viewerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const list = (rows ?? []) as CloseFriendRow[];
  if (list.length === 0) return [];

  const ids = list.map(r => r.close_friend_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, username, avatar_url")
    .or(`user_id.in.(${ids.join(",")}),id.in.(${ids.join(",")})`);

  const profileFor = (uid: string) =>
    profiles?.find((p: any) => p.user_id === uid) ??
    profiles?.find((p: any) => p.id === uid);

  return list.map(r => {
    const p: any = profileFor(r.close_friend_id);
    return {
      id: r.id,
      userId: r.close_friend_id,
      fullName: p?.full_name ?? null,
      username: p?.username ?? null,
      avatarUrl: p?.avatar_url ?? null,
      createdAt: r.created_at,
    };
  });
}

export function useCloseFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ["close-friends", user?.id];

  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchCloseFriends(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const closeFriendIds = new Set((query.data ?? []).map(f => f.userId));

  const add = useMutation({
    mutationFn: async (friendUserId: string) => {
      if (!user?.id) throw new Error("Not signed in");
      if (friendUserId === user.id) throw new Error("Can't add yourself");
      const { error } = await (supabase as any)
        .from("close_friends")
        .insert({ user_id: user.id, close_friend_id: friendUserId });
      if (error && !`${error.message}`.includes("duplicate")) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (friendUserId: string) => {
      if (!user?.id) throw new Error("Not signed in");
      const { error } = await (supabase as any)
        .from("close_friends")
        .delete()
        .eq("user_id", user.id)
        .eq("close_friend_id", friendUserId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const toggle = useCallback(
    (friendUserId: string) => {
      if (closeFriendIds.has(friendUserId)) {
        return remove.mutateAsync(friendUserId);
      }
      return add.mutateAsync(friendUserId);
    },
    [closeFriendIds, add, remove],
  );

  return {
    closeFriends: query.data ?? [],
    closeFriendIds,
    isLoading: query.isLoading,
    error: query.error,
    add: add.mutateAsync,
    remove: remove.mutateAsync,
    toggle,
    isMutating: add.isPending || remove.isPending,
  };
}
