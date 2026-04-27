## What you'll get

1. **Anon-key sanity warning** — surfaces in the failed-bubble debug area (and console) if `VITE_SUPABASE_PUBLISHABLE_KEY` is missing/empty at runtime.
2. **Endpoint visibility in debug mode** — failed bubbles show the exact `PUT https://…/storage/v1/object/<bucket>/<path>` URL plus the response status (e.g. `403`, `0`) directly under the bubble.
3. **Bucket preflight** — before each upload, a tiny `OPTIONS` probe to the storage object URL with the auth headers. If it comes back with an auth/permission status (`401`/`403`), we short-circuit with a friendly message ("Storage permissions are blocking this voice note. Check chat-media-files RLS.") instead of burning three retry attempts.
4. **One-click "Resend voice"** — failed bubbles already retry, but I'll harden the path so the retry button always reuses the cached `Blob` from `voiceJobsRef` and re-runs upload + insert (or insert-only if upload already succeeded). I'll also keep the failed job around even after the component re-mounts so the button never goes inert.

The "Resend voice" capability is *mostly* in place from the previous turn — this pass focuses on guaranteeing the cached blob survives, the button label is unambiguous ("Resend"), and a successful resend cleanly removes the failed state.

## Technical changes

**`src/lib/voiceUpload.ts`**
- Export a `getVoiceUploadDiagnostics()` helper returning `{ hasAnonKey, supabaseUrl }`.
- Add `preflightVoiceBucket({ bucket, path, signal })` — fires a single `OPTIONS` request with `Authorization` + `apikey`. Resolves with `{ ok, status, url }`. Never throws on network errors (returns `ok: false`).
- Extend `UploadHttpError` with optional `url` so the UI can render it.
- In `uploadVoiceWithProgress`, attach the `url` to thrown `UploadHttpError`s.

**`src/components/chat/PersonalChat.tsx` & `GroupChat.tsx`**
- In `runVoiceJob`, call `preflightVoiceBucket(...)` once per job (skipped if we already have a `publicUrl`). On `401`/`403`, mark the bubble failed with `"Storage blocked (HTTP <code>). Check bucket policies."` and skip retries.
- When catching a final failure, store `lastUrl` and `lastStatus` on the optimistic message's `_upload_*` fields so the UI can display them.
- Ensure the cached `Blob` in `voiceJobsRef` is preserved on failure (it already is — confirm + add a guard so unmount cleanup does *not* delete failed jobs that the user might still want to resend).

**`src/components/chat/VoiceMessagePlayer.tsx`**
- New optional props: `uploadEndpoint?: string`, `uploadStatusCode?: number`.
- Rename the retry button's aria-label / tooltip to "Resend voice".
- In the `debugOn` block, render two extra mono lines: the endpoint URL and `HTTP <status>`.
- If `getVoiceUploadDiagnostics().hasAnonKey === false`, prepend a red "Missing Supabase anon key — uploads will fail" line (always shown on failed bubbles, not gated on debug mode, since it's a config-level break).

No DB / storage / edge function changes — purely client-side diagnostics + a preflight HEAD-style check.

## Files

- `src/lib/voiceUpload.ts` — add diagnostics + preflight, attach URL to errors.
- `src/components/chat/VoiceMessagePlayer.tsx` — debug URL/status lines, anon-key warning, "Resend" labeling.
- `src/components/chat/PersonalChat.tsx` — preflight call, store endpoint/status on failure, preserve failed jobs.
- `src/components/chat/GroupChat.tsx` — same pipeline changes as PersonalChat.
