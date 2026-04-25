## Goal

Make sure the blue verified badge renders **next to every name**, everywhere in the app — not just feed/profile. Audit every surface, fix the ones missing it, and keep using the single `VerifiedBadge` + `isBlueVerified()` helpers so nothing diverges.

## Audit results

**Already correct (no change):**
- Feed (`FeedPage`), Reels (`ReelsFeedPage`), Profile, PublicProfilePage
- Comments sheet, Suggested users, Follow suggestions, Create post modal
- Profile feed cards (just fixed)

**Missing the badge — to fix:**

| Surface | File |
|---|---|
| Chat list (conversations) | `src/pages/ChatHubPage.tsx` |
| Chat header + message bubbles | `src/components/chat/PersonalChat.tsx`, `src/components/chat/ChatMessageBubble.tsx` |
| Notifications (friend requests, social) | `src/pages/NotificationsPage.tsx`, `src/pages/NotificationCenterPage.tsx`, `src/pages/ActivityFeedPage.tsx` |
| Smart search results | `src/pages/SmartSearchPage.tsx` |
| Explore people search | `src/pages/ExplorePage.tsx` |
| Live stream chat / viewer / host | `src/pages/LiveStreamPage.tsx`, `src/pages/GoLivePage.tsx` |
| Sound page (post authors) | `src/pages/SoundPage.tsx` |
| QR profile share card | `src/pages/QRProfilePage.tsx` |
| Shared trip page (driver name) | `src/pages/public/SharedTripPage.tsx` |
| Leaderboard rows | `src/pages/LeaderboardPage.tsx` |
| Marketplace review author | `src/components/marketplace/MarketplaceReviewSheet.tsx` |
| Dating profile cards | `src/pages/DatingPage.tsx` |
| Communities member rows | `src/pages/CommunitiesPage.tsx` |

## Changes

For each file above:

1. **Query** — add `is_verified` to every `profiles` / `store_profiles` `.select(...)` that returns a name.
2. **Type** — extend the local row/state type with `is_verified?: boolean | null` (or `isVerified` for component props).
3. **Render** — wherever the name is displayed, render it as:
   ```tsx
   <span className="inline-flex items-center gap-1">
     <span className="truncate">{name}</span>
     {isBlueVerified(is_verified) && <VerifiedBadge size={14} interactive={false} />}
   </span>
   ```
   - `size={12}` in dense lists (chat list, comments-style rows, leaderboard)
   - `size={14}` in standard rows (notifications, search results, live chat)
   - `size={16}` in headers (chat header, story header, profile cards)
   - Use `interactive={false}` whenever the row is itself a button/link.

4. **Realtime** — `useVerificationRealtime` already invalidates `feed`, `public-profile`, `suggested-users`, etc. Add the new query keys we touch (`chat-conversations`, `notifications`, `smart-search`, `explore-users`, `live-viewers`, `live-chat`, `sound-posts`, `leaderboard`) to `KEYS_TO_INVALIDATE` in `src/hooks/useVerificationRealtime.ts` so the badge updates live everywhere.

## Out of scope

- No DB migrations needed — `profiles.is_verified` and `store_profiles.is_verified` already exist.
- No design-system changes — using the existing `VerifiedBadge` component.
- Admin pages are out of scope (they already manage verification via dedicated UI).

## Verification

- Manually open each surface above with a verified test account and confirm the blue check shows next to the name.
- Run existing `verification-surfaces.test.tsx`; extend it with one assertion per new surface (chat list row, notification row, search result, live chat row).
