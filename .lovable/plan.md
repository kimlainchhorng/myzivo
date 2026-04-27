## Goal

Add a lightweight runtime debug mode that surfaces the full last upload/insert error reason in the failed voice bubble. Items 1–4 in the request are already implemented in the current code (cancellable jobs with abort-on-unmount/discard, in-bubble progress + percentage, Retry/Discard with exponential backoff, orphaned-storage cleanup + revoked object URLs), so this plan only covers the new debug-mode work.

## Changes

### 1. New `src/lib/voiceDebug.ts`

A tiny module that owns a single boolean flag persisted in `localStorage` under the key `zivo:voice-debug`. Exports:

- `isVoiceDebugEnabled(): boolean` — cached read.
- `setVoiceDebugEnabled(on: boolean): void` — persists + updates cache.
- `vlog(...args)` — `console.log` only when debug is on.
- `vwarn(...args)` — always warns (failures should always log).

Also installs `window.__zivoVoiceDebug(true | false)` so the flag can be flipped from the browser console without DevTools digging.

### 2. Wire debug logs into the voice send pipeline

In `src/components/chat/PersonalChat.tsx` and `src/components/chat/GroupChat.tsx`, inside `runVoiceJob`:

- `vlog("send:start", { clientSendId, sizeBytes, durationMs })` before upload.
- `vlog("upload:progress", { clientSendId, ratio })` (throttled to log only on 25/50/75/100% to avoid console spam).
- `vlog("upload:done", { clientSendId, publicUrl })` after upload.
- `vlog("insert:done", { clientSendId })` after insert.
- On retriable failure inside `retryWithBackoff`, log `vlog("retry", { attempt, error })`.
- On terminal failure, `vwarn("failed", { clientSendId, step, error })` — replaces the current `console.warn`.

### 3. Surface error reason in the failed bubble

Update `src/components/chat/VoiceMessagePlayer.tsx`:

- Read `isVoiceDebugEnabled()` once per render.
- When `uploadStatus === "failed"`:
  - Default behavior (debug off): keep the current compact `Failed to send` label with the full error in the `title` tooltip (already implemented).
  - Debug on: render an additional small line under the bubble row showing `uploadError` in `text-[10px] text-destructive/80 break-all max-w-[240px]`, so the user can read the full reason inline (e.g., `403 row-level security`, `Network error`, `payload too large`).
- Also add a tiny "i" info icon button next to the Failed label that, when tapped, copies `uploadError` to clipboard and shows a toast — useful for sharing diagnostics even when debug mode is off.

### 4. Settings entry point (optional, in-app toggle)

Add a single switch in `src/components/chat/settings/` (or the nearest existing chat-settings sheet — to be confirmed during implementation): "Show voice send error details". Bound to `isVoiceDebugEnabled` / `setVoiceDebugEnabled`. This avoids requiring users to open the browser console.

## Files

- `src/lib/voiceDebug.ts` — new
- `src/components/chat/VoiceMessagePlayer.tsx` — debug-aware error rendering + copy button
- `src/components/chat/PersonalChat.tsx` — `vlog`/`vwarn` calls in `runVoiceJob`
- `src/components/chat/GroupChat.tsx` — same, mirrored
- One existing chat-settings component — add the toggle row (file picked during implementation based on what exists)

## Out of scope

- No new persisted error log table — failures live in memory and are dropped on reload (matches the current optimistic-bubble lifecycle).
- No changes to the upload, retry, abort, or cleanup logic — those are already in place.
