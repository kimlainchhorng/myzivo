## Sync `/more` and `/profile` so the name and stats match

### Problem

- **`/more` header** shows the username `klainkonkat` with stats `Posts / Followers / Views`.
- **`/profile` header** shows the display name `ZIVO Platform ✓` with stats `Friends / Followers / Following`.

Two issues: (a) different name source, (b) different stat labels and values. The user wants both pages to show the same identity and the same stat trio.

### Fix — edit `src/pages/MorePage.tsx` only

1. **Display name**: use the same fallback chain as `/profile`:
   `profile.display_name → profile.username → email prefix → "User"`.
   This makes the bold name on `/more` match `/profile` (e.g. "ZIVO Platform" instead of the handle).

2. **Verified badge**: replace the small `BadgeCheck` icon with the same blue Twitter-style verified SVG used in `/profile` (`BlueVerifiedBadge`), so the checkmark looks identical on both pages.

3. **Stat trio**: replace `Posts / Followers / Views` with `Friends / Followers / Following`, querying the exact same tables `/profile` uses:
   - **Friends** → `friendships` where `status='accepted'` and (`user_id=me` OR `friend_id=me`)
   - **Followers** → `followers` where `following_id=me` (already correct)
   - **Following** → `followers` where `follower_id=me` (new query)

   Drop the now-unused `post count` query and `profile_views` field from the profile select.

4. **Keep `@username` line** under the display name (it already renders when present) — that preserves the handle without making it the primary label.

### Out of scope

- `/profile` page — already shows the correct identity and stats; no changes there.
- Layout, quick-action tiles, spotlight cards, sectioned link list — all stay exactly as they are in your screenshot.

### Result

Both pages will read **"ZIVO Platform" + blue ✓** with the trio **Friends · Followers · Following** showing the same numbers, sourced from the same tables. Tapping the card on `/more` still navigates to `/profile`.
