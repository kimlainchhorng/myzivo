## Goal

Right now the polished blue verified badge only appears on `/more` (Account) and `/profile`. The screenshot of the Feed shows "ZIVO Platform" with no badge, and the same is true across reels, comments, suggestions, public profiles, and share UIs. This plan rolls the shared `VerifiedBadge` out to every author/name surface so verified accounts (users + ZIVO/store accounts) are clearly marked everywhere.

## What will change

### 1. Treat ZIVO/Store accounts as always verified
- In `ReelsFeedPage.tsx` and `FeedPage.tsx`, when a post's `source === "store"` (e.g. "ZIVO Platform"), render the badge unconditionally next to the store name.
- For `source === "user"` posts, fetch `is_verified` alongside `full_name, avatar_url` in the existing profile lookups (lines ~261, ~379–382, ~469 in ReelsFeedPage; lines ~730, ~1384, ~1428 in FeedPage) and add `author_is_verified?: boolean` to the post type. Render the badge when true.

### 2. Add the badge to every place an author name renders

**Feed (mobile card view — the screenshot)** — `src/pages/ReelsFeedPage.tsx`
- Author header in post card (~line 1029): `{author_name} <VerifiedBadge size={14} />`
- Shared-by line (~1588), original-sound line (~1617)
- Repost / shop sheet author rows (~2231, ~2427)
- Unfollow dialog text stays plain (no badge in dialog body)

**Reels overlay** — `src/pages/FeedPage.tsx`
- Author name in the floating overlay (~line 551): badge next to `author_name` / `store_name`
- "ZIVO" branded sound-author label kept as-is

**Comments** — `src/components/social/CommentsSheet.tsx`
- Fetch `is_verified` with the comment author, render badge after each commenter's name and after the post-author header.

**Suggestions** — `src/components/social/SuggestedUsersCarousel.tsx`
- Replace the existing `Shield` icon (lines 102, 170) with `VerifiedBadge` at `size={12}` / `size={14}`.

**Public profile** — `src/pages/PublicProfilePage.tsx`
- Replace the inline custom SVG at line 842–846 with `<VerifiedBadge />` (kept on the avatar corner) AND add a small inline badge after the display name on line 853 so it shows in the name row too.

**Other author surfaces** (light pass, badge after the name where `is_verified` is available):
- `src/components/social/FollowSuggestions.tsx`
- `src/components/social/CreatePostModal.tsx` (people search results)
- `src/pages/SmartSearchPage.tsx` people results
- `src/components/home/NavBar.tsx` desktop search-people dropdown
- Tip/share sheets that show the recipient name (`TipSheet`, share author label)

### 3. Shared component tweak
- `VerifiedBadge.tsx`: replace the `Math.random()`-based `uid` with `React.useId()` so SSR/hydration is stable and multiple badges in a list don't collide.
- Add an `inline` default sizing (1em) so it scales with the surrounding text when `size`/`className` aren't passed — makes it trivial to drop next to any name: `Name <VerifiedBadge />`.

### 4. Data plumbing
- One small helper `getProfileVerifiedMap(userIds[]): Record<string, boolean>` in `src/lib/` (or inline in the existing profile fetches) so feed/reels/comments don't each re-write the same `select("is_verified")` logic.
- Store/platform accounts: treat `source === "store"` as verified by convention (no DB column needed). If later we want a real flag, a `store_profiles.is_verified` column can be added — out of scope for this pass.

## Technical notes

- No schema changes required for users — `profiles.is_verified` already exists and is already selected in several places (FeedPage line 1230, SuggestedUsersCarousel line 32).
- Badge sizing convention going forward:
  - Inline next to a name in body text: `size={14}`
  - Inline next to a name in headers / card titles: `size={16}`
  - On avatar corner (profile page): `size={20}`
  - Account status tiles: `size={20}` (already in MorePage)
- All instances import the single `src/components/VerifiedBadge.tsx` — no more inline SVGs.

## Files to edit

- `src/components/VerifiedBadge.tsx` (stable id, default inline sizing)
- `src/pages/ReelsFeedPage.tsx`
- `src/pages/FeedPage.tsx`
- `src/components/social/CommentsSheet.tsx`
- `src/components/social/SuggestedUsersCarousel.tsx`
- `src/components/social/FollowSuggestions.tsx`
- `src/components/social/CreatePostModal.tsx`
- `src/pages/PublicProfilePage.tsx`
- `src/pages/SmartSearchPage.tsx`
- `src/components/home/NavBar.tsx`
- `src/components/social/TipSheet.tsx` (recipient label)

## Out of scope

- Adding admin tooling to grant/revoke verification (separate request).
- Visual redesign of the badge itself — already approved in the previous round.
