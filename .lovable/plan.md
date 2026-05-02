## Problem

In both Feed (`/feed`) and Reel (`/reels`), only posts from one store ("Mommy Seafood") show up. Posts from other people are missing.

## Root cause

The Feed and Reel pages query the `user_posts` table and select a `location` column. That column does not exist in the database. Supabase returns a 400 error, so the entire `user_posts` fetch fails and only `store_posts` render.

Verified directly:
- `SELECT location FROM user_posts` → `ERROR: column "location" does not exist`
- DB has 17 published `user_posts` from 10 different authors that should be showing.
- The Create Post modal also writes `location` and `visibility` to `user_posts`, both of which are missing — so any post created with a location or non-default visibility silently loses that data (or fails when the column is required).

Affected reads:
- `src/pages/ReelsFeedPage.tsx` line ~516 (selects `location`)
- `src/pages/FeedPage.tsx` lines ~482 and ~3482 (select `location`)
Affected write:
- `src/components/social/CreatePostModal.tsx` line ~331 (writes `location`), and `visibility` is always written.

## Fix

Add the missing columns to `user_posts` so the existing read/write code works as designed.

```text
ALTER TABLE public.user_posts
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';
```

That's the only change needed. No frontend changes required — once the columns exist, the user_posts query stops 400-ing and posts from all 10 authors (xixi24362, rarest_fact, MD Movie, AB Complete Car Care, ZIVO Platform, Nerissa, secon_de_gold, vivienne, Shiela Vidal, carajasan.rej) will show up alongside the store posts in both Feed and Reel.

## Verification after fix

1. Reload `/feed` — list shows posts from many authors, not just Mommy Seafood.
2. Reload `/reels` — vertical scroller shows multiple authors.
3. Create a new post with a location pin — location persists.
