## Goal

Tighten the `/profile` (Account tab) experience: fix a duplicate route bug, add a clear quick-actions hub on the profile page itself, polish the bio editor, enlarge cover-photo controls to meet tap-target rules, and surface the most-used account links so users don't have to dig into `/more` for everything.

Reference: the screenshot shows the page ending after the friends/followers stats with no obvious "what now?" — we'll add a structured Account hub directly on `/profile`.

## What changes

### 1. Fix duplicate `/more` route (App.tsx)
- Two routes register `/more`: line 595 (`AppMore`) and line 844 (`MorePage`). The second wins silently.
- Decision: keep `MorePage` (it's the richer 502-line hub already linked from cover photo "..." and Sign-out flows). Remove the earlier `<Route path="/more" element={...AppMore...}/>`.
- Add a code comment near the surviving route so the conflict doesn't re-surface.

### 2. New "Account hub" card on `/profile` (Profile.tsx)
A compact 6-tile grid placed between the profile card and the Phone-required card:

```text
┌──────────┬──────────┬──────────┐
│  Wallet  │  Saved   │ Settings │
├──────────┼──────────┼──────────┤
│  Orders  │ Notifs   │   Help   │
└──────────┴──────────┴──────────┘
                [ See all → /more ]
```

- Each tile: `min-h-[72px]`, accent ring color from semantic tokens, lucide icon, label + tiny description.
- Targets:
  - Wallet → `/wallet`
  - Saved → `/saved`
  - Settings → `/account/settings`
  - Orders → `/grocery/orders`
  - Notifications → `/notifications` (the actual list, not the dropdown)
  - Help → `/help`
- "See all" links to `/more`.
- Tiles are first-class buttons (44px+ tap target, `aria-label`, focus ring).
- Replaces nothing — this is additive content, not a layout overhaul.

### 3. Bio editor polish (Profile.tsx)
- Add `bioEditing` state. When `profile.bio` is set and `!bioEditing`:
  - Render bio as plain `<p>` with a small `Pencil` button next to it (`aria-label="Edit bio"`).
- When editing or no bio yet: keep the textarea + Save button (same code path, just gated).
- Save handler closes editor on success.
- Empty bio state: subtle "Add a short bio so people know who you are" muted helper line above the input.

### 4. Cover-photo button tap targets (Profile.tsx)
- Cover top-right circular buttons are `h-7 w-7` (28px). Increase the **hitbox** to `h-10 w-10` while keeping the **icon visual** at the same size — use `flex items-center justify-center` with inner icon sized as today.
- Apply to: reposition, change cover, notifications, more (4 buttons).
- Add focus-visible ring class: `focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none`.

### 5. Surface "Edit profile" + "Sign out" inline (Profile.tsx)
- After the bio block, add a horizontal action row:
  - `Edit profile` outline button → `/account/profile-edit`.
  - `Share profile` outline button → `/qr-profile` (already exists in MorePage's quick actions).
  - Overflow menu (kebab) → "Sign out" (calls `signOut` + redirects to `/`).
- Keeps the current bell/more pair on the cover, but adds the truly common actions where they belong (under the name/badges).

### 6. Order/group existing CTAs (Profile.tsx)
Reorder the cards under the profile header so the most actionable items come first:
1. Profile card (cover, avatar, name, bio, stats, socials, edit/share/signout row)
2. **Account hub grid** (new, see #2)
3. **Verification CTA** (already exists — promote out of profile card to its own card so it's not buried under the bio when not verified)
4. Phone-required card (only when missing — already conditional)
5. Stories
6. Notifications dropdown panel (unchanged)
7. ProfileContentTabs (unchanged)

### 7. Accessibility pass on the profile card
- Stats buttons get explicit `aria-label="View N friends"` etc.
- Cover-photo buttons get `aria-pressed` where toggleable (notifications panel button).
- Avatar upload button: add `aria-label="Change profile photo"`.
- Verification CTA already has accessible text — leave alone.

## Files

**Edited**
- `src/App.tsx` — remove the duplicate `/more` route.
- `src/pages/Profile.tsx` — add Account hub grid, bio edit toggle, edit/share/signout row, enlarge cover buttons, accessibility labels, reorder verification card out of the profile header.

**No new pages, no schema changes, no new dependencies.** All link targets already exist in `App.tsx` (verified: `/wallet`, `/saved`, `/account/settings`, `/grocery/orders`, `/notifications`, `/help`, `/qr-profile`, `/more`, `/account/profile-edit`).

## Out of scope
- Restyling the cover photo / avatar treatment.
- Touching `MorePage` content (already comprehensive).
- Adding new account features (everything links to existing pages).
- Server/RLS changes.
