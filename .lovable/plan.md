
The user wants a forward-looking upgrade pass on the live-streaming + signaling stack: APIs, Supabase functions, and server bits — bringing them to a more modern, robust v2026 baseline.

Goal: harden and modernize the live pipeline + related infra so it's production-grade across app + website.

## Upgrade plan

### 1. Edge function runtime + dependency upgrades
- Bump all live-related functions to `@supabase/supabase-js@2.57.0` (latest stable) — currently pinned to `2.49.1`.
- Standardize Deno imports via `npm:` specifier with explicit versions across:
  - `live-signal`
  - `pair-go-live`
  - `get-ice-servers`
  - `admin-create-user`, `admin-delete-user`
- Add shared `_shared/cors.ts` so CORS headers stop being copy-pasted in every function.

### 2. `get-ice-servers` v2 (resilience + caching)
- Add 30s in-memory cache for Twilio credentials (reduces NTS API calls + latency).
- Add fallback chain: Twilio → Cloudflare STUN → Google STUN, never return empty.
- Return `ttl` field so client can refresh proactively before expiry (Twilio tokens last 1h).
- Add `region` hint based on `cf-ipcountry` header for geo-optimized relay selection.

### 3. `live-signal` v2 (throughput + cleanup)
- Add server-side dedup for ICE candidates (drop duplicates within 2s window) to cut signaling spam.
- Auto-prune signals older than 60s on every write (lightweight inline cleanup).
- Add structured response: `{ok, signalId, role}` instead of bare `{ok:true}`.
- Add rate limit: max 200 signals/min per stream to prevent runaway loops.

### 4. `pair-go-live` v2 (security + UX)
- Shorten pair code TTL from current value to 90s (tighter security window).
- Add single-use enforcement (mark `consumed_at` on pair).
- Return `expiresAt` so client shows live countdown.

### 5. Client `liveWebrtc.ts` upgrades
- Add proactive ICE refresh at 80% of TTL.
- Add `iceTransportPolicy: "all"` with auto-fallback to `"relay"` after first failure.
- Wrap all signal posts with exponential backoff retry (3 attempts).
- Add connection quality monitor (`getStats()` every 5s → log packet loss + bitrate).

### 6. Database hygiene migration
- Add index on `live_stream_signals(stream_id, created_at)` for faster polling.
- Add index on `live_streams(status, started_at)` for active-stream lookups.
- Add scheduled cleanup function (pg_cron) to purge `live_stream_signals` older than 5 min and `live_pair_sessions` older than 10 min.

### 7. Realtime subscription upgrade
- Switch `live_streams` status changes from polling to Supabase Realtime channel where used (lower latency, less load).

### 8. Verification
- After deploy: curl `get-ice-servers` to confirm cached + fallback path.
- Check Supabase function logs for new structured fields.
- Confirm signaling table stays under ~500 rows steady-state.

## Files to update / create
- `supabase/functions/_shared/cors.ts` (new)
- `supabase/functions/get-ice-servers/index.ts`
- `supabase/functions/live-signal/index.ts`
- `supabase/functions/pair-go-live/index.ts`
- `supabase/functions/admin-create-user/index.ts`
- `supabase/functions/admin-delete-user/index.ts`
- `src/lib/liveWebrtc.ts`
- new migration: indexes + pg_cron cleanup

Approve and I'll roll all of this out in one default-mode pass.
