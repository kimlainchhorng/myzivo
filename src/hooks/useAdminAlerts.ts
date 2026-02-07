/**
 * Admin Alerts Hook
 * Fetch/resolve tenant admin alerts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminAlert {
  id: string;
  created_at: string;
  tenant_id: string;
  severity: "warning" | "critical";
  title: string;
  body: string | null;
  audit_log_id: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolve_notes: string | null;
}

export function useAdminAlerts(tenantId: string | null, showResolved = false) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-alerts", tenantId, showResolved],
    queryFn: async () => {
      if (!tenantId) return [];

      let q = supabase
        .from("tenant_admin_alerts")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (!showResolved) {
        q = q.is("resolved_at", null);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as AdminAlert[];
    },
    enabled: !!tenantId,
  });

  const resolveAlert = useMutation({
    mutationFn: async ({ alertId, notes }: { alertId: string; notes?: string }) => {
      const { data, error } = await supabase.rpc("resolve_admin_alert", {
        p_alert_id: alertId,
        p_notes: notes || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-alerts", tenantId] });
      toast.success("Alert resolved");
    },
    onError: (error) => {
      toast.error("Failed to resolve alert: " + error.message);
    },
  });

  const unresolvedCount = query.data?.filter((a) => !a.resolved_at).length || 0;

  return {
    alerts: query.data || [],
    unresolvedCount,
    isLoading: query.isLoading,
    error: query.error,
    resolveAlert: resolveAlert.mutate,
    isResolving: resolveAlert.isPending,
    refetch: query.refetch,
  };
}
