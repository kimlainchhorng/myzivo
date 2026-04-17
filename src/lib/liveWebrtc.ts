/**
 * liveWebrtc — Minimal Supabase-backed WebRTC signaling between
 * a paired phone (publisher) and the desktop Go Live Studio (viewer).
 *
 * Signals are exchanged via the `live_stream_signals` table + Realtime.
 * Knowing the stream UUID is the capability — RLS allows insert/select on it.
 *
 * Topology: 1 publisher → 1 viewer (the store owner's desktop).
 * No SFU, no TURN. STUN-only — fine for most home/office networks.
 */
import { supabase } from "@/integrations/supabase/client";

export type SignalRole = "publisher" | "viewer";
export type SignalType = "join" | "offer" | "answer" | "ice" | "bye";

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export interface SignalRow {
  id: string;
  stream_id: string;
  from_role: SignalRole;
  to_role: SignalRole;
  type: SignalType;
  payload: any;
  created_at: string;
}

export async function sendSignal(
  streamId: string,
  from: SignalRole,
  to: SignalRole,
  type: SignalType,
  payload: any,
): Promise<void> {
  const { error } = await (supabase as any).from("live_stream_signals").insert({
    stream_id: streamId,
    from_role: from,
    to_role: to,
    type,
    payload,
  });
  if (error) console.warn("[liveWebrtc] send signal failed", error, { type, to });
}

/**
 * Subscribe to incoming signals for a stream addressed to `myRole`.
 * Returns an unsubscribe function.
 */
export function subscribeSignals(
  streamId: string,
  myRole: SignalRole,
  onSignal: (row: SignalRow) => void,
): () => void {
  const channel = supabase
    .channel(`stream-signal-${streamId}-${myRole}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "live_stream_signals",
        filter: `stream_id=eq.${streamId}`,
      },
      (payload: any) => {
        const row = payload.new as SignalRow;
        if (row.to_role === myRole) onSignal(row);
      },
    )
    .subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}
