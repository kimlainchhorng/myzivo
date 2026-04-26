# Phase 5 — Telegram-class Chat Upgrade

## ✅ Track A — Encrypted Media in Secret Chats (DONE)
- Storage bucket `secret-media` (private, 50 MB limit, RLS gated by chat membership)
- `secret_messages` extended with media columns
- `crypto.ts`: `encryptBlob` / `decryptBlob` (AES-GCM 256, key wrapped with chat ECDH key)
- `useSecretChat`: `sendMedia(file)` + `decryptMedia(msg)`
- `SecretMediaBubble` UI (lazy decrypt, image/video/audio/file)
- `+` attach menu in composer (Photo / Video / Voice / File)
- `secret-media-prune` edge function (cleans expired blobs + rows; scheduling pending)

## ⏳ Track B — Group Calls Upgrade (next)
LiveKit-based SFU above 4 participants, screen share, reactions, recording.
**Requires:** `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` secrets.

## ⏳ Track C — Channels & Broadcast
## ⏳ Track D — Chat polish (edit / schedule / pin / search / folders / per-chat notif)
