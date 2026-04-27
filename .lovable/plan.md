## Goal

Make voice notes feel reliable: stop background work when discarded/unmounted, show upload progress + status in the bubble, auto-retry transient failures, and surface a clear error with a retry option when sending truly fails.

## Changes

### 1. Track each voice send as a cancellable job

In `PersonalChat.tsx` and `GroupChat.tsx`, add a `voiceJobsRef = useRef<Map<clientSendId, { controller: AbortController; cancel: () => void }>>()`.

For every optimistic voice bubble:
- Create an `AbortController` and store it in the map keyed by `client_send_id`.
- Pass `controller.signal` into the storage upload and DB insert paths (Supabase JS supports `AbortSignal` on `.upload()` and on `.from().insert()` via `.abortSignal()`).
- On unmount: iterate the map, call `controller.abort()` on each, and `URL.revokeObjectURL` for any local blob URLs.
- On user-initiated discard (new "Cancel send" action on a failed/uploading bubble): call `controller.abort()`, remove the optimistic message from state, revoke the blob URL, delete the partially uploaded object from storage if upload had completed.

### 2. Per-bubble upload status on the optimistic message

Extend the local message shape (already has `_local_voice_url`) with transient fields (not persisted):
- `_upload_status?: "uploading" | "sent" | "failed"`
- `_upload_progress?: number` (0–1)
- `_upload_error?: string`

Set `_upload_status = "uploading"` when the optimistic bubble is created. Update progress as the upload runs. On Realtime confirmation (matched by `client_send_id`), drop these fields. On failure after retries, set `_upload_status = "failed"` with the error message.

### 3. Upload progress wiring

Supabase Storage's `upload()` does not natively expose progress events, so switch the voice path to a small `XMLHttpRequest`-based PUT against the resolved storage REST endpoint (`/storage/v1/object/{bucket}/{path}`) using the user's session access token. This gives us real `xhr.upload.onprogress` (0–1) and supports `xhr.abort()` via the `AbortController`.

Update `voiceJobsRef` so `controller.abort()` triggers `xhr.abort()`. On progress, update the corresponding optimistic message's `_upload_progress`.

### 4. Render progress + error states in the voice bubble

Update `VoiceNotePlayer.tsx` to accept optional props:
- `uploadStatus?: "uploading" | "sent" | "failed"`
- `uploadProgress?: number`
- `onRetry?: () => void`
- `onDiscard?: () => void`

Visuals:
- `uploading`: thin progress bar overlay across the waveform (width = `uploadProgress * 100%`), small spinner next to the duration, play button disabled.
- `failed`: red border tint, inline "Failed to send" text with two icon buttons — Retry (refresh icon) and Discard (trash icon).
- `sent` / undefined: current behavior.

In `PersonalChat.tsx` and `GroupChat.tsx` message rendering, pass these new props from the in-memory message and wire `onRetry` / `onDiscard` to handlers that look up the job by `client_send_id`.

### 5. Automatic retry for upload + insert

Wrap the upload step and the DB insert step in a small `retryWithBackoff(fn, { signal, attempts: 3, baseDelayMs: 600 })` helper:
- Retries on network errors and 5xx / 429 responses.
- Does NOT retry on auth errors (401/403), validation errors (400), or when the signal is aborted.
- Backoff: 600ms, 1500ms, 3500ms with small jitter.

Sequence per send:
1. `retryWithBackoff(uploadXhr)` → public URL.
2. `retryWithBackoff(dbInsert)` with the same `client_send_id`.
3. On any abort: stop silently (no toast).
4. On exhaustion: mark bubble `failed`, store `_upload_error`, show one toast with "Retry" action that re-runs the failed step.

### 6. Manual retry / discard handlers

Add `retryVoiceSend(clientSendId)` and `discardVoiceSend(clientSendId)` in both chat components:
- Retry: re-creates an `AbortController`, resets `_upload_status` to `uploading` and `_upload_progress` to 0, restarts from the failed step (re-upload if no `voice_url` yet, else just re-insert).
- Discard: aborts the current job, removes the bubble, revokes the blob URL, deletes the storage object if upload completed but insert failed.

The originating `Blob` is kept on the optimistic message via a transient `_blob` ref-map (kept off the rendered message to avoid React diffs) so retry doesn't need to re-record.

### 7. Unmount cleanup

In a single `useEffect` cleanup in each chat component:
- Abort every pending job in `voiceJobsRef`.
- Revoke every tracked local blob URL immediately (we no longer need the 30s deferred revoke for jobs that the user explicitly leaves behind, but keep the deferred revoke for jobs that completed successfully so playback isn't interrupted mid-swap).

## Files to modify

- `src/components/chat/PersonalChat.tsx` — job map, abort wiring, progress state, retry/discard handlers, unmount cleanup, pass new props to `VoiceNotePlayer`.
- `src/components/chat/GroupChat.tsx` — same changes mirrored.
- `src/components/chat/VoiceNotePlayer.tsx` — new optional props, progress overlay, failed-state UI with Retry/Discard buttons.
- `src/lib/voiceUpload.ts` (new) — `uploadVoiceWithProgress({ blob, path, accessToken, signal, onProgress })` using XHR, plus `retryWithBackoff` helper.

No database migration is required — `client_send_id` already lives in `file_payload`, and the new status/progress fields are client-only transient UI state.

## Out of scope

- No changes to `HoldToRecordMic.tsx` (its cancel gesture already calls `voice.cancelRecording()` before any optimistic bubble exists).
- No persistence of failed messages across reloads (failed sends remain in-memory only; reload clears them, matching current behavior).
