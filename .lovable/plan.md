# Telegram-Grade Chat Upgrade — Master Plan

Goal: Bring ZIVO Chat to feature parity with Telegram, fully usable **without a phone number** (username + QR + invite links), with strong privacy, scale (channels/supergroups), and rich messaging.

---

## 1. What you already have (keep & extend)
ChatHubPage, PersonalChat, GroupChat, CreateGroupModal, ChatContactInfo, ChatStories, ChatFolders, ChatSearch, ChatSecurity, ChatPersonalization, ChatBackupExport, MessageScheduler, MessageReactionPicker, PinnedMessagesPanel, VoiceMessagePlayer, StickerKeyboard, CallScreen/GroupCallScreen, IncomingCallListener, ChatNotificationToast, disappearing_message_settings, message_reactions, message_replies, pinned_messages, scheduled_messages, chat_polls, chat_folders, chat_themes, chat_wallpapers, contact_sync, chat_groups/members/messages.

Gaps vs Telegram → addressed below.

---

## 2. New / upgraded features

### A. Identity without a phone
- **@username** as primary identity (unique, case-insensitive, 5–32 chars, reserved-name list).
- Find people by: @username, QR code (scan/share), invite link (`hizivo.com/u/<username>`), nearby (optional, opt-in), shared groups.
- Phone optional; if added, it's hidden by default (privacy: Nobody / Contacts / Everyone).

### B. Contacts (no phone required)
- **Add contact** by username, QR, or invite link — no phone needed.
- Custom display name (rename contacts locally, like Telegram).
- Mutual contact detection, "Saved Contacts", block list, recent contacts.
- Optional phone-based discovery kept as opt-in (existing `contact_sync`).

### C. Chats (Personal)
- Reply / quote, forward (with "forwarded from"), edit (15-min window like TG, configurable), delete for me / for everyone.
- Reactions (multi-emoji, animated), message threads (comments).
- Voice + video messages (round bubble), voice-to-text transcription (AI gateway).
- Self-destruct timer (1s/5s/1m/1h/1d/1w), screenshot detection notice.
- Drafts auto-save per chat, pin chats (top 5), archive, unread badge, mark unread.
- Typing/recording/online/last-seen indicators with privacy controls.
- Read receipts toggle, "Sent/Delivered/Read" ticks.
- Translate message (per-message, per-chat auto-translate via AI gateway).
- Schedule message, silent send, send-without-sound.
- Saved Messages (chat with yourself, cloud notes).

### D. Groups → Supergroups
- Up to **200,000 members** (supergroup), admin roles + granular permissions (post, edit, delete, ban, pin, invite, manage video chats).
- Topics (forum mode) within a group.
- Slow mode, anti-spam, captcha on join, join-by-request approval queue.
- Public group: `@handle` + invite link with revoke/expiry/usage limit.
- Member search, recent actions log (admin audit).

### E. Channels (one-to-many broadcast)
- Public/private channels, subscribers (no chat back), discussion-group linking, view counts, reactions, comments via linked group.
- Admin signatures, scheduled posts, post stats.

### F. Secret / Secret-grade chats
- End-to-end client-side encryption (libsodium / X25519 + XChaCha20-Poly1305).
- Per-device keys, no server plaintext, "burn after read", screenshot alert, no forward.
- (Server stores ciphertext only; keys in `localStorage` + Capacitor Secure Storage.)

### G. Media & files
- Up to 2 GB files, image/video compression toggle, original quality option.
- Albums (up to 10), GIFs, animated stickers/emojis (Lottie), sticker pack discovery, custom packs.
- Voice waveforms, transcription, video notes (round), live photo support.
- Media gallery per chat (already partially built — extend with timeline + filter by type).

### H. Calls
- 1:1 voice/video (you have it) + group video up to 30 (extend GroupCallScreen).
- Noise suppression, screen share, raise hand, recording (group admin only), call reactions overlay.

### I. Bots & mini-apps (future-friendly)
- Bot accounts (`username` ending in `_bot`), inline queries (`@bot query`), commands, keyboards, web app (mini-app) launcher (you already have ChatMiniApps).
- Bot permissions managed in user_roles.

### J. Cloud features
- Login on multiple devices (sessions list, revoke device), cloud sync of all chats, cloud drafts.
- Backup export (you have ChatBackupExport — extend to include media manifest + encrypted ZIP).

### K. Notifications & privacy
- Per-chat: mute (1h/8h/2d/forever), custom sound, exception list, smart notifications.
- Privacy matrix (Last Seen, Profile Photo, Bio, Phone, Forwards, Calls, Groups & Channels invites): Everyone / My Contacts / Nobody + exceptions.
- Two-step verification (password) for account, login alerts, active sessions screen, auto-logout inactive (1d/7d/30d/never), passcode lock with biometrics.

### L. Folders & organization
- Custom chat folders (extend `chat_folders`): include/exclude rules (unread, contacts, non-contacts, groups, channels, bots, muted), shareable folder links.

---

## 3. Database changes

New tables (all with RLS, owner-scoped policies, `has_role` security-definer for admin checks):

```
usernames                  username PK, user_id FK, reserved bool, created_at
user_contacts              owner_id, contact_user_id, custom_name, favorite, blocked, added_via, created_at  (PK owner+contact)
user_blocks                user_id, blocked_user_id  (PK)
user_privacy_settings      user_id PK, last_seen, profile_photo, bio, phone, forwards, calls, invites jsonb (rule + exceptions)
user_sessions              id, user_id, device_name, platform, ip, last_active, created_at, revoked_at
two_step_auth              user_id PK, password_hash, hint, recovery_email, created_at
channels                   id, owner_id, username, title, description, photo, is_public, linked_discussion_group_id, subscriber_count
channel_subscribers        channel_id, user_id, joined_at, role  (PK)
channel_posts              id, channel_id, author_id, content, media jsonb, views, scheduled_for, sent_at
group_topics               id, group_id, title, icon, created_by, is_closed
group_invites              id, group_or_channel_id, kind ('group'|'channel'), code, created_by, expires_at, max_uses, uses, revoked
group_join_requests        id, target_id, user_id, status, requested_at
group_admin_log            id, group_id, actor_id, action, target_id, payload jsonb, created_at
group_permissions          group_id PK, can_send_messages, can_send_media, can_send_polls, can_invite, can_pin, can_change_info, slow_mode_seconds
member_permissions         group_id, user_id, overrides jsonb, muted_until  (PK group+user)
secret_chats               id, user_a, user_b, key_fingerprint, created_at, ttl_seconds
secret_messages            id, secret_chat_id, sender_id, ciphertext, nonce, created_at, expires_at
message_views              message_id, viewer_id, viewed_at  (PK)
message_edits              message_id, edited_at, prev_text   (history)
chat_pins (per user)       user_id, chat_id, position
chat_archive               user_id, chat_id, archived_at
saved_messages             user_id PK reference (self-chat sentinel)
sticker_packs              id, owner_id, title, slug, is_animated, is_public
stickers                   id, pack_id, emoji, file_url, is_animated, order
custom_emoji               id, owner_id, name, file_url
bots                       id, owner_id, username FK, description, commands jsonb, inline_enabled, webhook_url
qr_login_tokens            token PK, user_id, created_at, consumed_at, expires_at
```

Extend `chat_messages`:
- `reply_to_id`, `forward_from_user_id`, `forward_from_chat_id`, `edited_at`, `is_silent`, `view_count`, `topic_id`, `self_destruct_at`, `media` jsonb (album), `caption`, `entities` jsonb (mentions/links/bold/etc.).

Extend `profiles`:
- `username` (unique, citext), `username_history` (jsonb), `last_username_change_at`, `passcode_hash`, `auto_logout_minutes`.

All new tables: RLS enabled. Roles in `user_roles` table (already in stack); never store admin flags on profiles.

---

## 4. Edge functions (Supabase)

- `username-claim` — validate, reserve, transactional update.
- `qr-login` — issue/verify short-lived tokens for "log in by QR" from another device.
- `secret-chat-handshake` — relay X25519 public keys (no plaintext on server).
- `send-broadcast` — channel post fan-out + view counter.
- `translate-message` — AI gateway (Lovable AI).
- `transcribe-voice` — AI gateway speech-to-text.
- `moderate-content` — auto-spam/flood checks (slow mode, captcha, NSFW).
- `invite-link` — create/revoke/redeem.
- `revoke-session` — kill device tokens.

---

## 5. Frontend work (where it lands)

```
src/pages/chat/
  ChatHubPage.tsx                (extend tabs: Personal / Groups / Channels / Bots)
  ContactsPage.tsx               (new — add by @username, QR scan, invite link, sync)
  ChannelPage.tsx                (new)
  ChannelCreatePage.tsx          (new)
  SecretChatPage.tsx             (new)
  SettingsPrivacyPage.tsx        (new)
  SettingsDevicesPage.tsx        (new)
  SettingsTwoStepPage.tsx        (new)
src/components/chat/
  AddContactSheet.tsx            (username / QR / link)
  QrIdentityCard.tsx
  UsernameClaimSheet.tsx
  ForwardSheet.tsx
  EditMessageSheet.tsx
  ReactionsBar.tsx               (multi reactions, animated)
  TopicsList.tsx
  AdminPanel.tsx                 (permissions, slow mode, recent actions)
  InviteLinkManager.tsx
  JoinRequestsQueue.tsx
  PrivacyMatrix.tsx
  SecretChatBubble.tsx
  TranscribeButton.tsx
  TranslateMenu.tsx
  ChannelComposer.tsx
src/lib/chat/
  e2ee.ts                        (libsodium wrapper)
  username.ts
  invites.ts
src/hooks/
  useUsername.ts
  useContacts.ts
  useChannel.ts
  useSecretChat.ts
  usePrivacy.ts
  useSessions.ts
```

---

## 6. Phased rollout (5 phases — each shippable)

**Phase 1 — Identity & Contacts (no phone)**
Username system, QR identity, invite links, AddContactSheet, ContactsPage, custom contact names, block list. DB: `usernames`, `user_contacts`, `user_blocks`, profiles.username column. Edge: `username-claim`, `qr-login`. UI: username claim flow on first chat open.

**Phase 2 — Privacy, Sessions, 2-Step**
Privacy matrix UI + table, sessions list + revoke, two-step password, passcode lock + biometrics, login alerts. Edge: `revoke-session`.

**Phase 3 — Messaging power-ups**
Forward, edit window, multi-reactions, view counts, message_edits history, silent send, translate, voice transcription, self-destruct, schedule (already exists — wire in), drafts. Extend `chat_messages`. Edge: `translate-message`, `transcribe-voice`.

**Phase 4 — Supergroups, Channels, Topics, Bots**
Channels + subscribers + ChannelPage, supergroup admin permissions, topics, invite links with limits, join requests, admin log, slow mode, captcha. Bot accounts + inline commands. Edge: `send-broadcast`, `invite-link`, `moderate-content`.

**Phase 5 — Secret chats + Stickers/Emoji + Group calls 30p**
E2EE secret chats (libsodium), screenshot alerts, sticker packs, custom emoji, animated reactions, group video up to 30, screen share, raise hand. Edge: `secret-chat-handshake`.

---

## 7. Security & abuse protection (cross-cutting)

- Roles in `user_roles` + `has_role()` security-definer (per project rule). Never on profiles.
- RLS on every new table (owner-scoped + admin override via `has_role`).
- Rate limits per edge function (insert into `rate_limit_events`, deny over thresholds): username claim, invite redeem, message send, channel post, contact add.
- Spam/flood: slow mode per group, global per-user message-per-minute cap, link/CAPTCHA on first message in a public group.
- Block list enforced server-side via RLS predicate (`NOT EXISTS user_blocks`).
- Secret chats: ciphertext only, server cannot decrypt; keys in Capacitor Secure Storage.
- Login: device fingerprint + `user_sessions` + login-alert push.
- 2FA password gate for: change username, add device, delete account, view sessions.
- Content moderation hooks: NSFW image classifier (AI gateway) for public channels, profanity filter optional per group.
- Audit log: `group_admin_log` for every admin action (kick, ban, permission change).
- All deletes are soft-delete (`deleted_at`) for 30-day recovery and abuse review.

---

## 8. Data flow (text diagram)

```text
User A ──send──▶ chat_messages (RLS: must be member)
                      │
                      ├─▶ Realtime channel  ──▶ User B device(s)
                      ├─▶ chat_reads (delivered/read ticks)
                      ├─▶ message_views (channels)
                      └─▶ push (existing send-push-notification)

Secret chat:
  A ─pubkey─▶ secret-chat-handshake ─pubkey─▶ B
  A encrypts(text) ─▶ secret_messages (ciphertext only)
  B fetches ─▶ decrypts locally ─▶ TTL countdown ─▶ delete
```

---

## 9. Out of scope (call out separately)
- Telegram Premium-style paid tier (can wire into existing ZIVO+ later).
- Stories (already exist as ZIVO Stories — reuse, not rebuild).
- Crypto wallet/TON integration.

---

## 10. Acceptance criteria (per phase)
- P1: Can sign up, claim @username, add a friend by username/QR with **no phone**, start a 1:1 chat.
- P2: Can set Last Seen to "Nobody", revoke another device's session, set 2-step password.
- P3: Can forward, edit, react with 3 emojis, schedule, translate, transcribe a voice note, self-destruct in 5s.
- P4: Can create a public channel, broadcast to subscribers, link a discussion group, create topics, set slow mode 30s, approve join requests.
- P5: Can start a secret chat (E2EE), send custom sticker pack, host 10-person video call with screen share.

---

Approve and I'll start with **Phase 1 (Identity & Contacts without phone)** — it unblocks every other feature.
