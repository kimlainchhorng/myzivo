## Diagnosis

The voice note in your screenshot shows "Failed to send" immediately after recording. The cause is in the new XHR-based upload helper (`src/lib/voiceUpload.ts`) introduced in the previous turn:

1. **Missing `apikey` header** — Supabase Storage's REST endpoint requires *both* the user's `Authorization: Bearer <access_token>` *and* the project `apikey` header. We only send the Bearer token, so the gateway rejects the request before it reaches the bucket policies.
2. **Wrong HTTP verb** — we send `POST` with `x-upsert: true`. `POST` on Storage REST always *creates* and returns 409 if the key exists. The correct verb for upsert is `PUT`. Even though duplicate paths are rare here (the path includes `Date.now()` + a random `client_send_id`), the `apikey` issue alone is enough to fail every request.

The retry logic correctly retries the failure 3 times, then surfaces the error — exactly what the screenshot shows.

## Fix

Update `src/lib/voiceUpload.ts`:

1. Read `VITE_SUPABASE_PUBLISHABLE_KEY` at module load.
2. Switch the request from `POST` → `PUT` (so `x-upsert: true` works as intended).
3. Add the required `apikey: <anon key>` header alongside the existing `Authorization` header.

Tiny diff, single file, no DB changes, no UI changes. Once the request includes both headers, the upload will succeed, the optimistic bubble will swap to the server URL, and the realtime echo will dedupe normally.

## Verification after the fix

After deploying, recording a voice note should:
- Show the bubble instantly with the progress strip filling 0 → 100%.
- Flip to the normal "sent" state (speed pill replaces the spinner).
- Network tab should show a `PUT https://<project>.supabase.co/storage/v1/object/chat-media-files/...` returning `200`.

If a failure still happens after this fix, the bubble's Info button copies the exact error reason to the clipboard so we can pinpoint a deeper cause (RLS on the bucket, content-length, etc.).

## Files

- `src/lib/voiceUpload.ts` — change `POST` to `PUT`, add `apikey` header, read anon key from env.
