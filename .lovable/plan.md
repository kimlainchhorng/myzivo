# Fix "User" + blank avatars on Feed

## Root cause confirmed

The previous fix added `display_name` to the profiles query in `FeedPage.tsx`:

```ts
.select("id, user_id, full_name, display_name, avatar_url, is_verified")
```

But `profiles.display_name` **does not exist** in the database. The columns available for naming are `full_name` and `username` (verified via `information_schema`).

Result: the entire profile fetch errors out silently, `profileMap` is empty, and every user post falls back to `author_name = "User"` and `author_avatar = null` — exactly what the screenshot shows.

The same bad column is also referenced in the mapping line:

```ts
author_name: profile?.display_name || profile?.full_name || "User",
```

## Fixes

### 1. Repair the profiles query (primary fix)

In `src/pages/FeedPage.tsx` (`useQuery(["customer-feed"])`):

- Replace `display_name` with `username` in the `.select(...)`.
- Update the mapping fallback to: `profile?.full_name || profile?.username || "User"`.

This restores names AND avatars for every user post in the feed (photo and video).

### 2. Apply the same fix to the sound-overlay query

Lines ~1054–1068 also use `profiles(display_name)` for `user_posts`. Switch to `profiles(full_name, username)` and update the fallback.

### 3. Other issues visible in the screenshot (smaller polish)

- **Duplicate "Search people…" bar**: there's one in the global header and another at the top of the feed body. Hide the in-feed one on desktop (lg+) since the header search already covers it.
- **Feed not centered**: on desktop the post column is pushed to the right. Add `mx-auto` / proper grid sizing to the feed container so it sits centered between the sidebar and the right edge.
- **"Starting live preview…" toast**: this is a Lovable preview environment toast, not part of the app. No action needed.

## Files to change

- `src/pages/FeedPage.tsx` — fix profiles select + mapping in 2 places, center feed column, hide duplicate search bar on desktop.

## Verification

After the fix, query `profiles` with the actual user_ids from `user_posts` to confirm rows return, then reload `/feed` — names and avatars should populate. No DB migration needed.
