# Phase 5 — Confirmed Order & Acceptance Criteria

## Status

| Track | Scope | Status |
|---|---|---|
| **A** | Encrypted media in Secret Chats | ✅ Shipped |
| **B** | Group calls upgrade (SFU, screen-share, reactions, recording) | ⏭ Next |
| **C** | Channels & Broadcast | Queued |
| **D** | Chat polish (edit / schedule / pin / search / folders / per-chat notif) | Queued |

I'll ship B → C → D in that order, pausing after each so you can test before the next starts.

---

## ✅ Track A — Encrypted Media (already done — for the record)

**Acceptance**
- ✅ In a Secret Chat, **+** menu offers Photo / Video / Voice / File.
- ✅ Up to 50 MB per file. Encrypted client-side (AES-GCM 256, per-message random key wrapped with chat ECDH key).
- ✅ Storage bucket `secret-media` is private; only the two participants can read/write the chat's folder.
- ✅ Bubbles lazy-decrypt on view (image/video inline player, voice player, file download).
- ✅ Disappearing-message TTL applies to media; expired blobs are deleted by `secret-media-prune` edge function.
- ✅ Server only ever sees ciphertext — verifiable by inspecting any `secret_messages` row.

---

## ⏭ Track B — Group Calls Upgrade

**What you'll see**
- Group video grid auto-tiles **1 → 2 → 4 → 6 → 8** participants (FaceTime layout).
- **Share Screen** button (desktop + Android Chrome). Shared screen becomes the spotlight tile.
- **In-call reactions** — tap an emoji → it floats over your tile for everyone for ~3 s.
- **Raise hand**, **mute-all** (host only), **kick participant** (host only).
- **Record call** (host opt-in) — all participants see a red **REC** dot. Recording lands in Account → Call History (`call-recordings` bucket, host-only access).
- Adaptive bitrate — drops video quality on poor networks instead of dropping the call.

**Technical**
- Mesh up to 4 participants (existing). Switch to **LiveKit Cloud SFU** for 5–8.
- Edge function `livekit-token` issues short-lived JWTs (room name + participant identity).
- New tables: `call_sessions`, `call_participants`, `call_recordings`.
- New components: `GroupCallGrid`, `ScreenShareTile`, `CallReactionsOverlay`, refactored `CallControlsBar`.
- Recording uses LiveKit's egress API → mp4 → uploaded to private `call-recordings` bucket.
- Reactions sent over LiveKit data channel — no DB writes.

**Acceptance**
- 5+ users can join the same call; grid responds correctly to joins/leaves.
- Screen share appears as a dedicated tile and can be stopped by the sharer.
- Reactions appear on every participant's screen with no DB row created.
- Host can start/stop recording; recording appears in Call History within 60 s of stop.
- 4-person calls still use the existing mesh (no LiveKit cost for small calls).

**Requires from you**
- Three Lovable Cloud secrets: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (free tier at livekit.io covers expected load).

---

## Track C — Channels & Broadcast

**What you'll see**
- New **Channels** tab in the Chat Hub (next to Chats / Groups).
- **Create Channel** flow: name, handle (`@zivo-news`), avatar, description, public/private toggle.
- Channel page: post feed (text, media, polls, links), subscriber count, view counts per post, reaction bar.
- **Schedule Post** — pick future date/time; auto-publishes via cron.
- Subscribers get a push notification per new post (respecting per-channel mute).
- Public channels shareable at `hizivo.com/c/<handle>` (deep-link opens app).

**Technical**
- Tables: `channels`, `channel_subscribers`, `channel_posts` (with `scheduled_for`, `published_at`, `view_count`), `channel_post_reactions`, `channel_post_views` (one row per (post, user)).
- RLS: public channels readable by all; private gated by `channel_subscribers`. Only owner/admins can post.
- Edge function `publish-scheduled-posts` runs every minute via pg_cron — flips `published_at` for due rows, fans out push notifications.
- Pages: `/channels`, `/channel/:handle`, `/channel/:handle/manage`, `/channel/new`.
- Reuses existing `RichComposer`, `MediaPanel`, and `PollComposer` from Phase 3.

**Acceptance**
- Creating a channel with a unique handle works; duplicate handles are rejected with a clear error.
- Subscribing/unsubscribing updates count in realtime.
- Scheduled post stays hidden from subscribers until `scheduled_for`, then appears + sends push.
- View count increments at most once per (post, user) pair.

---

## Track D — Chat Polish & Power-User Features

**What you'll see**
- **Edit message** within 24 h (shows "edited" tag). Long-press / hover → Edit. Applies to direct + group chats (not Secret Chats — would break ratchet).
- **Schedule send** in any non-secret chat.
- **Pin messages** — up to 3 per chat, sticky banner below the header, tap to jump.
- **Search messages** — global search bar in Chat Hub; full-text across all RLS-visible messages; jump-to-message on tap.
- **Chat folders** — user-defined (Work, Family, Custom…) with chip selector above the chat list. Smart folders: Unread, Archived, Mentions.
- **Per-chat custom notifications** — choose tone, vibration pattern, mute duration, mention-only mode.

**Technical**
- `direct_messages` + `group_messages` get `edited_at`, `original_text` (audit), `scheduled_for`, `pinned_at`.
- New tables: `chat_pins`, `chat_folders`, `chat_folder_members`, `chat_notification_prefs`.
- Postgres `tsvector` column + GIN index on messages; RPC `search_my_messages(q text)` filters by RLS-visible rows only.
- Edge function `release-scheduled-messages` (pg_cron, every 30 s) inserts due messages.
- New components: `EditMessageSheet`, `ScheduleSendSheet`, `PinnedBanner`, `ChatSearchSheet`, `FolderTabs`, `ChatNotificationSheet`.

**Acceptance**
- Edited messages show the "edited" tag and original text is preserved server-side for audit.
- Scheduled message appears in recipient's chat at the scheduled minute (±30 s).
- Pinning a 4th message displaces the oldest pin and shows a confirmation toast.
- Searching "invoice" returns only messages the user can actually read (RLS-respecting).
- A user-created folder persists across sessions and devices.

---

## Build order recap

```text
B. Group Calls (LiveKit SFU)          → smoke-test in 5-person call
C. Channels & Broadcast               → demo @zivo-news channel
D. Chat polish                        → smoke-test edit/schedule/search/folders
```

**One blocker before Track B:** I need the LiveKit secrets. Approve this plan and I'll request them as the first step of Track B.