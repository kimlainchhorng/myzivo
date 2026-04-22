/**
 * Lightweight client-side analytics helper.
 * Fire-and-forget — never throws, never blocks UI.
 * Backed by the existing `analytics_events` table when available;
 * silently no-ops if the table or RLS rejects the insert.
 */
import { supabase } from "@/integrations/supabase/client";

export type AnalyticsProps = Record<string, unknown>;

export function track(event: string, props: AnalyticsProps = {}) {
  try {
    // Best-effort insert; do not await.
    void (supabase as any)
      .from("analytics_events")
      .insert({
        event_name: event,
        properties: props,
        created_at: new Date().toISOString(),
      })
      .then(() => {}, () => {});
  } catch {
    // swallow
  }
  if (typeof window !== "undefined" && (window as any).__zivo_debug_analytics) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props);
  }
}
