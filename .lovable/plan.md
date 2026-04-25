# Account flow polish — round 4

After auditing `/more` and the linked sub-pages, here are the remaining real issues plus a few high-value additions.

## Issues found

### A) Wrong / misleading destinations on `/more`
1. **Profile card "Edit" button** (line 285) currently routes to `/account/settings` — but settings is a hub, not the profile editor. It should go to `/account/profile-edit` (the actual edit form).
2. **"Payment Methods" row** (Essentials section) routes to `/account/settings` instead of `/account/wallet` (the real payment hub).
3. **"Appearance" row** (Account & Support) routes to `/account/settings` — there is no theme/appearance screen at that route. Should toggle theme in-place or open a small Appearance sheet.
4. **"Login & Devices"** also routes to `/account/settings` — the actual sessions UI lives at `/account/security`.
5. **"Two-Factor Auth"** routes to `/account/privacy` — should be `/account/security` (where 2FA lives).
6. **"Blocked Users"** routes to `/account/privacy` (correct enough, but the page lacks an in-page anchor; should at least pass `#blocked` so the section scrolls into view).

### B) Duplicates inside `/more`
7. **"Activity Log"** appears twice — once in Essentials and again in Account & Support. Remove the duplicate.
8. **"Notifications"** appears twice — `/notification-center` (Inbox) in Essentials and `/account/notifications` (settings) in Account & Support. Both are valid but should be labeled differently: rename the Essentials one to **"Inbox"** so users don't think they're the same.
9. **"Refer a Friend" / "Referral Program"** both link to `/referrals`. Keep one (Essentials), remove the Business duplicate.

### C) Missing essentials
10. **No search bar on `/more`** — the page has 70+ links across 6 collapsed sections, so finding "2FA" or "Export Data" requires opening each section. `/account/settings` already has search; `/more` should too.
11. **No "Delete account"** entry point on `/more`. There's a `/profile/delete-account` route but it's only reachable from the Settings hub. Add it under Account & Support (red, with `Trash2` icon).
12. **No Dark/Light theme toggle** anywhere in the account flow. Add a single inline toggle row in Account & Support (uses existing `next-themes` or document `data-theme`).
13. **"Switch Account" sign-out** works, but it gives no confirmation — a user tapping by accident loses their session. Add a small confirm dialog (`AlertDialog`) before signing out.

### D) Minor polish
14. **Sign-out button at the bottom** has no confirmation either — same `AlertDialog` pattern.
15. **Profile card stats row** (`Friends / Followers / Following`) — order is inconsistent with `/profile` where it shows Followers / Following / Friends. Reorder for consistency.
16. **Account Status strip "Explorer" tier** is hardcoded — should read from the user's actual loyalty tier (`profile.tier` or default to "Explorer" only when null).

## Proposed fixes (one pass)

In `src/pages/MorePage.tsx`:
- Update `Link to` targets for the 5 wrong rows (#1–5) and the profile-card Edit button.
- Remove the duplicate "Activity Log" and "Referral Program" rows.
- Rename Essentials → "Notifications" to "Inbox".
- Add a top-of-page **search input** (mirror `/account/settings` search) that flat-filters all section links and renders matches as a flat list while typing.
- Add **"Delete Account"** row at the bottom of Account & Support → `/profile/delete-account` (red icon).
- Add an inline **Theme** row (Sun/Moon icon) that toggles `document.documentElement.classList.toggle('dark')` and persists in localStorage.
- Wrap Sign Out + Switch Account taps in an `AlertDialog` confirm.
- Reorder profile-card stats to Followers / Following / Friends.
- Read tier from `profile?.tier ?? "Explorer"`.

## Files to edit
- `src/pages/MorePage.tsx` (single file, all 16 fixes)

## Out of scope
- Building a real Appearance settings page (toggle inline is enough for now).
- Real multi-account picker (the sign-out-then-/auth flow is acceptable).
- Re-flowing the 6 collapsed sections.

## Verification (after build)
- /more → tap profile-card "Edit" → lands on `/account/profile-edit`.
- Type "2fa" in search → only the Two-Factor row shows, and tapping it lands on `/account/security`.
- Tap Sign Out → confirm dialog appears; Cancel returns to /more, Confirm signs out.
- Tap Theme row → app switches between dark/light immediately and persists on reload.
- "Delete Account" row visible at bottom of Account & Support.
- No duplicate "Activity Log" anywhere on the page.
