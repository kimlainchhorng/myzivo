/**
 * useChatPresence — Typing indicators + online status via Supabase Realtime Presence
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PresenceState {
  isTyping: boolean;
  isOnline: boolean;
}

export function useChatPresence(userId: string | undefined, recipientId: string) {
  const channelRef = useRef<any>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<PresenceState>({ isTyping: false, isOnline: false });

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
          setState({ isOnline: true, isTyping: !!latest.typing });
        } else {
          setState({ isOnline: false, isTyping: false });
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
