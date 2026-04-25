# Finish blue-verified badge rollout

Wraps up the remaining surfaces and adds the safety net (realtime keys, loading state, e2e test) so the blue check is consistent everywhere and updates live.

## 1. DatingPage — replace custom star with real `VerifiedBadge`

`src/pages/DatingPage.tsx` already selects `is_verified` but renders a custom `Star` icon at line ~136.

- Import `VerifiedBadge` and `isBlueVerified`.
- Replace the custom `<div className="h-5 w-5 rounded-full bg-primary"><Star/></div>` block with:
  ```tsx
  {isBlueVerified(currentProfile.is_verified) && <VerifiedBadge size={16} interactive={false} />}
  ```
- Remove the now-unused `Star` import if not used elsewhere.

## 2. LiveStreamPage — gift-line chat rows + viewers list

`src/pages/LiveStreamPage.tsx`:

- **Gift chat rows**: Gift messages are pushed into the same `chatMessages` array (with `isGift: true`) at line ~283. The render path that shows `user_name` already uses `isBlueVerified(msg.user_is_verified)`, but the gift-insert path doesn't populate `user_is_verified`. Fix by resolving the sender's verified status from the existing `profileMap` (or a fresh `profiles.select('is_verified').eq('user_id', g.sender_id)` lookup) when building the gift chat row, and include `user_is_verified` in the inserted object.
- **Viewers list** (`viewerNames`, line ~105 / ~571): extend the type to `{ user_id; name; avatar; is_verified }`, include `is_verified` in the `profiles` select used to resolve viewer names (line ~154 area), and render the badge next to each viewer name in the list.

## 3. GoLivePage — chat + gift rows

`src/pages/GoLivePage.tsx`:

- Extend `ChatRow` (line 84) with `user_is_verified?: boolean`.
- In the `live_comments` INSERT handler (~line 384) and the `live_gift_displays` INSERT handler (~line 415), resolve the sender's `is_verified` via a small `profiles` lookup (cache via a `Map` ref to avoid repeated queries) and pass it through.
- In the chat render block (~line 969), wrap the `user_name` span in `inline-flex items-center gap-1` and render `<VerifiedBadge size={11} interactive={false} />` when verified. Apply to both regular and `isGift` rows.

## 4. Loading / null-safety for badge data

Avoid badge flicker when `is_verified` is momentarily `null`:

- `isBlueVerified()` already returns `false` for `null` / `undefined`, so flicker only happens if a row renders before `is_verified` arrives. In LiveStreamPage chat insert paths and GoLivePage, **don't insert the chat row until the profile lookup resolves** (await the small `profiles.select('is_verified')` query inline before `setChatMessages`). Falls back to `false` on error so the row still renders.
- In `PersonalChat.tsx` header, when `peerProfile` is still loading, render the name without the badge slot rather than reserving space — current code already handles this; just confirm the badge is only rendered when `peerProfile?.is_verified === true` (no skeleton needed since names render below anyway).

## 5. Realtime invalidation keys

`src/hooks/useVerificationRealtime.ts` — extend `KEYS_TO_INVALIDATE` with the keys touched by the new surfaces:

```ts
["chat-conversations"],
["personal-chat-peer"],
["social-notifications"],
["explore-users"],
["smart-search-users"],
["live-stream-host"],
["live-stream-viewers"],
["live-chat"],
["dating-profiles"],
["sound-posts"],
["leaderboard"],
["qr-profile"],
```

Audit the new query keys actually used in `ChatHubPage`, `PersonalChat`, `useSocialNotifications`, `ExplorePage`, `LiveStreamPage`, `DatingPage`, `QRProfilePage` and align the strings exactly. Where a page uses inline `useEffect` fetches (no react-query key), no change needed — realtime postgres subscription already runs in those components.

## 6. End-to-end verification test

Extend `src/test/verification-surfaces.test.tsx` (already exists) with one assertion per surface, mocking Supabase to return `is_verified: true` and asserting `data-testid="verified-badge"` is present:

- ChatHubPage — search result row
- PersonalChat — header peer name
- NotificationsPage — friend-request row
- ExplorePage — people search result
- QRProfilePage — share card name
- LiveStreamPage — chat message + host header + viewer row + gift row
- DatingPage — current profile card

Each test renders the component with a mocked Supabase client returning a verified profile and asserts at least one `getByTestId('verified-badge')` resolves.

## Files to edit

- `src/pages/DatingPage.tsx`
- `src/pages/LiveStreamPage.tsx`
- `src/pages/GoLivePage.tsx`
- `src/hooks/useVerificationRealtime.ts`
- `src/test/verification-surfaces.test.tsx`

## Out of scope

- No DB migrations (`is_verified` columns already exist).
- No new design tokens — using existing `VerifiedBadge`.
- Admin verification UI unchanged.
