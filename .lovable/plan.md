# Fix: Personal (DM) calls incorrectly use Group Call UI

## Problem

When you tap voice/video call inside a 1-on-1 chat (PersonalChat), the app currently mounts `GroupCallLauncher` with `roomName={`dm-${conversationId}`}`. That's why you see:

- Header: **"Group Call · 0 in call"** (it's the group lobby/screen)
- Pre-join screen showing the raw room name `dm-2e0e7bfe-…_80049196-…` (group lobby title fallback)
- **"Edge Function returned a non-2xx status code"** in the call screen — the LiveKit token edge function is rejecting the request (likely due to room-name length / format or auth)
- **"Recording unavailable · database error 08P01"** — recording insert fails for a DM room

Reference: `src/components/chat/PersonalChat.tsx` line 1601 always launches `GroupCallLauncher` for DM calls, even though there is already a dedicated 1-on-1 call component (`activeCall` flow above it using WebRTC + `CallPiP`).

## What I'll change

### 1. Route DM calls through the personal call flow (not Group)
In `src/components/chat/PersonalChat.tsx`:
- Replace the `launcherCall` → `GroupCallLauncher` block with the existing personal call component (the one already wired to `activeCall`, `CallPiP`, `handleStartCall`).
- `handleStartCall(type)` already exists and starts a true 1-on-1 WebRTC call — point the call buttons (lines 1449 / 1456) to it instead of `setLauncherCall(...)`.
- Remove the now-unused `launcherCall` state, the lazy `GroupCallLauncher` import, and the JSX block at 1597–1609.

Result: DM voice/video calls show the FaceTime-style personal call UI (matches `mem://features/communications/premium-calling-interface`), not the group lobby.

### 2. Keep Group Call UI for actual group chats
`GroupChat.tsx` and `GroupCallEntryPage.tsx` continue to use `GroupCallLauncher` — no change.

### 3. Friendlier lobby header (defensive fix)
In `src/components/chat/call/CallLobby.tsx`, if a room name starts with `dm-`, render a clean title ("Voice call" / "Video call") instead of the raw `dm-<uuid>_<uuid>` string, so even if a DM ever lands here it doesn't look broken.

### 4. Fix recording 08P01 error in lobby
The `08P01` Postgres error = "wrong number of parameters". Inspect the `call_recordings` insert in `CallLobby.tsx` (the "Record this call" toggle pre-check) and fix the malformed insert / RPC call so recording availability can be evaluated without throwing. If the table genuinely doesn't accept DM-style room names, gate the recording toggle to group rooms only.

### 5. Investigate the LiveKit token 2xx error
Check `supabase/functions/livekit-token/index.ts` to confirm it accepts the room name and returns the token. If it fails on long DM room names or unauthenticated requests, return a proper error message and add the missing CORS headers. (Mostly precautionary — once #1 lands, DM calls won't hit this function anyway.)

## Files touched

- `src/components/chat/PersonalChat.tsx` — swap launcher → personal call, remove dead state/import
- `src/components/chat/call/CallLobby.tsx` — friendly title for `dm-` rooms, fix recording precheck
- `supabase/functions/livekit-token/index.ts` — verify CORS + error responses (read-only audit; edit only if needed)

## Out of scope

- Redesign of the group call UI itself
- Changes to the WebRTC personal call component (already working pre-this regression)
