/**
 * liveWebrtc — Minimal Supabase-backed WebRTC signaling between
 * a paired phone (publisher) and the desktop Go Live Studio (viewer).
 *
 * Signals are exchanged via the `live_stream_signals` table + Realtime.
 * Knowing the stream UUID is the capability — RLS allows insert/select on it.
 *
 * Topology: 1 publisher → 1 viewer (the store owner's desktop).
 * ICE servers are fetched at runtime from the `get-ice-servers` edge function
 * which mints short-lived Twilio TURN credentials. This is critical: pure
 * STUN cannot punch through symmetric NAT (mobile carrier ↔ home Wi-Fi),
 * so we MUST have working TURN relay or the connection silently fails.
 */
import { supabase } from "@/integrations/supabase/client";
import { getPairToken } from "@/lib/livePairing";

export type SignalRole = "publisher" | "viewer";
export type SignalType = "join" | "offer" | "answer" | "ice" | "bye" | "heartbeat";

/**
 * STUN-only fallback. Used before the edge function returns and as a last
 * resort if Twilio NTS is down. Real cross-network calls will need the TURN
 * servers fetched via `getIceServers()` below.
 */
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

let cachedIce: RTCIceServer[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 50 * 60 * 1000; // 50 min, less than Twilio's 60-min TTL

/**
 * Fetch ICE servers (STUN + Twilio TURN) from the edge function.
 * Cached for ~50 minutes per page session.
 *
 * Always returns at least the STUN fallback so callers never get an empty list.
 */
export async function getIceServers(): Promise<RTCIceServer[]> {
  const now = Date.now();
  if (cachedIce && now - cachedAt < CACHE_TTL_MS) return cachedIce;

  try {
    const { data, error } = await (supabase as any).functions.invoke("get-ice-servers", {
      body: {},
    });
    if (error) throw error;
    const servers = (data as any)?.iceServers;
    if (Array.isArray(servers) && servers.length > 0) {
      cachedIce = servers;
      cachedAt = now;
      const hasTurn = servers.some((s: any) =>
        Array.isArray(s.urls)
          ? s.urls.some((u: string) => u.startsWith("turn"))
          : typeof s.urls === "string" && s.urls.startsWith("turn"),
      );
      console.log(
        `[liveWebrtc] ICE servers loaded (${servers.length}), TURN=${hasTurn}`,
      );
      return servers;
    }
  } catch (e) {
    console.warn("[liveWebrtc] get-ice-servers failed, using STUN fallback", e);
  }
  return ICE_SERVERS;
}

/**
 * Logs the active ICE candidate-pair type so it's instantly obvious whether
 * the connection went direct (host/srflx) or via TURN (relay). Call this
 * once `connectionState === "connected"`.
 */
export async function logSelectedCandidatePair(
  pc: RTCPeerConnection,
  tag: string,
): Promise<void> {
  try {
    const stats = await pc.getStats();
    let pair: any = null;
    stats.forEach((r: any) => {
      if (r.type === "candidate-pair" && r.state === "succeeded" && r.nominated) {
        pair = r;
      }
    });
    if (!pair) return;
    let local: any = null, remote: any = null;
    stats.forEach((r: any) => {
      if (r.id === pair.localCandidateId) local = r;
      if (r.id === pair.remoteCandidateId) remote = r;
    });
    console.log(
      `[${tag}] selected candidate pair: local=${local?.candidateType}/${local?.protocol} remote=${remote?.candidateType}/${remote?.protocol}`,
    );
  } catch (e) {
    console.warn(`[${tag}] candidate-pair stats failed`, e);
  }
}

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
  try {
    const pairToken = getPairToken();
    const { error } = await (supabase as any).functions.invoke("live-signal", {
      body: { stream_id: streamId, from_role: from, to_role: to, type, payload },
      headers: pairToken ? { "x-pair-token": pairToken } : undefined,
    });
    if (error) {
      console.warn("[liveWebrtc] live-signal failed, falling back", error, { type, to });
      // Fallback to direct insert so existing flow keeps working if function is down
      await (supabase as any).from("live_stream_signals").insert({
        stream_id: streamId,
        from_role: from,
        to_role: to,
        type,
        payload,
      });
    }
  } catch (e) {
    console.warn("[liveWebrtc] send signal threw", e);
  }
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
