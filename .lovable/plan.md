

## Root cause (verified against DB)

The desktop never switches to the WebRTC viewer because the auto-detect RPC silently fails:

- `get_active_pair_session_for_store` queries `FROM public.stores` — **that table does not exist** in this project. The actual table is `public.store_profiles`.
- Result: the RPC raises `relation "stores" does not exist`, the catch in `StoreLiveStreamSection.tsx` swallows it as a warning, and `pairStatus` stays at `"idle"` on every page load.
- DB confirms: pair session for store `0013f47a…` IS `confirmed`, the live stream `51acbbff…` IS `live`, but `live_stream_signals` only contains a single `bye` from the publisher — **no `join` was ever sent by the desktop**, so the publisher never built an offer, so the desktop preview shows the camera-less `<GoLivePage />` (the "Waiting for viewers…" text in the screenshot is from GoLivePage's chat empty-state, not the viewer).

A second smaller issue: even when the pair fires within the same session and `pairStatus` does flip via realtime, on a hard refresh the recovery path is broken for the same reason.

## Fix

### 1. Migration: rewrite the RPC against the real table
- Replace `public.stores` references with `public.store_profiles`
- Same signature, same return columns (`session_id`, `store_owner_id`, `store_name`, `store_avatar_url`, `status`, `device_expires_at`, `confirmed_at`)
- Keep SECURITY DEFINER + owner/admin authorization check

### 2. Fallback: detect active live stream even without an active pair session
In `StoreLiveStreamSection.tsx`, add a parallel auto-detect: query `live_streams` for `user_id = storeOwnerId` and `status = 'live'`. If one exists, set `pairStatus = "confirmed"` and auto-mount the studio. This makes the desktop self-healing even if the RPC fails again or the pair session expires while a stream is live.

### 3. Hard-fail RPC errors loudly (dev-only)
Change the silent `console.warn` swallow to also log the error message body so the next regression is caught immediately.

### 4. Cleanup signal noise
The publisher's cleanup currently sends `bye` whenever the effect tears down (camera flip, mic toggle, etc.). Guard it so `bye` is only sent when the stream truly ends (`phase === "ended"`), not on every dependency change. Otherwise the desktop viewer can receive a stale `bye` mid-handshake.

## Files
- New migration: drop + recreate `public.get_active_pair_session_for_store(uuid)` against `store_profiles`
- `src/components/admin/StoreLiveStreamSection.tsx` — add live-stream fallback effect; surface RPC errors
- `src/pages/GoLivePage.tsx` — only emit `bye` on stream end

## Out of scope
- TURN server (still STUN-only — fine for same-LAN/most home networks)
- Multi-viewer broadcast

