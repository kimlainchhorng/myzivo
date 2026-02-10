/**
 * Trip Sharing Hook
 * Generates live tracking links and handles share actions for Safety Center
 */

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useShareTracking } from "@/hooks/useShareTracking";

interface UseTripSharingOptions {
  tripId: string;
}

export function useTripSharing({ tripId }: UseTripSharingOptions) {
  const [copied, setCopied] = useState(false);
  const { logShare, buildShareUrl } = useShareTracking();

  const trackingUrl = buildShareUrl(`/track/${tripId}`, tripId, "safety_center");

  const shareTrip = useCallback(
    async (platform: string) => {
      const url = buildShareUrl(`/track/${tripId}`, tripId, platform);
      const shareText = `Track my trip live: ${url}`;

      await logShare({ entityId: tripId, entityType: "trip_share", platform });

      switch (platform) {
        case "copy": {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Trip shared with your contact", {
              description: "Live tracking link copied to clipboard",
            });
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast.error("Failed to copy link");
          }
          break;
        }
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            "_blank"
          );
          toast.success("Trip shared with your contact");
          break;
        case "sms":
          window.open(`sms:?body=${encodeURIComponent(shareText)}`);
          toast.success("Trip shared with your contact");
          break;
        case "native":
          if (navigator.share) {
            try {
              await navigator.share({
                title: "Track My Trip",
                text: "Follow my trip live",
                url,
              });
              toast.success("Trip shared with your contact");
            } catch {
              // User cancelled
            }
          }
          break;
      }
    },
    [tripId, logShare, buildShareUrl]
  );

  return { shareTrip, trackingUrl, copied };
}
