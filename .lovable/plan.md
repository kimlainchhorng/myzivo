# Account flow polish — round 3

After live-testing `/profile` → kebab → `/more` → sub-pages, here are the remaining issues and proposed fixes.

## Issues observed

### A) `/more` page (the one the new kebab opens)
1. **No top header / back button**. The page begins right at the profile card directly under the iOS status bar, so the user has no clear way back to `/profile` other than the bottom-nav Account tab — that feels disconnected since they explicitly came from a kebab tap.
2. **No status-bar safe area on the title row** — the green text ("Essentials" header etc.) sits perilously close to the iOS clock.
3. **"Switch Account" links to `/auth`** — sending a logged-in user to the login page is wrong UX. Should open a proper switcher (or at minimum sign out then go to /auth).
4. **"Lock app" + "Sign out" duplication** — both buttons currently call `signOut()` (lock just calls signOut + navigate). Either implement a real lock screen or remove "Lock app" until it does something distinct.

### B) `/profile` page
5. **"What's on your mind?" composer + tabs are stacked very tightly** — only ~6 px vertical breathing room between them; the tabs row visually merges with the composer card.
6. **Profile card has no quick "Edit profile" CTA** on mobile. Currently the user has to open `/more` → scroll to "My Profile" → which… loops them back to `/profile`. The "Edit" affordance only exists inside `/more`'s profile card, not on the profile page itself. Add a compact "Edit profile" button next to the bio area.
7. **"Add bio" / counts row alignment** — the counts row has good spacing now, but the "Add bio" pill sits awkwardly far from the verified badge and from the counts. Tighten gap.

### C) Cross-cutting
8. **`/more` ↔ `/profile` round-trip** — kebab on profile opens /more, but tapping "My Profile" from /more sends you back to /profile with no visual transition difference. Add a consistent back button on /more so the trip feels intentional.

## Proposed fixes

1. **Add a sticky header to `/more`** (mirroring the `/profile` sticky header):
   - Back button → `navigate(-1)` (falls back to `/profile` if no history).
   - Title: "More".
   - Right side: search icon (placeholder – non-functional for now is OK) **or** none; pick none to keep minimal.
   - Use `var(--zivo-safe-top-sticky)` for padding and `bg-background/85 backdrop-blur-xl border-b border-border/40`.
   - Remove the bottom "Close" link (line 535–540 in `MorePage.tsx`) since the back button replaces it.

2. **Fix "Switch Account" target** in `MorePage.tsx`:
   - Change href from `/auth` to a sign-out-then-redirect handler: when tapped, call `signOut()` and `navigate("/auth?intent=switch")`. Visually keep the same row.

3. **Remove or repurpose "Lock app"** — for now, remove it (it's a duplicate of Sign out). Keep one clear "Sign out" button.

4. **Tighten `/profile` spacing**:
   - Add `mt-3` between the composer (`What's on your mind?`) and the tabs (currently they sit too close).
   - Tighten the gap between "Add bio" pill and the counts row from current default to a single `gap-y-1.5`.

5. **Add inline "Edit profile" button on `/profile` mobile**:
   - Small pill button beside "Add bio" or below counts that links to `/account/profile-edit`.
   - Style: outline/ghost, rounded-full, `Pencil` icon + "Edit profile" label.

## Files to edit
- `src/pages/MorePage.tsx` — add sticky header w/ back, fix Switch Account, remove Lock app + Close.
- `src/pages/Profile.tsx` — tighten spacing, add Edit profile button.

## Out of scope (defer to a later pass)
- Compact segmented control for All / Photos / Reels tabs (lives in 5k-line `ProfileContentTabs`).
- Real "Lock app" screen (would need a PIN/passcode flow).
- True multi-account switcher UI (would need account-list storage).

## Verification
After implementing, retest at 390×844:
- Open /profile, tap kebab → /more shows back button → tap back returns to /profile.
- Tap Switch Account on /more → user is signed out and lands on /auth with `?intent=switch`.
- /profile composer and tabs have visible breathing room.
- "Edit profile" button is reachable from /profile in 1 tap.
