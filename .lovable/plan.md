## Facebook-style inline stats row under the name

Match the Kim Thai reference exactly: under the bold name + blue check, show one tight inline row — `7K followers · 550 following · 370 posts` — replacing the current bulky 3-column "Friends / Followers / Following" grid. Cleaner, denser, more "real Facebook".

### Visual outcome

**Before (current)**
```text
ZIVO Platform ✓
[ Add bio ]
   0          0          0
Friends   Followers   Following
```

**After (Facebook-style)**
```text
ZIVO Platform ✓
0 followers  ·  0 following  ·  0 posts        ← compact inline row
[ Add bio ]
```

### Design details

- **One line, single row** — `text-sm`, `font-semibold` for the count, `font-medium text-muted-foreground` for the label.
- **Bullet separators** (`·`) between stats with `gap-1.5`, identical to Facebook.
- **Tap targets**: each stat is a `<button>` with `min-h-[36px]` and `focus-visible` ring — opens the same Followers/Following/Posts modal as today.
- **Smart number formatting**: reuse existing `formatCount` (`src/lib/social/formatCount.ts`) so 7000 → `7K`, 1500000 → `1.5M`. (Already used in Reels — keeps the platform consistent.)
- **Order matches Facebook**: followers → following → posts.
- **Posts count** comes from `post_count` already loaded in the profile query (or fallback to `userPostsCount` hook used by the feed grid).

### Files to change

**1. `src/pages/Profile.tsx`** (the big chunky grid lives at lines 730–746)
- Delete the 3-column `Friends / Followers / Following` button grid.
- Replace with a single `<div className="flex items-center gap-1.5 text-sm">` row containing 3 inline buttons + bullet separators.
- Friends count moves OUT of this row (Facebook doesn't show it here) — it stays accessible via the existing "Friends" tab/section lower on the page; no functional loss.
- Wire each button to the existing `setSocialModal({ open: true, tab: ... })` handler — zero new logic.
- Use `formatCount()` for all three numbers.

**2. `src/pages/PublicProfilePage.tsx`**
- Apply the identical inline row directly under the name + badge `<h2>` (around line 853), so other people's profiles match.
- Same modal handlers it already uses.

### What stays the same

- Bio editor, "Get blue verified" pill, social-links row, Friends section lower down, all modals — untouched.
- Verified badge SVG, sizing (28px inline next to name), tooltip — untouched.
- All data fetching — we already have `followerCount`, `followingCount`, `friendCount`, and post count in scope; only the rendering changes.
- No DB migration, no new component file, no new hook.

### Why this is the right call

The current grid eats ~80px of vertical space and visually competes with the name. Facebook collapses it to one ~20px line so the name + badge are the unmistakable focal point. Same data, much higher signal-to-noise.
