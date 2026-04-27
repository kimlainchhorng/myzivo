I found why it still feels slow: the voice bubble appears locally, but the real send still waits for storage upload first. If the upload takes 1–3 seconds, the message may look faded/temporary and the receiver cannot get it until after upload finishes.

Plan:

1. Make the sender UI feel immediate
- Keep the local playable voice bubble appearing instantly on release.
- Add a subtle sending/check state instead of fading the whole bubble, so it does not look broken or slow.
- Do not replace the playable local URL with the remote URL until the remote audio is ready, preventing visual flicker.

2. Reduce voice upload latency
- Upload voice recordings with `upsert: true` and the actual recorder MIME type instead of hardcoded `audio/webm`.
- Remove the extra `.select().single()` round trip after inserting the voice message; use fire-and-forget insert like text messages already do.
- Let Supabase realtime replace/confirm the optimistic bubble when the real row arrives.

3. Make receiver delivery faster and clearer
- Insert the DB message immediately after upload returns, then send push notification in the background.
- Avoid blocking the UI on push notification or confirmation queries.
- Keep failed uploads visible briefly with an error state instead of disappearing instantly, so the user sees what happened.

4. Fix the recording release delay
- `HoldToRecordMic` currently waits for `voice.stopRecording()` before returning from release. I’ll make it end the gesture/reset UI immediately, then let the hook finish producing the blob asynchronously.
- This should remove the “I released but it waits” feeling.

5. Apply consistently
- Update both `PersonalChat.tsx` and `GroupChat.tsx` voice flows.
- Keep `VoiceMessagePlayer.tsx` duration behavior intact.
- Run a build/type check after changes.

Technical details:
```text
Current flow:
release -> stop recorder -> create local bubble -> upload file -> insert message -> select row -> replace bubble

Improved flow:
release -> reset recorder UI immediately -> create local bubble -> upload file -> insert message without select -> realtime confirms
```

This focuses on perceived speed first, then removes avoidable network waits.