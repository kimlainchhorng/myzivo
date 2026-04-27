I found two likely blockers in the current voice-note implementation:

1. The code uses direct XHR with `PUT` plus `x-upsert: true`, but the `chat-media-files` bucket only has INSERT and DELETE storage policies, not UPDATE. If the Storage API treats this as an upsert/update path or the object collides, RLS can reject it.
2. The preflight uses `OPTIONS`, which only checks CORS/gateway behavior. It does not reliably prove Storage INSERT permissions, so the UI can still show a failed bubble without the real root cause.

Plan to fix it:

1. Make the voice upload endpoint match Supabase Storage upload semantics
   - Change voice upload XHR from `PUT` upsert to `POST` no-upsert for new unique paths.
   - Remove the `x-upsert` header for voice sends.
   - Keep the required `Authorization` and `apikey` headers.
   - Generate one stable storage path per voice job and reuse it on retries so the UI can show the exact same target URL.

2. Replace weak OPTIONS preflight with a real write probe
   - Add a small `preflightVoiceUploadWrite` helper that uploads a tiny probe object into the user’s own folder in `chat-media-files`, then deletes it immediately.
   - If this fails, show a friendly debug reason like “Storage write blocked: RLS/bucket policy denied upload” with the exact request URL/status.
   - Cache successful preflight briefly per chat session so every voice message does not waste an extra request.

3. Preserve retry/resend without re-recording
   - Keep the recorded audio Blob in `voiceJobsRef` for failed bubbles.
   - Ensure “Resend” restarts the same job with a fresh `AbortController`, stable path, and reset progress.
   - If the first upload succeeded but DB insert failed, retry should skip re-upload and retry only the insert.

4. Improve cleanup and orphan prevention
   - If DB insert fails after a successful upload, keep the object temporarily so “Resend” can reuse it.
   - If the user taps Discard, delete the uploaded object if present and revoke the local object URL.
   - On unmount, abort in-flight jobs and remove the optimistic bubble; failed/discarded jobs should not linger in state.

5. Surface the exact failure in the failed bubble
   - Always store the last failing request phase: `preflight`, `upload`, `insert`, or `cleanup`.
   - Show URL + status for Storage failures and Supabase/PostgREST error code/message for insert failures when debug mode is on.
   - Update the copy/debug icon so tapping it copies the full diagnostic payload, not just the short message.

6. Add the missing Storage UPDATE policy only if we keep any upsert path
   - Preferred fix is no-upsert `POST`, so no DB migration should be needed.
   - If testing still requires upsert behavior, add an authenticated `UPDATE` policy scoped to `chat-media-files` and the uploader’s own folder.

Validation after implementation:
- Run TypeScript/build checks.
- Test a normal voice send, a resend after forced failure, discard during upload, and discard after failed insert.
- Confirm new `direct_messages` voice rows are inserted and no orphaned `chat-media-files` objects remain after discard.