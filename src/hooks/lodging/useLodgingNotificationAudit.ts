import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LodgingNotificationAuditItem {
  id: string;
  channel: string;
  event_type: string | null;
  status: string;
  destination_masked: string | null;
  provider_id: string | null;
  skip_reason: string | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function useLodgingNotificationAudit(reservationId: string | undefined, channel = "sms") {
  return useQuery({
    queryKey: ["lodging-notification-audit", reservationId, channel],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_audit" as any)
        .select("id, channel, event_type, status, destination_masked, provider_id, skip_reason, error, metadata, created_at")
        .eq("channel", channel)
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return ((data || []) as any[]).filter((row) => String(row.metadata?.reservation_id || "") === reservationId) as LodgingNotificationAuditItem[];
    },
    enabled: !!reservationId,
  });
}