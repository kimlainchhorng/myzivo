# Phase 5 — The "Telegram-class" Chat Upgrade

You want all four tracks. I'll ship them in this order so each builds on the last and nothing breaks mid-flight. Each track ends in a self-contained, testable feature.

---

## Track A — Encrypted Media in Secret Chats

Extend the E2E pipeline (already live for text) to photos, videos, voice notes, and files.

### What you'll see
- In any Secret Chat, the composer's **+** button now offers Photo, Video, Voice Note, File.
- Sender side: file is encrypted in the browser before upload. ZIVO servers see only ciphertext.
- Recipient side: blob is downloaded, decrypted in-memory, rendered (image/video/audio player or download link).
- Same disappearing-timer applies — both DB row and storage object are pruned on expiry.
- Lock-icon overlay on every encrypted media bubble.

### Technical
- New storage bucket `secret-media` (private, RLS: only chat participants can read/write their own paths `chat_id/message_id.bin`).
- Extend `secret_messages` with `media_type`, `storage_path`, `media_iv`, `media_key_wrapped`, `mime`, `size`, `thumb_iv`, `thumb_path`.
- Per-message random AES-GCM 256 key encrypts the blob; that key is itself encrypted with the existing ECDH-derived chat key and stored in `media_key_wrapped`.
- New helpers in `src/lib/secretChat/crypto.ts`: `encryptBlob`, `decryptBlob`, `wrapKey`, `unwrapKey`.
- `useSecretChat.ts` gains `sendMedia()` and lazy-decrypt on render.
- Cron edge function `secret-media-prune` (runs every 5 min) deletes expired storage objects.

---

## Track B — Calls Upgrade (Group Video, Screen Share, Reactions, Recording)

Lifts the existing 4-person WebRTC mesh into a proper 8-person experience with pro features.

### What you'll see
- Group video grid auto-tiles 1 → 2 → 4 → 6 → 8 participants (FaceTime-style).
- **Share Screen** button (desktop + Android Chrome). Shared screen becomes the spotlight tile.
- **In-call reactions** — tap an emoji, it floats up over your tile for everyone.
- **Raise hand**, mute-all (host), kick participant (host).
- **Record call** (host only, opt-in, all participants see a red REC dot). Recording is uploaded to private bucket `call-recordings`, available in Account → Call History.
- Adaptive bitrate: drops video quality automatically on poor networks.

### Technical
- Switch from full-mesh to **mesh up to 4 / SFU above 4**. Use [LiveKit Cloud](https://livekit.io) as the SFU (free tier covers ZIVO's expected load; later self-hostable). Add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` secrets; edge function `livekit-token` issues short-lived JWTs.
- New tables: `call_sessions` (room metadata), `call_participants` (join/leave log), `call_recordings` (storage path + duration).
- New components: `GroupCallGrid`, `ScreenShareTile`, `CallReactionsOverlay`, `CallControlsBar` (refactored).
- Recording uses LiveKit's egress API → mp4 → uploaded to `call-recordings` bucket.
- Reactions: ephemeral, sent over LiveKit data channel — no DB write.

---

## Track C — Channels & Broadcast

Telegram-style one-to-many: creator posts, subscribers read.

### What you'll see
- New tab in Chat Hub: **Channels** (next to Chats / Groups).
- **Create Channel** flow: name, handle (`@zivo-news`), avatar, description, public/private.
- Channel page: posts feed (text, media, polls, links), subscriber count, view counts per post, reaction bar.
- **Schedule Post**: pick future date/time, post auto-publishes.
- Notifications: subscribers get a push for each new post (respecting per-channel mute setting).
- Public channels are shareable via `hizivo.com/c/<handle>` (deep-link opens app).

### Technical
- Tables: `channels`, `channel_subscribers`, `channel_posts` (with `scheduled_for`, `published_at`, `view_count`), `channel_post_reactions`, `channel_post_views` (one row per (post,user)).
- RLS: public channels readable by all; private gated by `channel_subscribers`. Only owner/admins can post.
- Edge function `publish-scheduled-posts` runs every minute via pg_cron, flips `published_at` for due rows, fans out push notifications.
- Pages: `/channels`, `/channel/:handle`, `/channel/:handle/manage`, `/channel/new`.
- Reuses `RichComposer`, `MediaPanel`, and `PollComposer` already built in Phase 3.

---

## Track D — Chat Polish & Power-User Features

The "feels like a real messenger" pass.

### What you'll see
- **Edit message** (within 24h, shows "edited" tag). Long-press / hover → Edit.
- **Schedule send** in any chat (regular + group, not secret in v1).
- **Pin messages** (up to 3 per chat, shown in a sticky banner below the header).
- **Search messages** — global search bar in Chat Hub with full-text search across all your chats; jump-to-message on tap.
- **Chat folders**: user-defined folders (Work, Family, Unread, Custom…) with chip selector above the chat list. Smart folders (Unread, Archived) built-in.
- **Per-chat custom notifications**: choose tone, vibration pattern, mute duration, mention-only mode.

### Technical
- `direct_messages` + `group_messages` get `edited_at`, `original_text` (audit), `scheduled_for`, `pinned_at`.
- New tables: `chat_pins`, `chat_folders`, `chat_folder_members`, `chat_notification_prefs`.
- Postgres `tsvector` column + GIN index on messages for full-text search; helper RPC `search_my_messages(q text)` filters by RLS-visible rows only.
- Edge function `release-scheduled-messages` (pg_cron, every 30s) inserts due messages.
- New components: `EditMessageSheet`, `ScheduleSendSheet`, `PinnedBanner`, `ChatSearchSheet`, `FolderTabs`, `ChatNotificationSheet`.

---

## Build Order & Checkpoints

```text
A. Encrypted Media          → ship + smoke-test in Secret Chat
B. Group Calls Upgrade      → ship + 3-device test (need LIVEKIT_* secrets first)
C. Channels & Broadcast     → ship + create demo @zivo-news channel
D. Chat Polish              → ship + verify search/edit/schedule/folders
```

After each track I'll pause for you to test before starting the next.

## What I need from you up front
- For Track B: confirm you're OK using **LiveKit Cloud** as the SFU (free tier, swap-able later). If yes, I'll prompt for the three `LIVEKIT_*` secrets when we get there.
- Everything else uses infrastructure already in place (Supabase + existing storage + WebCrypto).

Approve and I'll start with **Track A: Encrypted Media in Secret Chats**.