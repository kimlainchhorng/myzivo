

## Add Referral "Invite Friends" Card to Home Screen

The referral system already exists in the codebase (referral codes, sharing, tracking, dedicated pages). This plan adds a compact invite card to the home sliding panel.

---

### What Already Exists (no changes needed)

| Feature | Location |
|---------|----------|
| Referral codes & sharing | `src/hooks/useReferrals.ts` |
| Full referral page | `src/pages/ReferralProgram.tsx` |
| Account referrals page | `src/pages/account/ReferralsPage.tsx` |
| Referral card component | `src/components/loyalty/ReferralCard.tsx` |
| Referral config & rewards | `src/config/referralProgram.ts`, `src/config/zivoPoints.ts` |
| Share tracking | `src/hooks/useShareTracking.ts` |

---

### What Will Be Added

**1 compact "Invite Friends" card** inserted into the home sliding panel, right after the Rewards Wallet card and before "Recently Used".

The card shows:
- "Invite Friends" heading with Users icon
- Short value prop: "Earn 1,000 pts for every friend who books"
- Referral code displayed in a mono badge
- Friends invited count and total points earned
- "Share Link" button (copies referral link or opens native share)

---

### Technical Details

**File modified**: `src/pages/app/AppHome.tsx` (1 file)

**New import**: `useReferrals` from `@/hooks/useReferrals`

**New icon imports**: `Users`, `Share2` from lucide-react (add to existing import)

**New hook call** (inside AppHome):
```
const { referralCode, referrals, copyReferralLink, shareReferral } = useReferrals();
```

**Card placement**: After the Rewards Wallet card (line ~374), before Recently Used (line ~376).

**Card design**:
- `rounded-2xl` with `bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20`
- Users icon + "Invite Friends" title
- One-line value prop with points amount from `REFERRAL_REWARDS.referrer.pointsPerReferral`
- Referral code in a `font-mono` badge
- Stats row: friends count (`referralCode?.total_referrals || 0`) and earnings (`referralCode?.total_earnings || 0`)
- Full-width "Share Link" button linking to `shareReferral()` (uses native share API with clipboard fallback)
- Auth-gated: only shows when user is signed in
- "See all" link navigates to `/account/referrals`

