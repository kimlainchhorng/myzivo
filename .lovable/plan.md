I re-checked the voice-message path end-to-end as far as read-only mode allows.

Findings:
- Supabase storage is reachable and the `chat-media-files` bucket exists.
- Storage policies allow authenticated users to upload into their own user-id folder and delete their own uploads.
- Recent database data shows voice files successfully uploaded into `chat-media-files` and matching `direct_messages` voice rows were inserted, so the storage + direct-message insert path has worked at least recently.
- The current preview session is not logged in, so I cannot perform a live voice-send test from the UI in this mode.
- I found a few remaining issues that can make the feature look broken or hide the real reason:
  - Failed-bubble debug text still labels the request as `PUT` even though uploads now use `POST`.
  - The debug toggle can be enabled, but the failed bubble may not re-render immediately, so the details may not appear until another UI update.
  - The failure phase/body are captured in parts of the upload layer but are not fully surfaced in the chat bubble state.
  - The diagnostics depend on `import.meta.env` even though the Supabase client already has the correct hardcoded connected-project values, so the missing-key warning can be more fragile than necessary.

Plan to make sure all works:

1. Finalize voice upload diagnostics
- Update the debug UI to display the real method: `POST`, not `PUT`.
- Add explicit failed phase labels: `preflight`, `upload`, or `insert`.
- Surface the raw server response body when debug mode is on, so RLS/storage errors are visible under the failed bubble.
- Make debug mode reactive so long-pressing the failed label immediately shows/hides details.

2. Make Supabase key/config checks robust
- Change `src/lib/voiceUpload.ts` to use the same exported `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as the main Supabase client, instead of relying only on `import.meta.env`.
- Keep the runtime anon-key warning, but make it validate the actual key the upload request uses.

3. Harden the resend flow
- Preserve the original audio blob for failed sends.
- If storage upload succeeded but DB insert failed, resend should skip re-upload and retry only the insert.
- If the user discards a failed bubble after successful upload, cleanup should delete the orphaned storage object.
- Ensure retry resets progress/debug state and reuses the same `client_send_id` so the optimistic bubble gets replaced correctly by realtime.

4. Verify direct and group chat paths
- Check both `PersonalChat.tsx` and `GroupChat.tsx` receive and render the same diagnostic fields.
- Confirm both paths use the same bucket, method, preflight, retry, discard, and debug behavior.
- Fix any type gaps so `file_payload.client_send_id`, duration, endpoint, status code, phase, and response body are consistently available.

5. Run verification after changes
- Run a production build/type check to catch TypeScript or Vite issues.
- Re-check Supabase policies for `chat-media-files`, `direct_messages`, and `group_messages`.
- Use the preview in a logged-in state if available to send a short voice note, then confirm:
  - preflight request completes,
  - upload request uses `POST`,
  - message row is inserted,
  - failed bubbles show exact URL/status/phase/body when debug is on,
  - Resend works without re-recording.

If approved, I’ll apply these final fixes and run the verification pass.

<lov-actions>
<lov-link url="https://supabase.com/dashboard/project/slirphzzwcogdbkeicff/storage/buckets">Supabase Storage</lov-link>
<lov-open-history>View History</lov-open-history>
<lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>