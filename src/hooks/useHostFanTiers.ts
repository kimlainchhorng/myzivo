/**
 * useHostFanTiers — given a host id and a list of viewer/chat user ids,
 * returns lifetime gift totals from `v_user_host_lifetime_gifts`. Used
 * by `<TierBadge>` next to chat names. Refreshes when new gifts land.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useHostFanTiers(
  hostId: string | undefined,
  userIds: string[],
  streamId?: string
) {
  const idsKey = useMemo(
    () => Array.from(new Set(userIds.filter(Boolean))).sort().join(","),
    [userIds]
  );
  const [tiers, setTiers] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!hostId || !idsKey) {
      setTiers(new Map());
      return;
    }
    let cancelled = false;
    let debounce: ReturnType<typeof setTimeout> | null = null;

    const fetchTiers = async () => {
      const ids = idsKey.split(",").filter(Boolean);
      if (ids.length === 0) {
        if (!cancelled) setTiers(new Map());
        return;
      }
      const { data } = await (supabase as any)
        .from("v_user_host_lifetime_gifts")
        .select("gifter_id, coins_total")
        .eq("host_id", hostId)
        .in("gifter_id", ids);
      if (cancelled) return;
      const m = new Map<string, number>();
      for (const r of (data ?? []) as any[]) {
        m.set(r.gifter_id, Number(r.coins_total) || 0);
      }
      setTiers(m);
    };

    fetchTiers();

    if (streamId) {
      const channel = supabase
        .channel(`fan-tiers-${streamId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "live_gift_displays",
            filter: `stream_id=eq.${streamId}`,
          },
          () => {
            if (debounce) clearTimeout(debounce);
            debounce = setTimeout(fetchTiers, 600);
          }
        )
        .subscribe();
      return () => {
        cancelled = true;
        if (debounce) clearTimeout(debounce);
        supabase.removeChannel(channel);
      };
    }

    return () => {
      cancelled = true;
      if (debounce) clearTimeout(debounce);
    };
  }, [hostId, idsKey, streamId]);

  return tiers;
}
