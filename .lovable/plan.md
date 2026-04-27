# Voice messages — fix duration display & "release to send" reliability

From your screen recording I can see two real bugs (plus one polish issue):

## What's wrong

**1. Every voice bubble shows `0:00`.**
In `PersonalChat.tsx` line 1442, the player is rendered as `<VoiceMessagePlayer url={msg.voice_url} isMe={isMe} />` — no duration is passed in. The player has to wait for the audio file to download metadata before it can show the length, and on remote/HTTPS it often never resolves cleanly, so it stays at `0:00` forever.

**2. New recording disappears on release — no bubble appears.**
In your video you held the mic for ~2s, slid nothing, released — and nothing was sent. Cause: `HoldToRecordMic.onPointerUp` checks `heldMs < 500` (`MIN_RECORD_MS`), and because `pendingStart` adds a ~120ms guard before recording actually starts, a quick 0:01–0:02 hold often falls under the threshold OR `willCancel` flips true from a tiny horizontal jitter on touch release. Either way `cancelRecording()` runs and the audio is dropped silently.

**3. Timer reads `0:00` for the first second** of the recording pill before jumping to `0:02` — the elapsed counter only ticks every 100ms but the first paint happens before `startedAt` is set.

## Fix plan

### A. Persist & display real duration
- Add a `duration_ms` field inside the existing `file_payload` JSON column on `messages` (no schema change needed) — write it from `PersonalChat.handleSendVoice` using `voice.duration` returned by the recorder.
- `VoiceMessagePlayer` already accepts `durationMs` as a prop — pass `msg.file_payload?.duration_ms` (with fallback to audio metadata) at the call site in **both** `PersonalChat.tsx` and `GroupChat.tsx`.
- In the player, when `durationMs` is provided show it immediately; only fall back to `audio.duration` if it's missing. Also stop showing `0:00` while loading — show the known total instead.

### B. Make "release to send" reliable
- In `HoldToRecordMic.tsx`:
  - Lower `MIN_RECORD_MS` from 500 → **300ms**, and measure from when recording **actually started** (use `voice.elapsedMs`) instead of from pointer-down, so the 120ms start guard doesn't eat into the threshold.
  - Require a real horizontal drag (`dragX < -60`) AND pointer still moving for `willCancel` — currently a tiny jitter on release can flip it true. Reset `willCancel` to false on `pointerup` before evaluating, then re-check from the final dragX.
  - On any cancel path under MIN_RECORD_MS, log a `console.warn` and show the existing "Hold to record" toast so failures stop being silent.
- In `PersonalChat.handleSendVoice` (the `useEffect` watching `voice.audioBlob`):
  - Add a `try/catch` around the storage upload and `toast.error` on failure (currently a thrown error leaves `voiceUploadInFlightRef` stuck and no message appears).
  - Add an optimistic local message with `pending: true` while uploading, swap to real one on success — so the bubble appears instantly like Telegram/WhatsApp.

### C. Smooth out the recording timer
- In `useVoiceRecorder.start`, set `setElapsedMs(0)` and start the interval on `rAF` instead of a 100ms `setInterval`, computing `Date.now() - startedAt` each frame. This removes the 0:00→0:02 jump and matches the smooth playback work we already did.

## Files to change

- `src/components/chat/PersonalChat.tsx` — pass `durationMs` to player, persist `duration_ms` in `file_payload`, harden upload effect, optimistic bubble.
- `src/components/chat/GroupChat.tsx` — same player prop + persistence.
- `src/components/chat/VoiceMessagePlayer.tsx` — prefer prop duration over `audio.duration`; never display `0:00` if a known total exists.
- `src/components/chat/HoldToRecordMic.tsx` — measure threshold from `voice.elapsedMs`, tighten `willCancel` logic, lower MIN to 300ms.
- `src/hooks/useVoiceRecorder.ts` — rAF-based elapsed tick.

No DB migration required (uses existing `file_payload` JSON column).

## How to verify after the fix

1. Tap-and-hold mic for ~1 second, release → a green voice bubble appears at the bottom showing the actual duration (e.g. `0:01`).
2. Old voice messages on the thread now show their real duration instead of `0:00`.
3. The recording pill timer starts at `0:00` and ticks smoothly to `0:01`, `0:02` without the dead first second.
4. Sliding left past the cancel hint still cancels (no regression).
