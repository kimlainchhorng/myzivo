## Why send feels slow today

I traced the actual send paths in `PersonalChat.tsx` (and the same shape in `GroupChat.tsx`). Text is already optimistic + fire-and-forget, but **every other message type is blocking the UI on the network**, which is what you’re feeling as “slow”.

Concretely:

1. **Image / Video / File / GIF send** (lines 808–870 area):
   - `setUploadingMedia(true)` → user sees nothing in the chat.
   - `await supabase.storage.upload(...)` (1–4s on mobile).
   - `await getPublicUrl(...)` then `await handleSend({...})` which inserts.
   - Only after all that does the bubble appear. So for any photo/video/file, the user waits the full upload before seeing their own message. That is the #1 reason it feels slow.

2. **Voice send**:
   - Optimistic bubble is already shown — good — but the bubble appears **after** `MediaRecorder.onstop` fires (the `useEffect` only runs when `voice.audioBlob` is set). On many phones `onstop` takes 150–500ms after release. So between “I let go” and “I see my bubble”, there’s a visible gap.
   - Upload still happens before insert, which is fine, but voice notes are tiny so the real felt latency is the recorder finalize delay above.

3. **Voice optimistic UI also fires the message effect / scroll only once and then waits ~1–2s for the realtime echo** — that part is fine, but the `chat-media-files` bucket upload uses default `cacheControl` and no `duplex`/streaming hints, which on slow networks adds noticeable time.

4. **Text path is healthy.** No changes needed there.

5. **Receiver side**: receiver only sees the message after the DB insert completes. So speeding up the sender insert (already fire-and-forget) also speeds up the receiver. No extra work needed beyond #1–#3.

---

## Plan

### 1. Make image / video / file / GIF sends optimistic (biggest win)

In `PersonalChat.tsx` and `GroupChat.tsx`, change `handleImageSelect`, `handleVideoSelect`, the file/document send path, and the GIF send path:

- Immediately push an optimistic message bubble using a local `URL.createObjectURL(file)` (for images/videos) or a placeholder file payload (for documents).
- Show a small inline spinner / progress on the optimistic bubble (reuse the `Loader2` pattern already used for voice).
- Run upload + insert in the background.
- On success: swap the optimistic bubble’s `image_url` / `video_url` / `file_payload.url` with the real public URL. Realtime echo replaces it cleanly.
- On failure: mark the bubble with an error state + retry button, instead of silently disappearing.
- Defer `URL.revokeObjectURL` by ~30s so the local preview keeps working until the remote URL is ready (same pattern already used for voice).

### 2. Reduce voice “release → bubble” gap

In `HoldToRecordMic.tsx` + `PersonalChat.tsx` / `GroupChat.tsx`:

- On release, immediately render a placeholder voice bubble (`message_type: "voice"`, `voice_url: null`, `is_uploading: true`) before `MediaRecorder.onstop` resolves. Currently we wait for `voice.audioBlob` to appear in the effect — that’s the gap.
- When `useVoiceRecorder.stop()` resolves with the blob, attach the local object URL to the existing placeholder instead of creating a new one.
- This removes the 150–500ms “dead air” after release on mobile.

### 3. Speed up the actual upload

In the voice + media upload calls in `PersonalChat.tsx` and `GroupChat.tsx`:

- Pass `cacheControl: "3600"` and keep `upsert: true` so Supabase Storage doesn’t do a HEAD/exists check round-trip.
- Use the existing `uploadWithProgress` helper (`src/utils/uploadWithProgress.ts`) for image/video/file so we can show real upload progress on the optimistic bubble. Voice can stay on the SDK call (tiny payload).
- Use the recorder’s actual MIME (already done for voice) for image/video too — pass `file.type` (already done) and avoid re-encoding.

### 4. Background push notification

Already `void sendChatPush(...)` — confirmed non-blocking. No change.

### 5. Apply the same changes consistently to `GroupChat.tsx`

`GroupChat.tsx` mirrors `PersonalChat.tsx` for media/voice. Apply the same optimistic + background-upload pattern to its `group_messages` insert path.

### 6. Sanity / type check

Run `tsc --noEmit` after the edits.

---

## Files to modify

- `src/components/chat/PersonalChat.tsx` — image/video/file/GIF optimistic flow + voice placeholder timing.
- `src/components/chat/GroupChat.tsx` — same changes for group sends.
- `src/components/chat/HoldToRecordMic.tsx` — emit a “recording stopped, blob pending” signal on release so the chat can place the placeholder bubble before `onstop` resolves.
- `src/hooks/useVoiceRecorder.ts` — expose an `onReleaseStart` callback or a `stopping` flag so chats can show the bubble immediately.

## Expected result

- Text send: unchanged (already instant).
- Voice send: bubble appears the instant your finger lifts; audio becomes playable ~150–400ms later; remote sync within ~1s.
- Photo / video / file send: bubble appears instantly with thumbnail + spinner; replaces with confirmed message when upload finishes; recipient receives as soon as upload+insert completes (same as today, but sender no longer feels the wait).

```text
Before: pick file -> wait upload -> wait insert -> bubble appears
After:  pick file -> bubble appears instantly with thumbnail + spinner
                  \-> upload + insert in background -> bubble confirms
```
