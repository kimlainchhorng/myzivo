/**
 * useChatPresence — Real-time typing indicators + online/offline status
 * Uses Supabase Realtime Presence for instant online detection
 * and join/leave events to refresh last_seen dynamically
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface PresenceState {
  isTyping: boolean;
  isOnline: boolean;
  lastSeen: string | null;
}

function formatLastSeen(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return null;
  }
}

export function useChatPresence(userId: string | undefined, recipientId: string) {
  const channelRef = useRef<any>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSeenRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rawLastSeenRef = useRef<string | null>(null);
  const [state, setState] = useState<PresenceState>({ isTyping: false, isOnline: false, lastSeen: null });

  // Fetch last_seen from DB
  const fetchLastSeen = useCallback(async () => {
    if (!recipientId) return;
    const { data } = await supabase
      .from("profiles")
      .select("last_seen")
      .eq("user_id", recipientId)
      .maybeSingle();
    const ls = (data?.last_seen as string) || null;
    rawLastSeenRef.current = ls;
    setState((prev) => ({ ...prev, lastSeen: formatLastSeen(ls) }));
  }, [recipientId]);

  // Initial fetch
  useEffect(() => {
    fetchLastSeen();
  }, [fetchLastSeen]);

  // Refresh the "X minutes ago" text every 30s so it stays accurate
  useEffect(() => {
    const interval = setInterval(() => {
      if (rawLastSeenRef.current && !state.isOnline) {
        setState((prev) => ({ ...prev, lastSeen: formatLastSeen(rawLastSeenRef.current) }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [state.isOnline]);

  // Realtime Presence channel
  useEffect(() => {
    if (!userId) return;

    const roomName = `presence-${[userId, recipientId].sort().join("-")}`;
    const channel = supabase.channel(roomName, { config: { presence: { key: userId } } });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const recipientPresence = presenceState[recipientId];
        if (recipientPresence && recipientPresence.length > 0) {
          const latest = recipientPresence[0] as any;
          setState((prev) => ({ ...prev, isOnline: true, isTyping: !!latest.typing }));
        } else {
          setState((prev) => ({ ...prev, isOnline: false, isTyping: false }));
        }
      })
      .on("presence", { event: "leave" }, ({ key }: { key: string }) => {
        // When the recipient leaves, refresh their last_seen from the DB
        if (key === recipientId) {
          setState((prev) => ({ ...prev, isOnline: false, isTyping: false }));
          // Small delay so their last_seen write lands first
          setTimeout(() => fetchLastSeen(), 1500);
        }
      })
      .on("presence", { event: "join" }, ({ key }: { key: string }) => {
        if (key === recipientId) {
          setState((prev) => ({ ...prev, isOnline: true }));
        }
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online: true, typing: false });
        }
      });

    // Update own last_seen periodically (every 30s for faster detection)
    const updateLastSeen = () => {
      (supabase as any)
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("user_id", userId)
        .then(() => {});
    };
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userId, recipientId, fetchLastSeen]);

  const setTyping = useCallback((typing: boolean) => {
    if (!channelRef.current) return;
    channelRef.current.track({ online: true, typing });

    if (typing) {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        channelRef.current?.track({ online: true, typing: false });
      }, 3000);
    }
  }, []);

  return { ...state, setTyping };
}
