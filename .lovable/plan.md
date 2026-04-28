## Telegram-style gaps to close next

The Contacts + Chat hub already has folders, secret chats, voice/video, gifts, channels, polls, scheduled messages, broadcasts, blocked users, and contact requests. Comparing screen-by-screen against Telegram, here is what's still missing or thin:

### 1. Global hub search ("Telegram global search")
Today `ChatSearchAllPage` and `ChatSearch` exist but are not wired into the chat header search bar as a full-screen overlay. Telegram's search bar returns four sections at once: **Chats · Contacts · Channels · Messages**. Add a single `GlobalChatSearch` overlay opened from the Chat header search input that runs four parallel queries and renders sectioned results with deep-links.

### 2. Verified / Premium / online dot on every avatar
The existing `profiles.is_verified`, ZIVO+, and `last_seen` columns are not consistently shown. Add a tiny `<UserBadge>` wrapper used across:
- Contacts list rows
- Suggested cards
- Chat list rows
- Conversation header
Renders: blue check (verified), emerald star (ZIVO+), green online dot (last_seen < 60s).

### 3. "Saved Messages" + Cloud drafts
- **Saved Messages** chat already shows in screenshot — confirm it routes to `recipientId = self`. If not, wire the row to open self-DM and label it "Saved Messages" with bookmark icon.
- **Cloud drafts**: persist composer text per-thread to Supabase `chat_drafts(user_id, thread_id, body, updated_at)` so a half-typed message follows the user across devices. Show an italic "Draft: …" preview in the chat list row.

### 4. Mute / Pin / Archive on chat rows
Telegram's swipe row actions. We have `SwipeableRow` and `ChatRowActionsSheet` — extend with three persistent flags on a new `chat_thread_settings(user_id, thread_id, muted_until, pinned_at, archived_at)` table. Chat list orders: pinned first, then unmuted recent, archived hidden behind an "Archived" pill.

### 5. Read-receipts privacy + Last-seen scope
The Privacy & Notifications screen (image-371) shows the toggles but they don't yet write anywhere. Wire the four selects (Last seen / Who can call / Who can message / Read receipts) to columns on `profiles` (or a `privacy_settings` table) and enforce them server-side via RLS on `direct_messages` insert and `last_seen` exposure RPC.

### 6. Chat folders are listed but empty (image-373)
`CustomFoldersPage` exists but has no "Suggested folders" generator. Add an empty-state with three one-tap presets: **Unread · Personal · Groups · Channels** that create folders pre-populated with a filter rule.

### 7. New-channel page polish (image-374)
- Validate handle uniqueness against `usernames` live (debounced 300ms).
- Add **Cover image** uploader (channel-media bucket) — currently text-only.
- Add `description` 255-char counter.
- After create, redirect to the channel and copy invite link to clipboard.

### 8. QR add-by-scan (paired with /qr-profile)
Contacts header has a QR button that opens `/qr-profile` (your own code). Add a **Scan** tab on that page using the existing camera barcode reader to read someone else's ZIVO QR and open the ConfirmAddContactSheet directly.

### 9. Contact import via vCard / .vcf paste
Add a third tab to `FindContactsPage`: **Paste vCard** — accepts pasted .vcf text, extracts `TEL:` lines, hashes them, and feeds the existing `contact-match` edge function. Useful when native picker is not available (web users on iOS Safari).

### 10. Notifications: per-chat overrides
We have global notification settings only. Add a `chat_thread_settings.notification_mode` enum (`all | mentions | none`) and a "Mute notifications" sheet on the chat header (1h · 8h · 1d · forever).

### 11. Forward & Quote from any message (Telegram's killer feature)
`ForwardPickerSheet` exists. Verify it:
- Multi-selects up to 100 messages (currently single).
- Preserves attribution ("Forwarded from @user").
- Optional "Hide sender name" toggle.

### 12. Bot-style mini-apps entry
`ChatMiniApps.tsx` exists. Add a **Discover** tile in the chat header overflow menu pointing to a directory of available mini-apps (rides, eats, wallet, flight) so non-power-users find them.

---

## Priority order for this loop (pick 3–4)

Suggest tackling in this order — they touch the most visible gaps in the screenshots:

1. **Global hub search overlay** (#1)
2. **Mute / Pin / Archive chat rows + cloud drafts preview** (#3 + #4 together)
3. **Privacy & Notifications wiring** (#5) — toggles that don't save are confusing
4. **Suggested folders** (#6) — fixes the empty Chat Folders page in image-373

Items 7–12 are smaller polish and can be batched into a follow-up loop.

## Technical details

**New tables (one migration):**
```sql
-- 1. Chat thread per-user settings
create table public.chat_thread_settings (
  user_id uuid not null,
  thread_id text not null,                 -- "dm:<otherId>" | "group:<gid>" | "channel:<cid>"
  muted_until timestamptz,
  notification_mode text not null default 'all' check (notification_mode in ('all','mentions','none')),
  pinned_at timestamptz,
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, thread_id)
);
alter table public.chat_thread_settings enable row level security;
create policy "owner manages thread settings"
  on public.chat_thread_settings for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_chat_thread_settings_user on public.chat_thread_settings(user_id, pinned_at desc nulls last);

-- 2. Cloud drafts
create table public.chat_drafts (
  user_id uuid not null,
  thread_id text not null,
  body text not null default '',
  reply_to text,
  updated_at timestamptz not null default now(),
  primary key (user_id, thread_id)
);
alter table public.chat_drafts enable row level security;
create policy "owner manages drafts"
  on public.chat_drafts for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Privacy settings (or extend profiles)
create table public.user_privacy (
  user_id uuid primary key,
  last_seen_scope text not null default 'everyone' check (last_seen_scope in ('everyone','contacts','nobody')),
  call_scope text not null default 'everyone' check (call_scope in ('everyone','contacts','nobody')),
  message_scope text not null default 'everyone' check (message_scope in ('everyone','contacts','nobody')),
  read_receipts boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.user_privacy enable row level security;
create policy "owner manages privacy" on public.user_privacy for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "anyone reads privacy scope" on public.user_privacy for select to authenticated using (true);
```

**Files to add:**
- `src/components/chat/GlobalChatSearch.tsx` — full-screen overlay with 4 result sections.
- `src/components/chat/UserBadge.tsx` — verified/premium/online dot helper.
- `src/hooks/useThreadSettings.ts` — read/write `chat_thread_settings`.
- `src/hooks/useChatDraft.ts` — debounced upsert to `chat_drafts`, returns body for composer.
- `src/hooks/useUserPrivacy.ts` — read/write `user_privacy`, call from PrivacyNotificationsPage.

**Files to edit:**
- Chat list rows → add pin/mute icons, draft preview.
- `ChatRowActionsSheet` → Pin / Mute / Archive actions.
- Conversation composer → `useChatDraft` integration.
- Chat header → "Mute notifications" sheet.
- `PrivacyNotificationsPage` → wire selects to `useUserPrivacy`.
- `CustomFoldersPage` → empty-state preset folders.

**Out of scope** for now: bot framework, encrypted backups, Stories cross-posting, paid reactions.
