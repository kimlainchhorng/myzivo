## Goal
Tighten the `/more` (Account) workflow so it matches the `/profile` page, surfaces missing high-value actions, and shows a second blue verified badge in a more prominent place.

## What's missing today (audit of the screenshot)
1. No quick **"View / Edit Profile"** shortcut — user must tap the whole header card.
2. No **"ZIVO ID / Username"** display under the name (handle is invisible).
3. No second **blue verified mark** — the current one next to the name is small; verification is a key trust signal and should also appear as a pill/strip.
4. **Refer a Friend / Invite** is buried (only inside Business section as "Referral Program").
5. No **"Switch Account"** or **"Add Account"** entry — common in modern super-apps.
6. **Activity / Login history** is hidden deep — should be in Essentials for security.
7. No quick **"Dark mode / Appearance"** toggle row at the top of Essentials.
8. Sign-out works but there's no **"Lock app"** quick action for privacy.

## Changes

### 1. Profile header card (top of page)
- Keep the existing name + small blue check.
- Add a **second, larger blue verified pill** below the name on a new row: `[✓ Verified Account]` (blue gradient, white text, 18px) — only when `is_verified`.
- Add a one-line **handle** under the name (`@{handle || email-prefix}`) so identity is unmistakable.
- Add a small **"Edit profile"** ghost button on the right side of the card (next to the chevron) routing to `/profile/edit` (or `/account/settings` if no edit page exists yet — will detect during build).

### 2. Quick Actions row (6 icons)
Replace `Search` (already in bottom nav / global) with **`Invite` (Refer a Friend → /referrals)** so it's one tap away. Final order:
`Wallet · Orders · Saved · Support · QR Code · Invite`

### 3. New "Account Status" strip (between Quick Actions and Spotlight)
A slim horizontal card showing:
- Blue verified check + "Verified" (or "Get verified" CTA → `/account/verification`)
- Membership tier pill (Explorer / Traveler / Elite) → `/membership`
- Wallet balance preview → `/wallet`

This gives the second prominent blue badge the user asked for and surfaces account state at a glance.

### 4. Essentials section additions
Insert at the top of `quickLinksMain`:
- **My Profile** → `/profile`
- **Refer a Friend** → `/referrals` (with "Earn" badge)
- **Activity Log** → `/activity` (security visibility)
- **Switch Account** → `/auth` (sign-in as different user)

### 5. Account & Support section additions
Add:
- **Login & Devices** → `/account/settings` (sessions)
- **Two-Factor Auth** → `/account/privacy`
- **Blocked Users** → `/account/privacy`

### 6. Sign-out area
Add a secondary subtle **"Lock app"** button above Sign out that calls `signOut()` then routes to `/auth` with a "locked" state — for now it can simply call `signOut()`.

## Files to edit
- `src/pages/MorePage.tsx` — all UI/data changes above.

## Out of scope
- No new routes/pages created — all targets already exist in `App.tsx` (verified in earlier audit).
- No DB / RLS changes.
- Profile page (`/profile`) stays untouched; this only syncs `/more` upward.
