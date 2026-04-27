/**
 * useStoreAuditLog — read-only history of changes to employee rules,
 * training assignments, and documents for a given store.
 * Backed by `public.store_audit_log` (RLS: managers of the store only).
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AuditAction = "insert" | "update" | "delete" | "notify_expiry" | "notify_overdue";
export type AuditResource = "employee_rule" | "training_assignment" | "document" | "system";

export interface StoreAuditEntry {
  id: string;
  store_id: string;
  actor_user_id: string | null;
  action: AuditAction;
  resource_type: AuditResource;
  resource_id: string | null;
  diff: Record<string, unknown>;
  created_at: string;
  actor_name?: string | null;
  actor_avatar?: string | null;
}

const KEY = (storeId: string) => ["store-audit-log", storeId] as const;

export function useStoreAuditLog(storeId: string, limit = 200) {
  return useQuery({
    queryKey: KEY(storeId),
    enabled: Boolean(storeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_audit_log" as any)
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;

      const rows = (data || []) as unknown as StoreAuditEntry[];
      const userIds = Array.from(
        new Set(rows.map((r) => r.actor_user_id).filter(Boolean) as string[]),
      );
      if (userIds.length === 0) return rows;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const byId: Record<string, { name?: string | null; avatar?: string | null }> = {};
      for (const p of profiles || []) {
        byId[(p as any).user_id] = {
          name: (p as any).full_name,
          avatar: (p as any).avatar_url,
        };
      }
      return rows.map((r) => ({
        ...r,
        actor_name: r.actor_user_id ? byId[r.actor_user_id]?.name : null,
        actor_avatar: r.actor_user_id ? byId[r.actor_user_id]?.avatar : null,
      }));
    },
  });
}
