/**
 * useChatPresence — Typing indicators + online status via Supabase Realtime Presence
 * Also fetches last_seen from profiles for offline "last seen" display
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface PresenceState {
  isTyping: boolean;
  isOnline: boolean;
  lastSeen: string | null; // human-readable "5 min ago" or null
}

export function useChatPresence(userId: string | undefined, recipientId: string) {
  const channelRef = useRef<any>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<PresenceState>({ isTyping: false, isOnline: false, lastSeen: null });

  // Fetch last_seen from profiles on mount
  useEffect(() => {
    if (!recipientId) return;
    const fetchLastSeen = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("last_seen")
        .eq("user_id", recipientId)
        .maybeSingle();
      if (data?.last_seen) {
        try {
          setState((prev) => ({
            ...prev,
            lastSeen: formatDistanceToNow(new Date(data.last_seen as string), { addSuffix: true }),
          }));
        } catch {
          // ignore parse errors
        }
      }
    };
    fetchLastSeen();
  }, [recipientId]);

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
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online: true, typing: false });
        }
      });

    // Update last_seen periodically
    const updateLastSeen = () => {
      (supabase as any).from("profiles").update({ last_seen: new Date().toISOString() }).eq("user_id", userId);
    };
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userId, recipientId]);

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
