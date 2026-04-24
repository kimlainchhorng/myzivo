## What I checked

Comparing your two screenshots against the current code:

- **IMG_2140 (`/more`)** — already matches the reference exactly: profile header card, 6 quick tiles (Wallet / Orders / Saved / Support / QR Code / Search), 3 gradient feature cards (ZIVO Plus / Creator Hub / Rewards), 6 collapsible sections, Sign out, Close. No changes needed here.
- **IMG_2141 (`/profile`)** — clean after the last cleanup. Only minor leftovers and one UX nit remain.

## Issues to fix

### 1. Orphan `signOut` in Profile.tsx
After removing the inline "Sign out" button, `signOut` is still destructured from `useAuth()` (line 152) but never used. Drop it to keep the file clean and silence lint.

### 2. Empty-bio block is too tall
On a fresh profile (your screenshot), the bio area stacks: helper text + empty textarea + big green "Add bio" pill. That's 3 stacked elements taking ~140px before the user even types. Tighten it:
- Show a single compact "+ Add bio" ghost button by default.
- Tapping it reveals the textarea + Save/Cancel (same flow already used when editing an existing bio).
- Result: empty state collapses to one small line, matching the minimalist Facebook-style layout in `mem://style/profile-page-ui-layout`.

### 3. Runtime error: "Importing a module script failed"
A module import is failing on `/index`. Stack is unavailable, but it's almost certainly a stale lazy-chunk reference after the recent edits. I'll re-check imports in `Profile.tsx` and `App.tsx` and confirm no dangling `lazy(() => import(...))` points to a removed/renamed file. If it persists after the cleanups above, the next build should regenerate the chunk hashes and clear it.

## Files to edit

- `src/pages/Profile.tsx`
  - Remove `signOut` from the `useAuth()` destructure (line 152).
  - Replace the empty-bio block (~lines 691–733) with: collapsed "+ Add bio" button → expands into existing textarea + Save/Cancel.
- No other files need changes.

## Out of scope (intentionally not touching)

- `/more` page — already matches your reference.
- Cover photo buttons, stats row, stories rail, composer, content tabs — all good.
- Account shortcuts — correctly live only in `/more` now.
