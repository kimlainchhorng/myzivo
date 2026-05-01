# Clean up duplicates on Profile (Account) page

The Profile page currently shows widgets that are already available inside the **/more** page (opened via the `…` icon in the top-right). This causes duplication and visual clutter on mobile.

## What to remove from `src/pages/Profile.tsx`

1. **"Your wallet" card** — `ProfileWalletCard` block (lines ~1311–1323).
   Already in /more → "Wallet" quick link + Account Status Strip.

2. **"Complete your profile" card** — `ProfileCompletenessCard` block (lines ~1337–1359).
   Profile editing entry points exist in /more → Account section.

3. **"Invite friends, earn credits" card** — `ProfileReferralCard` block (lines ~1361–1373).
   Already in /more → "Refer a Friend".

4. **"Account" Quick Links grid** (Shop / Employees / Mode / Monetization style row) — `ProfileQuickLinksCard` block (lines ~1401–1413).
   All these destinations exist in /more.

5. **Settings gear icon in the header** (lines ~824–835).
   Settings is already accessible from /more (and the `…` button right next to it opens /more). The gear is redundant.

Also remove now-unused imports: `ProfileWalletCard`, `ProfileCompletenessCard`, `ProfileReferralCard`, `ProfileQuickLinksCard`, `DEFAULT_QUICK_LINKS`, and the `Settings` icon import (only if no longer referenced elsewhere in the file).

## What stays
- Header: back arrow, avatar+name, notifications bell, `…` (More) button.
- Cover photo, profile info, bio, follower stats, action chips row (Shop/Employees/Mode/Monetization chips that sit directly under the bio — these are part of the profile identity, not the duplicated grid).
- Recent Trips card.
- Phone Required warning card.
- Stories row.
- Social Content Tabs (Posts / Videos / Live / Status).

## Result
Profile becomes a clean social profile (identity + content), and all account/wallet/referral/settings actions live in one place: the **More** page reached via the `…` button.

## Files touched
- `src/pages/Profile.tsx` (single-file change)
