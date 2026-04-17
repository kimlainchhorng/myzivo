
Goal: make the paired phone’s live video actually appear in Go Live Studio instead of staying on “Connecting to phone…”.

What I found
- QR/pairing is not the main blocker anymore.
- The current network snapshot shows the desktop viewer successfully sending `answer` and `ice` to `live-signal` with `200` responses, and there is an active `live_streams` row.
- That means:
  - the store owner is live,
  - the desktop found the stream,
  - signaling is at least partially working.
- The strongest code-level failure is in `src/pages/GoLivePage.tsx`: the paired publisher WebRTC effect only depends on `[streamId, phase, isPaired]` and exits if `streamRef.current` is empty at that moment. If camera/media becomes ready slightly later, the publisher peer connection never starts, so the desktop keeps waiting forever.
- There is also a second likely reliability problem: the app is STUN-only (`src/lib/liveWebrtc.ts`). Even with correct signaling, many phone/desktop network combinations will never connect without TURN relay fallback.

Implementation plan
1. Fix the phone publisher lifecycle in `GoLivePage.tsx`
- Move local media from ref-only usage to tracked state so WebRTC setup reruns when the actual stream becomes available.
- Ensure the publisher connection effect depends on the live local stream, not just `streamId/phase`.
- Recreate or renegotiate correctly when camera flips or tracks change.
- Add safe handling for delayed camera permission and delayed stream attachment.

2. Preserve browser media gesture requirements
- Call `getUserMedia` directly from the user’s live-start interaction path, or pre-arm it before async countdown work.
- Keep the preview/video attachment explicit and handle `play()` failures.
- This reduces silent mobile failures where the phone says “live” but never actually publishes usable tracks.

3. Harden the WebRTC handshake on both sides
- In `GoLivePage.tsx` and `PairedStreamViewer.tsx`, queue ICE candidates until remote descriptions exist.
- Ignore duplicate/late offers and answers more defensively.
- Add explicit reconnect/re-offer behavior when connection state becomes `failed` or stalls in `connecting`.
- Send `bye` only on true teardown, not incidental rerenders.

4. Improve backend observability in Supabase edge functions
- Update `supabase/functions/live-signal/index.ts` to log enough structured diagnostics for:
  - role,
  - stream id,
  - paired vs authenticated caller,
  - insert failures,
  - rejected publisher ownership,
  - heartbeat updates.
- Optionally add lightweight validation around stream state before accepting signals.
- Keep `pair-go-live` as the authoritative paired-device live entrypoint, but add better diagnostic responses where useful.

5. Add TURN fallback support
- Extend `src/lib/liveWebrtc.ts` to include relay servers in addition to Google STUN.
- Check secrets first before implementation and wire TURN credentials from Supabase secrets/config.
- This is important because even a perfect signaling flow can still fail to show video across NAT/mobile networks without relay support.

6. Verify the full flow end-to-end after implementation
- Test desktop store admin → open QR dialog → phone scans → confirm → go live → desktop viewer receives video/audio.
- Test same-network and different-network scenarios.
- Test phone refresh while live, desktop refresh while live, and explicit end-stream.
- Test that QR does not rotate unnecessarily during active live and only refreshes when the live session truly ends.

Files to update
- `src/pages/GoLivePage.tsx`
- `src/components/live/PairedStreamViewer.tsx`
- `src/lib/liveWebrtc.ts`
- `supabase/functions/live-signal/index.ts`
- possibly `supabase/functions/pair-go-live/index.ts` if better paired diagnostics are needed

Technical details
- Primary likely bug:
  - publisher setup depends on `streamRef.current` but does not rerun when the media stream becomes ready.
- Secondary likely bug:
  - STUN-only ICE config causes real-world connection failures even when signaling succeeds.
- Evidence already seen:
  - active `live_streams` row exists,
  - viewer sends `answer` and `ice`,
  - `live-signal` returns `200`,
  - so the remaining problem is most likely media publication / peer connectivity, not QR generation itself.

If you approve, I’ll implement the lifecycle fix first, then add TURN support and run the full paired live workflow check.