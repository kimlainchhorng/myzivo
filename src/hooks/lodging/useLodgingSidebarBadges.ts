/**
 * useLodgingSidebarBadges - lightweight head counts to power sidebar badges.
 * Single hook so we never fan out duplicate count queries.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LodgingSidebarBadges {
  inboxUnread: number;
  conciergeOpen: number;
  lostFoundUnclaimed: number;
  frontDeskToday: number;
}

const ZERO: LodgingSidebarBadges = { inboxUnread: 0, conciergeOpen: 0, lostFoundUnclaimed: 0, frontDeskToday: 0 };

export function useLodgingSidebarBadges(storeId?: string, enabled = true) {
  return useQuery<LodgingSidebarBadges>({
    queryKey: ["lodging-sidebar-badges", storeId],
    enabled: Boolean(storeId) && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!storeId) return ZERO;
      const today = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

      const headCount = async (table: string, build: (q: any) => any) => {
        try {
          let q: any = (supabase as any).from(table).select("id", { count: "exact", head: true }).eq("store_id", storeId);
          q = build(q);
          const { count } = await q;
          return count || 0;
        } catch {
          return 0;
        }
      };

      const [inboxUnread, conciergeOpen, lostFoundUnclaimed, arrivals, departures] = await Promise.all([
        headCount("lodging_messages", (q) => q.eq("sender_role", "guest").is("read_at", null)),
        headCount("lodging_concierge_tasks", (q) => q.in("status", ["open", "in_progress"])),
        headCount("lodging_lost_found", (q) => q.eq("status", "found")),
        headCount("lodge_reservations", (q) => q.gte("check_in", today).lt("check_in", tomorrow).in("status", ["confirmed", "checked_in"])),
        headCount("lodge_reservations", (q) => q.gte("check_out", today).lt("check_out", tomorrow).in("status", ["checked_in", "checked_out"])),
      ]);

      return {
        inboxUnread,
        conciergeOpen,
        lostFoundUnclaimed,
        frontDeskToday: arrivals + departures,
      };
    },
  });
}
