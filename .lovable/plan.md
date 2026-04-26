# Phase 5 — Track B v2: pre-call recording summary, real-time REC indicator, persistent reaction strip, lobby wiring

Tightens the call lobby/recording UX and ensures every approved feature is reachable from the call entry. All existing LiveKit hooks stay; this round is composition + small UX additions.

## 1. Pre-call recording summary in lobby
- New hook `useRecordingPreflight(enabled)` does a low-cost `storage.from('call-recordings').list('', {limit:1})` to determine whether the recordings bucket is reachable for the host.
- `CallLobby` shows a new info card directly under the Record toggle:
  - "Recording: **On**" / "Off" with the storage bucket badge: `Bucket ready` (emerald), `Checking…` (zinc), or `Unavailable — recording disabled` (rose, with the toggle force-disabled).
  - Helper text under the bucket badge (e.g., "Saved privately to call-recordings").
- If status is `unavailable`, the Record switch becomes disabled and visually muted; lobby still allows joining.

## 2. Auto-record at connect (already in `useLiveKitCall`)
No change — `autoRecord: true` is passed from lobby and starts cloud recording inside the connect flow.

## 3. Real-time REC privacy indicator
- Top-bar pill in `GroupCallScreenV2` already pulses; promote it to a stronger banner with shadow + ring when recording.
- `VideoTile` gains a small pulsing red dot in the top-left when `isRecording` is true (every tile, every viewer) — visual privacy disclosure.
- `GroupCallGrid` accepts a new `isRecording` prop and forwards it.

## 4. Quick reaction strip (always visible)
- New `CallReactionStrip` component: floating horizontal pill above the controls, ~6 emoji (`👍 ❤️ 😂 🎉 👏 🔥`).
- Renders inside the stage (bottom center) so reactions are 1-tap, no popover.
- Wires into existing `call.sendReaction` — existing data-channel + overlay already broadcast to everyone.
- The popover-based picker in `GroupCallControls` stays for less-common emoji.

## 5. Mount GroupCallLauncher at the call entry
- Add a route in `src/App.tsx`:
  - `/chat/call/group/:roomName` → lazy-loaded `GroupCallEntryPage` that renders `<GroupCallLauncher roomName={roomName} callType="video" onEnded={() => navigate(-1)} />`.
- Add a small entry component `src/pages/chat/GroupCallEntryPage.tsx` that reads `roomName` and an optional `?audio=1` query.
- This makes the lobby + screen-sharing + reactions + recording reachable today by linking to `/chat/call/group/<id>` from anywhere (a future task can attach the link to existing chat call buttons).

## Files
**New**
- `src/hooks/useRecordingPreflight.ts`
- `src/components/chat/call/CallReactionStrip.tsx`
- `src/pages/chat/GroupCallEntryPage.tsx`

**Edited**
- `src/components/chat/call/CallLobby.tsx` — bucket status card, Record disabled when unavailable.
- `src/components/chat/call/GroupCallScreenV2.tsx` — pass `isRecording` into grid, mount reaction strip.
- `src/components/chat/call/GroupCallGrid.tsx` — accept + forward `isRecording`.
- `src/components/chat/call/VideoTile.tsx` — pulsing per-tile REC dot.
- `src/App.tsx` — add `/chat/call/group/:roomName` route.

## Acceptance
- Open `/chat/call/group/test-room` → lobby with self-preview, mic/cam toggles, Record switch, and a bucket status badge.
- Toggle Record on (when bucket is ready) → join → recording starts within ~2s → REC banner + per-tile dot visible to everyone.
- Tap any emoji in the persistent reaction strip → it floats up immediately for the local user and on every other client.
- Screen-share button starts a tile that everyone sees; stop returns to grid.
- If the bucket is `unavailable`, the Record switch is disabled and labeled accordingly; the call still joins normally.
