I found the main likely cause of what you’re seeing: voice messages are added as an optimistic local bubble first, then the Supabase realtime INSERT can add/replace another voice row. The current replacement logic matches only by sender/message/type, which is too loose for multiple short voice messages and can leave duplicates or replace the wrong bubble. Also, voice sending still waits for upload before the real database message exists.

Plan to fix it:

1. Add stable client-side send IDs
- Generate a unique `client_send_id` for every outgoing chat message, especially voice.
- Store it in the message payload/metadata so realtime can identify the exact optimistic bubble.
- Use this ID to replace the local bubble instead of adding a second one.

2. Make voice send feel instant
- On mic release, create the outgoing voice bubble immediately in the chat UI.
- Show one bubble only, with a small spinner/check state while it uploads.
- Finalize the MediaRecorder blob and upload in the background.
- When upload succeeds, update that same bubble with the remote URL and confirmed database row.

3. Fix duplicate prevention for fast repeated voice notes
- Track voice sends in a pending map instead of one `voiceUploadInFlightRef` boolean.
- Allow back-to-back voice messages without blocking or mixing them.
- Dedupe realtime INSERT events by `client_send_id`, local temp ID, and recent timestamp fallback.

4. Speed up server/database delivery path
- Insert a lightweight database row as early as possible with status like `uploading` and the client send ID, then update it after upload if the schema supports it.
- If the current schema does not support message status/client IDs, add the needed nullable columns with a migration:
  - `direct_messages.client_send_id`
  - `group_messages.client_send_id`
  - optional upload/send status field for UI state
- Add indexes on `(sender_id, client_send_id)` / `(group_id, sender_id, client_send_id)` for fast realtime replacement.

5. Apply the same fix to group chat
- Update `GroupChat.tsx` voice send logic with the same exact-client-ID dedupe.
- Keep image/media optimistic behavior but make realtime replacement more reliable.

6. Clean up UI states
- Remove the heavy opacity effect that makes messages look slow or faded.
- Keep a small sending indicator only on pending messages.
- Make timestamps/status update smoothly without creating another bubble.

Files to update after approval:
- `src/hooks/useVoiceRecorder.ts`
- `src/components/chat/HoldToRecordMic.tsx`
- `src/components/chat/PersonalChat.tsx`
- `src/components/chat/GroupChat.tsx`
- Possibly a Supabase migration for `direct_messages` and `group_messages` client-send IDs/status columns.

Expected result:
- You record one voice note and see exactly one voice bubble.
- No second duplicate bubble appears after realtime/server confirmation.
- Voice, image, and text sends feel faster because the UI updates instantly and server work happens in the background.