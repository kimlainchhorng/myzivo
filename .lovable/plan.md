# Phase 5 — Track C UI: Channels & Broadcast

Most call-side items in this request are already implemented from the previous round and only need the route the user asked for to be reachable at the path they wrote. The real new build is the Channels UI, which has had its schema, RLS, triggers, and scheduled-publish edge function in place since the prior loop.

## Already shipped (this loop just verifies/exposes)
- Always-visible emoji strip → `CallReactionStrip` mounted in `GroupCallScreenV2`, fans out via existing data channel + `CallReactionsOverlay`.
- Real-time REC privacy indicator → high-contrast pill in top bar + per-tile pulsing red dot in `VideoTile`, driven by `call.isRecording`.
- Pre-join recording summary → `CallLobby` shows bucket status (`Bucket ready` / `Checking…` / `Unavailable`) via `useRecordingPreflight`, plus a `REC ON/OFF` chip; switch auto-disables when bucket is unavailable.
- Auto-start cloud recording → `useLiveKitCall({ autoRecord })` triggers `livekit-recording` start right after `room.connect()`.
- Lobby + screen share + recording reachable via `GroupCallEntryPage` mounting `GroupCallLauncher`.

### Tiny route fix (1 edit)
The user asked for `/chat/group-call/:roomName`. Current route is `/chat/call/group/:roomName`. **Add the new path as an alias** so both resolve to `GroupCallEntryPage`. Keep the old one to avoid breaking anything already linked.

## New build — Channels UI (the focus of this round)

Backend is already live (tables, RLS, triggers, view-count RPC, `channel-publish-scheduled` cron job). Adds 4 pages + supporting hook and shared components.

### Pages
| Path | Purpose |
|---|---|
| `/channels` | Directory: search by handle/name, list public channels, "Create" button, "My subscriptions" tab. |
| `/channels/new` | Composer: name, handle (live availability check), description, public/private, avatar/banner upload. |
| `/c/:handle` | Channel page: banner, header (name/handle/sub count), Subscribe/Unsubscribe, posts feed with view counts + reaction bar, owner-only "Compose" + "Manage" buttons. |
| `/c/:handle/manage` | Owner dashboard: edit channel details, member list with role chips (owner/admin/sub), promote/demote/remove, scheduled-post queue, basic stats. |

### Shared components (under `src/components/channels/`)
- `ChannelHeader.tsx` — banner + avatar + name/handle + sub count + Subscribe button.
- `ChannelPostCard.tsx` — body, media gallery, view count, reactions bar, posted/scheduled timestamp; calls `record_channel_post_view` RPC on first viewport entry.
- `ChannelPostComposer.tsx` — text + media drop + "Schedule for later" date/time picker; writes to `channel_posts` (with `published_at = now()` for immediate, or `scheduled_for = <future>` for scheduled).
- `ChannelMemberRow.tsx` — used in `/c/:handle/manage`, shows display name, role chip, action menu.
- `SubscribeButton.tsx` — toggles `channel_subscribers` row for the current user.

### Hook
- `useChannel(handleOrId)` — loads channel + subscriber state + posts (paginated via `published_at desc`), exposes mutations for subscribe/unsubscribe/post/react.

### Realtime
Subscribe to:
- `channel_posts` (filter by `channel_id`) → live feed updates when scheduled posts publish.
- `channel_post_reactions` (filter by `post_id` for visible posts) → live reaction counts.

### Storage
Posts can include media. Reuse the existing `user-posts` bucket (already configured for 500MB uploads) — no new bucket needed for v1. Avatar/banner images go to `user-posts/channels/<channel_id>/...`.

### Acceptance
- Visit `/channels` → see public channels, search filter works.
- `/channels/new` → handle availability checked live; submit creates channel and redirects to `/c/<handle>`.
- `/c/<handle>` → public visitors can browse; subscribers see posts in real time; reactions update live for everyone.
- Schedule a post 2 min in future → it shows in the manage queue, then appears in the feed (via realtime + cron) without refresh.
- View count on a post increments at most once per viewer per 24h.
- `/c/<handle>/manage` (owner only) → edit name/banner/description, promote a subscriber to admin, remove a subscriber, see scheduled queue.
- Visiting `/chat/group-call/<id>` works (alongside `/chat/call/group/<id>`).

### Files
**New**
- `src/pages/channels/ChannelsDirectoryPage.tsx`
- `src/pages/channels/NewChannelPage.tsx`
- `src/pages/channels/ChannelPage.tsx`
- `src/pages/channels/ManageChannelPage.tsx`
- `src/components/channels/ChannelHeader.tsx`
- `src/components/channels/ChannelPostCard.tsx`
- `src/components/channels/ChannelPostComposer.tsx`
- `src/components/channels/ChannelMemberRow.tsx`
- `src/components/channels/SubscribeButton.tsx`
- `src/hooks/useChannel.ts`

**Edited**
- `src/App.tsx` — add 4 channel routes + alias `/chat/group-call/:roomName`.

### Out of scope this round
- Push notifications for new posts (will plug into existing `device_tokens` infra in a follow-up).
- Channel-side analytics page beyond basic counts.
- Track D (chat polish: editing, scheduled send, pin, search, folders, custom notifs).
