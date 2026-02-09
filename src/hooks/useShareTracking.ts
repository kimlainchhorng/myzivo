/**
 * Share Tracking Hook
 * Logs share events to `share_events` table and generates UTM-tagged URLs
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LogShareParams {
  entityId: string;
  entityType: string;
  platform: string;
}

export function useShareTracking() {
  const { user } = useAuth();

  const logShare = useCallback(
    async ({ entityId, entityType, platform }: LogShareParams) => {
      try {
        await supabase.from("share_events").insert({
          entity_id: entityId,
          entity_type: entityType,
          platform,
          user_id: user?.id || null,
        });
      } catch (err) {
        console.error("Failed to log share event:", err);
      }
    },
    [user?.id]
  );

  const buildShareUrl = useCallback(
    (basePath: string, entityId: string, platform: string) => {
      const url = new URL(basePath, window.location.origin);
      url.searchParams.set("utm_source", "share");
      url.searchParams.set("utm_medium", platform);
      url.searchParams.set("utm_content", entityId);
      return url.toString();
    },
    []
  );

  const logLinkOpened = useCallback(
    async (entityId: string, entityType: string) => {
      try {
        await supabase.from("share_events").insert({
          entity_id: entityId,
          entity_type: entityType,
          platform: "web",
          user_id: user?.id || null,
        });
      } catch (err) {
        console.error("Failed to log link_opened event:", err);
      }
    },
    [user?.id]
  );

  const logConversion = useCallback(
    async (orderId: string) => {
      try {
        await supabase.from("share_events").insert({
          entity_id: orderId,
          entity_type: "share_conversion",
          platform: "web",
          user_id: user?.id || null,
        });
      } catch (err) {
        console.error("Failed to log share conversion:", err);
      }
    },
    [user?.id]
  );

  return { logShare, buildShareUrl, logLinkOpened, logConversion };
}
