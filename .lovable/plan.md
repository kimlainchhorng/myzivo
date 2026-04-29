# Fix: Voice notes failing with HTTP 429 after 100% upload

## What's actually happening

From the session replay, the bytes upload to Supabase Storage successfully (progress reaches 100%), then the storage server returns:

```
HTTP 429: Too many connections issued to the database
```

This is Supabase Storage's REST endpoint failing internally when it tries to validate RLS / write the object metadata to Postgres. It's a **transient pool-pressure error**, not a real permission problem.

The current retry helper marks 429 as retriable, but:
- Backoff starts at only 600ms × 2.2 → far too short for the DB pool to recover.
- We don't honor the server's `Retry-After` header.
- The "Voice note failed" toast fires immediately on the first 429, even though the message is still fully retriable.

## Fix

### 1. `src/lib/voiceUpload.ts`
- Parse the `Retry-After` response header on upload failures and attach it to `UploadHttpError` as `retryAfterMs`.
- In `retryWithBackoff`, when the error is a 429: wait for `max(retryAfterMs, 1.5s × 2^attempt)` instead of the generic backoff. Yields ~1.5s → 3s → 6s.

### 2. `src/components/chat/PersonalChat.tsx` and `src/components/chat/GroupChat.tsx`
- Bump voice-upload retry from `attempts: 3` to `attempts: 4` so we get one extra attempt past the 6s wait.
- In the catch block, **don't** flip the bubble to `failed` when the error is a retriable 429 that exhausted attempts — instead show "Reconnecting…" status and auto-retry once more after 8 seconds in the background. Only mark `failed` (with the Resend button) after that final attempt also fails.

### 3. Toast copy
- Change the failure toast from "Voice note failed to send" to "Server is busy — tap Resend" specifically for 429 errors so the user understands it's transient.

## Files touched
- `src/lib/voiceUpload.ts` — retry-after parsing + 429-aware backoff
- `src/components/chat/PersonalChat.tsx` — bump attempts, smarter catch
- `src/components/chat/GroupChat.tsx` — same treatment

No DB or edge function changes. No new dependencies.
