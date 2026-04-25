/**
 * useStoreFavorites — Manage saved stores via the shared `user_favorites` table.
 * item_type = "store", item_id = store.id (uuid as text).
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useStoreFavorites() {
  const [userId, setUserId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id || null;
      if (!active) return;
      setUserId(uid);
      if (!uid) {
        setIsLoading(false);
        return;
      }
      const { data: rows } = await (supabase as any)
        .from("user_favorites")
        .select("item_id")
        .eq("user_id", uid)
        .eq("item_type", "store");
      if (!active) return;
      setFavoriteIds(new Set((rows || []).map((r: any) => String(r.item_id))));
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const isFavorite = useCallback(
    (storeId: string) => favoriteIds.has(storeId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (
      storeId: string,
      snapshot?: Record<string, any>
    ): Promise<{ added: boolean; needsAuth: boolean; error?: boolean }> => {
      if (!userId) return { added: false, needsAuth: true };
      const wasFav = favoriteIds.has(storeId);
      // Optimistic
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFav) next.delete(storeId);
        else next.add(storeId);
        return next;
      });
      try {
        if (wasFav) {
          const { error } = await (supabase as any)
            .from("user_favorites")
            .delete()
            .eq("user_id", userId)
            .eq("item_type", "store")
            .eq("item_id", storeId);
          if (error) throw error;
        } else {
          const { error } = await (supabase as any)
            .from("user_favorites")
            .insert({
              user_id: userId,
              item_type: "store",
              item_id: storeId,
              item_data: snapshot || {},
            });
          // 23505 (duplicate) is fine — already favorited on another tab
          if (error && (error as any).code !== "23505") throw error;
        }
        return { added: !wasFav, needsAuth: false };
      } catch {
        // Rollback
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFav) next.add(storeId);
          else next.delete(storeId);
          return next;
        });
        return { added: wasFav, needsAuth: false, error: true };
      }
    },
    [userId, favoriteIds]
  );

  return { favoriteIds, isFavorite, toggleFavorite, isLoading, isAuthed: !!userId };
}
