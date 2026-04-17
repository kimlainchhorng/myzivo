

## What I found

The code-level handshake looks correct now: ICE queuing, signaling guards, media-ready gating, and `restartIce()` on failure are all in place. The single remaining structural risk that matches the symptom ("stays on Connecting then turns off") is the **TURN server**.

`src/lib/liveWebrtc.ts` relies on `openrelay.metered.ca` as the only TURN relay. That free service has been shut down / heavily rate-limited since 2024 and frequently returns no relay candidate. When the phone (mobile carrier NAT) and desktop (home/office NAT) cannot do P2P over STUN, ICE has nowhere to fall back to → `iceConnectionState` goes `checking → failed`, `restartIce()` retries against the same dead TURN, the desktop flips to `disconnected`, then the publisher heartbeat eventually marks the stream ended → "they turn off."

I cannot run the live browser test from plan mode (and live broadcasting requires a real phone scanning the QR — the automated browser cannot do that). The fix below is what needs to happen.

## Plan

1. **Replace TURN relay with a working provider**
   - Remove dead `openrelay.metered.ca` entries from `ICE_SERVERS` in `src/lib/liveWebrtc.ts`.
   - Add a real TURN provider. Recommended: Metered's `global.relay.metered.ca` (free tier with API-key credentials) or Cloudflare Calls TURN.
   - Prompt for and store TURN credentials as Supabase secrets: `TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL`.
   - Add a tiny edge function `get-ice-servers` that returns the merged STUN+TURN list, so credentials are never shipped in the bundle.
   - Update `liveWebrtc.ts` to fetch ICE servers once per session and cache them.

2. **Add ICE diagnostics on both sides**
   - Log `iceConnectionState`, `iceGatheringState`, and selected candidate-pair type (`host` / `srflx` / `relay`) in `GoLivePage.tsx` and `PairedStreamViewer.tsx`.
   - This makes it instantly visible in console whether TURN is actually being used.

3. **Tighten reconnect behavior**
   - In `PairedStreamViewer.tsx`, on `failed`, call `pc.restartIce()` once and re-send `join` instead of immediately tearing down to `waiting-for-stream` after 1.2 s. Only fall back to teardown if restart fails after ~6 s.

4. **Verify end-to-end after edits**
   - Desktop opens Go Live Studio → phone scans QR → confirm → camera preview shows on phone → tap Go Live → desktop receives video within 5 s on a different network (mobile data vs. home Wi-Fi).
   - Confirm in console that the selected candidate pair is `relay` when on different networks.

## Files to update
- `src/lib/liveWebrtc.ts`
- `src/pages/GoLivePage.tsx`
- `src/components/live/PairedStreamViewer.tsx`
- new edge function: `supabase/functions/get-ice-servers/index.ts`

## What I need from you
Approve the plan and pick a TURN provider so I can wire credentials:
- **Metered** (free 50GB/mo, fastest to set up — sign up at metered.ca, give me the app name + secret key)
- **Cloudflare Calls TURN** (free, requires Cloudflare account + API token)
- **Twilio NTS** (paid, most reliable — needs Twilio Account SID + Auth Token, you already use Twilio for OTP)

Once you tell me which one, I'll switch to default mode and implement everything in one pass.

