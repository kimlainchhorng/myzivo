

## Goal
After QR pairing, the desktop "Go Live Studio" panel should automatically display the **live video feed from the paired phone**, instead of mounting its own camera-less `<GoLivePage />`.

## Current state
- Phone (paired) opens its camera via `getUserMedia` and creates a `live_streams` row — but no video frames are sent anywhere.
- Desktop panel mounts a second `<GoLivePage />` inside an iframe-like container — it shows the LIVE chrome but no video, because there's no camera/stream source on desktop.
- There is no WebRTC signaling table or relay between the two devices.

## Plan

### 1. Add WebRTC signaling (Supabase Realtime)
- New table `live_stream_signals(id, stream_id, from_role, to_role, type, payload jsonb, created_at)` for SDP offers/answers + ICE candidates
- RLS: insert/select allowed when caller knows the `stream_id` (it's a UUID — capability token); enable Realtime
- Cleanup trigger: delete signals older than 2 minutes

### 2. Phone = WebRTC publisher
In `GoLivePage.tsx`, when in **paired mode** and stream goes LIVE:
- Create `RTCPeerConnection` with public STUN servers (`stun:stun.l.google.com:19302`)
- Add the `MediaStream` tracks already captured from `getUserMedia`
- Subscribe to Realtime channel `stream:{stream_id}` for incoming "viewer-join" / "answer" / "ice" messages
- On viewer-join → create offer → publish via `live_stream_signals`
- Forward ICE candidates as they arrive

### 3. Desktop "Go Live Studio" = WebRTC viewer
Replace the embedded `<GoLivePage />` in `StoreLiveStreamSection.tsx` with a new lightweight `<PairedStreamViewer streamId={...} />` component that:
- Polls `live_streams` for the active stream of the paired store (status='live', user_id=storeOwnerId)
- Once found, opens a `RTCPeerConnection` as viewer-only (recvonly)
- Sends a "viewer-join" signal; processes incoming offer → sends answer → exchanges ICE
- Renders the received `MediaStream` in a `<video autoPlay playsInline muted>` filling the phone-frame container
- Falls back gracefully: if no live stream yet, show "Waiting for phone to go live…" with the host avatar/name

### 4. Wire pairing → viewer
- After QR confirmation (already detected via realtime in `StoreLiveStreamSection`), automatically `setShowLivePanel(true)` and switch the panel content from `<GoLivePage />` to `<PairedStreamViewer />` keyed off `pairStatus === "confirmed"`
- Keep the existing fallback for non-paired (desktop-only) flow: still mount `<GoLivePage />` if user clicked "Go Live Now" without pairing

### 5. Lifecycle & cleanup
- Close PC + unsubscribe channel on unmount or when stream ends
- Phone tears down PC on stream end (already calls `pair-go-live` end action)
- Signals auto-purged by the cleanup trigger

## Technical details
- Files to change: `src/pages/GoLivePage.tsx` (add publisher block guarded by `isPaired && phase==='live'`), `src/components/admin/StoreLiveStreamSection.tsx` (swap embed), new `src/components/live/PairedStreamViewer.tsx`, new `src/lib/liveWebrtc.ts` (signaling helpers)
- Migration: create `live_stream_signals` table + RLS + Realtime publication + cleanup function
- No TURN server needed for v1 (STUN-only works on most home/office networks); add TURN later if needed for stricter NATs
- Audio is muted on the desktop preview to prevent echo

## Out of scope
- TURN relay for symmetric NATs (note in comments)
- Recording the stream server-side
- Multi-viewer broadcast on desktop (only the paired-store's own desktop viewer is wired here; public viewers would need an SFU)

