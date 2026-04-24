## Goal

Remove the duplicate account shortcuts from `/profile`. The "Quick Access" 6-tile grid and the "Edit profile / Share / Sign out" button row both repeat what already lives on `/more`. Keep `/profile` focused on identity (cover, avatar, name, bio, stats, socials) and content tabs.

## Changes (Profile.tsx)

1. **Remove the Quick Access grid** — delete the entire `ParallaxSection` block that renders the "QUICK ACCESS" card with Wallet / Saved / Settings / Orders / Notifications / Help tiles (~lines 852–893).

2. **Remove the inline action row** under the bio — delete the Edit profile / Share / Sign out buttons block (~lines 735–767).

3. **Clean up unused imports** — drop `Heart`, `Share2`, `LogOut`, `HelpCircle`, `Inbox`, `ShoppingBag`, `Settings`, `Wallet` from the lucide import if no longer referenced after the removals. (Keep `Pencil` — still used by the bio edit button. Keep `signOut` from `useAuth` if referenced elsewhere; otherwise remove it from the destructure.)

4. **Keep recent good changes**: bio edit/cancel toggle, enlarged 44×44 cover-photo buttons, friend/follower/following a11y labels, avatar `aria-label`, and the duplicate `/more` route fix in `App.tsx`.

## Result

`/profile` matches the user's reference: profile card → bio editor → stats → socials → stories → content tabs. All account shortcuts (Wallet, Settings, Sign out, etc.) remain accessible via the cover-photo "•••" button → `/more`.

## Files

- `src/pages/Profile.tsx` — remove two blocks, prune unused imports.
