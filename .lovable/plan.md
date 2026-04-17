
Goal: stop the false “live but still connecting” state and make the desktop actually show the phone video.

What I confirmed
- The store admin page is finding an active `live_streams` row correctly.
- The desktop viewer is therefore switching into `PairedStreamViewer` and showing “Connecting to phone…”.
- The strongest confirmed failure is in `src/pages/GoLivePage.tsx`: the console log shows `getUserMedia failed` with `NotFoundError: Requested device not found`.
- Right now the app can still create a live stream row even when camera/media setup failed, so the desktop thinks the phone is live while no video tracks are ever published.

Do I know what the issue is?
- Yes. The main issue is not QR anymore.
- The phone/live publisher can enter “live” without a valid local camera stream.
- `GoLivePage` also uses overly strict camera constraints (`facingMode` only) with no fallback path, so media setup can fail on some devices/browsers.
- Result: Supabase shows a live stream, but WebRTC never gets usable media, so the desktop stays stuck on “Connecting to phone…”.

Implementation plan
1. Harden camera acquisition in `src/pages/GoLivePage.tsx`
- Replace the single `getUserMedia({ video: { facingMode } })` call with a fallback sequence like the QR scanner uses:
  - `facingMode: { ideal: ... }`
  - plain camera request without facing mode
  - optional device-based retry from `enumerateDevices()`
- Preserve the chosen stream in state and keep preview/video binding stable.

2. Block “Go Live” until media is actually ready
- Require a valid `localStream` with at least one live video track before creating the `live_streams` row.
- If camera setup failed, keep the user in setup mode and show a clear retry message instead of allowing a broken broadcast to start.
- Update the CTA state so users cannot start a “headless” stream.

3. Tighten publisher startup conditions
- In `GoLivePage.tsx`, only initialize publisher WebRTC once the stream has valid tracks.
- If tracks end or the stream goes inactive, surface that as a broadcaster error and stop/recover cleanly instead of silently remaining “live”.

4. Improve desktop studio status messaging
- In `src/components/live/PairedStreamViewer.tsx`, distinguish:
  - waiting for stream row
  - waiting for publisher offer
  - connected but no media tracks yet
  - disconnected/retrying
- This avoids the generic “Connecting to phone…” state hiding the real problem.

5. Add targeted signaling diagnostics
- In `supabase/functions/live-signal/index.ts`, add structured logs for:
  - `join`, `offer`, `answer`, `ice`, `heartbeat`
  - stream id
  - caller role
  - paired vs authenticated caller
  - rejected publisher attempts
- This will make the next failure immediately traceable in Supabase logs instead of guessing.

6. Verify the full workflow after the fix
- Test: desktop admin opens studio → phone scans QR → confirm → camera preview appears on phone → go live only succeeds when media is ready → desktop receives video.
- Re-test refresh and reconnect cases so the stream does not stay “live” without actual media.

Files to update
- `src/pages/GoLivePage.tsx`
- `src/components/live/PairedStreamViewer.tsx`
- `supabase/functions/live-signal/index.ts`

Expected outcome
- The phone will no longer be allowed to mark itself live unless camera/media is actually available.
- The desktop studio should either show the real video feed or a precise broadcaster-side error instead of hanging forever on “Connecting to phone…”.
