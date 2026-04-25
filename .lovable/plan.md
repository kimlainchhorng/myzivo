# Facebook-Style Verified Badge & Name

Match the look from your reference (Kim Thai profile): clean avatar, bold name, single blue check inline next to the name.

## What changes

### 1. Remove the badge from the avatar
Today the blue check sits on the avatar bottom-left AND next to the name — two badges feels noisy and amateur. Facebook only shows it **once**, right after the name. We'll remove the avatar overlay on:
- `src/pages/Profile.tsx` (your own profile)
- `src/pages/PublicProfilePage.tsx` (other people's profiles)

The avatar keeps only the green camera button (your profile) or nothing (public profiles). Cleaner, more "Facebook".

### 2. Re-style the badge to Facebook flat blue
Update `src/components/VerifiedBadge.tsx`:
- Solid Facebook blue `#1877F2` (no gradient, no cyan).
- Flat — remove the drop-shadow filter and the white outline stroke.
- Slightly thicker, crisper white checkmark so it stays sharp at 16px.
- Keep tooltip + ARIA + `interactive` prop unchanged.

### 3. Bigger, bolder name + inline badge
On `Profile.tsx` and `PublicProfilePage.tsx`:
- Name: `text-2xl font-bold` (was `text-lg`) — matches Facebook's display name weight.
- Badge: `size={22}` inline, vertically centered with the name baseline, `gap-1.5` between them.
- Tight letter-spacing (`tracking-tight`) for that polished Facebook feel.

### 4. Standardize sizes everywhere else (no duplicates, consistent scale)

| Surface | Size | Notes |
|---|---|---|
| Profile / PublicProfile name | 22px | Inline after bold name |
| Feed & Reels author row | 16px | Inline after author name |
| Comments, mentions, suggested users | 14px | Compact |
| Avatars (anywhere) | — | **Removed** — name-only convention |

## Visual outcome

```text
   ┌──────────┐
   │  AVATAR  │📷       ZIVO Platform ✓
   │          │
   └──────────┘         Add bio
```

Bold name, Facebook-blue check tucked right next to it, clean avatar with just the camera button. Matches your reference exactly.

## Files to edit

- `src/components/VerifiedBadge.tsx` — flat Facebook-blue SVG.
- `src/pages/Profile.tsx` — remove avatar badge, enlarge name, inline 22px badge.
- `src/pages/PublicProfilePage.tsx` — same name + badge treatment, remove avatar overlay.
- `src/pages/FeedPage.tsx`, `src/pages/ReelsFeedPage.tsx` — set badge `size={16}`.
- `src/components/social/CommentsSheet.tsx`, `SuggestedUsersCarousel.tsx`, `FollowSuggestions.tsx`, `CreatePostModal.tsx` — set `size={14}`.

## What stays the same

- All verification logic (`isBlueVerified`, RPC, realtime sync) — untouched.
- Admin verification controls — untouched.
- Tooltip text and ARIA labels — unchanged.
- Existing tests — will still pass; may update one snapshot for the new flat SVG.
