# Story Workflow Audit — what's solid, what's missing

## ✅ What already works (verified end-to-end)

**Create flow** (`CreateStorySheet.tsx`)
- Photo / Video / Camera / Text-on-gradient (3-stop premium canvas)
- Music track picker, real upload progress (XHR), retry, quit-confirm
- Uploads to `user-stories` bucket → inserts into `stories` → invalidates all caches

**Viewer** (`StoryViewer.tsx`)
- Fullscreen portal, swipe-down close, tap zones, hold-to-pause, keyboard nav
- Auto-progress (5s images, video-driven)
- ZIVO Aurora progress bars + glass header capsule
- Owner: insights pill + emerald "Boost story" hero + More dot (✅ no longer IG-style)
- Non-owner: like/comment/share stack, 6-emoji reactor row, reply input
- Real persistence: `story_views`, `story_comments`, `story_reactions`
- Owner More sheet: Save / Share link / Delete (with storage sweep)
- Forward sheet, deep-linking, analytics close-meta

**Entry tiles** — Profile, Feed, Chat all use shared `StoryViewer` ✅

---

## ❌ What's still missing (the gaps that make it feel incomplete)

### 1. Owner can't see WHO reacted (only viewers)
Today the viewers sheet shows views, but story_reactions are invisible to the owner. Add a **"Reactions" tab** to the viewers sheet showing emoji + reactor name + when. This is what makes stories feel alive on real platforms.

### 2. No DM replies — text replies vanish into `story_comments`
When a non-owner types a reply, it goes into `story_comments` (visible only inside viewer). Real story replies should land as a **chat message** in the owner's inbox with a story-thumbnail attachment ("replied to your story"). Wire reply input → `messages` table with `story_reply_id` reference.

### 3. No mute/hide-from-feed for individual users
Long-press on a friend's ring should offer **"Mute [name]'s stories"** (hides them from your ring without unfollowing). Persist in a new `story_mutes` table; filter in `useQuery` for ring carousels.

### 4. No "Close Friends" / audience selector on create
ZIVO has follow/friendship system but stories are public to everyone. Add an **audience picker** at publish time: Public / Friends only / Close Friends (custom list). Add `audience` enum + `close_friends` table; enforce in RLS.

### 5. No Highlights (saved past stories)
Stories expire at 24h. Real differentiation = **Highlights** — owner can pin expired stories to a profile section ("Travel", "Food"). New `story_highlights` table, profile-page row of highlight covers, viewer reuses StoryViewer.

### 6. No screenshot / download notification to owner
For private stories (Friends/Close Friends), owner should be **notified when someone screenshots or downloads**. Hook into the More-sheet "Save to device" path → insert a `story_alerts` row → push notification to owner.

---

## 🛠️ Technical changes (per gap)

| # | DB / API | Component touch | Effort |
|---|---|---|---|
| 1 | Read existing `story_reactions` | `StoryViewer` viewers sheet → tabs | S |
| 2 | New: link in `messages` (`story_reply_id` uuid nullable, RLS) | `StoryViewer` reply input handler | M |
| 3 | New table `story_mutes(user_id, muted_user_id)` + RLS | `ProfileStories` + `FeedStoryRing` long-press menu, query filter | M |
| 4 | New: `stories.audience` enum, `close_friends(user_id, friend_user_id)`, update RLS on `stories` | `CreateStorySheet` audience step before publish | M |
| 5 | New table `story_highlights(id, user_id, title, cover_url, story_ids[])` + RLS | New `ProfileHighlights.tsx` row on `/profile`; reuse `StoryViewer` | L |
| 6 | New table `story_alerts(story_id, actor_id, type)` + push trigger | Hook into More-sheet save + add browser screenshot listener (best-effort) | M |

All new tables follow ZIVO RLS pattern: owner-write, owner-read for alerts/views; participants-only for reply messages. No client-side role checks.

---

## 📋 Recommended build order

1. **Reactions tab in viewers sheet** (quick win, uses existing data)
2. **DM-style replies** (kills the orphan story_comments confusion)
3. **Audience selector + Close Friends** (privacy = trust)
4. **Mute friend's stories** (table-stakes feedback control)
5. **Highlights row on profile** (the big differentiator)
6. **Screenshot/download alerts** (premium polish)

Each step is independently shippable. Approve and I'll start with #1, then continue down the list — or pick a subset (e.g. "just 1, 2, 5") and I'll scope to that.