import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight global broadcast bus so the chat list can show "typing…" previews
 * without subscribing to one per-conversation channel.
 *
 * PersonalChat broadcasts { from, to, typing } when the input is active.
 * The hub listens and exposes a Set<partnerId> of users currently typing to me.
 */
const CHANNEL = "chat-typing-bus";

export function useTypingBus(currentUserId: string | undefined) {
  const [typingFrom, setTypingFrom] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase.channel(CHANNEL);
    const timers = new Map<string, ReturnType<typeof setTimeout>>();

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        const { from, to, typing } = (payload.payload || {}) as {
          from?: string; to?: string; typing?: boolean;
        };
        if (!from || to !== currentUserId) return;
        setTypingFrom((prev) => {
          const next = new Set(prev);
          if (typing) next.add(from);
          else next.delete(from);
          return next;
        });
        // Auto-clear after 5s of silence
        const existing = timers.get(from);
        if (existing) clearTimeout(existing);
        if (typing) {
          timers.set(from, setTimeout(() => {
            setTypingFrom((prev) => {
              const next = new Set(prev);
              next.delete(from);
              return next;
            });
          }, 5000));
        }
      })
      .subscribe();

    return () => {
      timers.forEach((t) => clearTimeout(t));
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return typingFrom;
}

/** Helper for PersonalChat to broadcast typing state. */
export function broadcastTyping(from: string, to: string, typing: boolean) {
  const channel = supabase.channel(CHANNEL);
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({ type: "broadcast", event: "typing", payload: { from, to, typing } });
      // Clean up the ephemeral channel shortly after sending.
      setTimeout(() => { supabase.removeChannel(channel); }, 200);
    }
  });
}
