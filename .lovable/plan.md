# Phase 5 — Finish Track B polish, then start Track C

Track B (group calls upgrade) is largely built. This plan closes the last gap you flagged (pre-join recording toggle) and wires the new LiveKit screen into the live call entry, then moves on to Channels & Broadcast.

## Part 1 — Track B closeout (small, ~1 step)

### 1. Pre-join "Lobby" screen with recording toggle
New component: `src/components/chat/call/CallLobby.tsx`

Shown for ~3 seconds before joining any group call. Contains:
- Self-preview tile (camera + mic level meter)
- Mic / camera enable toggles (state pre-set before connect)
- **"Record this call" switch** (host only — enabled by default off)
- Participant count preview
- "Join call" / "Cancel" buttons

The recording flag is passed into `useLiveKitCall({ autoRecord: true })`. When the host connects and `autoRecord` is true, the hook calls the existing `livekit-recording` start endpoint immediately after `room.connect()` resolves.

### 2. Wire `GroupCallScreenV2` into the call entry point
- In the existing call launcher (where `GroupCallScreen` is mounted today), branch on participant count: ≤4 → mesh `GroupCallScreen`, >4 OR `forceSfu=true` → `CallLobby` → `GroupCallScreenV2`.
- Add a "Use HD group mode" option in the call-start sheet so users can opt in to LiveKit even at 2-4 people (better recording/screen-share quality).

### 3. Acceptance
- Starting a group call shows the lobby with a Record toggle.
- Toggling on + Join begins recording within 2s of connect; REC pill visible to all.
- Recording file lands in `call-recordings` bucket, only host can list/download.
- Screen share + reactions + 8-tile grid still work.

## Part 2 — Track C: Channels & Broadcast (the real next build)

Telegram-style one-to-many channels.

### Schema
```text
channels                 channel_posts                channel_subscribers
─────────                ─────────────                ───────────────────
id (uuid)                id                           channel_id
handle (citext, unique)  channel_id                   user_id
name                     author_id                    role  (owner|admin|sub)
description              body (text)                  notifications_on
avatar_url               media (jsonb)                joined_at
banner_url               scheduled_for (tstz, null)   PK (channel_id, user_id)
owner_id                 published_at (tstz, null)
is_public (bool)         view_count (int)             channel_post_reactions
subscriber_count (int)   reactions_count (jsonb)      ─────────────────────
created_at               created_at, updated_at       post_id, user_id, emoji
```

RLS:
- `channels` public-read when `is_public`, owner full-write.
- `channel_posts` readable by subscribers OR if channel is public; writable only by owner/admin.
- `channel_subscribers` user can insert/delete their own row; counts maintained by trigger.

### Edge functions / cron
- `channel-publish-scheduled` — invoked by `pg_cron` every minute; sets `published_at = now()` for due posts and increments fan-out counters.
- `channel-record-view` — RPC called when a subscriber opens a post; debounced server-side per (post, user) per 24h.

### UI surfaces
- `/channels` — directory + search by handle.
- `/c/:handle` — channel page (banner, posts feed, subscribe button, view counts).
- `/channels/new` — create flow (name, handle, avatar, public/private).
- `/c/:handle/manage` — owner dashboard: compose post, schedule, see analytics.
- Post composer reuses media uploader; supports "Schedule for later" date/time picker.
- Reactions row under each post (emoji bar) writes to `channel_post_reactions`.

### Acceptance
- Create channel → claim handle → publish post → subscriber sees it in feed instantly (realtime).
- Schedule a post 2 min in future → it appears at the right time without a refresh.
- View count increments once per user per 24h.
- Reactions update live across clients.

## Part 3 — Track D preview (after C ships)
Message editing (24h), scheduled send, pinned messages (max 3), full-text search (`tsvector` + GIN), chat folders, per-chat custom notification sound. Not built in this round.

## Order of execution this round
1. Build `CallLobby` + recording-toggle wiring.
2. Branch the call entry to use lobby + V2 for >4 / opt-in.
3. Channels migration (tables, RLS, triggers, cron).
4. Channels edge functions.
5. Channels UI (directory → channel page → composer → manage).

Stop after step 5 for review before Track D.
