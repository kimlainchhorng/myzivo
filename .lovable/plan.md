

## Rewards & Loyalty Home Screen Integration

Most of the rewards system already exists in the codebase (loyalty points hook, rewards page, redemption options, tier system, earning rules). This plan focuses on surfacing it prominently on the home screen and adding the missing "Rewards Wallet" card to the sliding panel.

---

### What Already Exists (no changes needed)

| Feature | Location |
|---------|----------|
| Points earning/redeeming logic | `src/hooks/useLoyaltyPoints.ts` |
| Points balance card | `src/components/loyalty/PointsBalanceCard.tsx` |
| Redemption options page | `src/components/loyalty/RedemptionOptions.tsx` |
| Tier system (Explorer/Traveler/Elite) | `src/config/zivoPoints.ts` |
| Full rewards page | `src/pages/RewardsPage.tsx` |
| Earning rules config | `src/config/zivoPoints.ts` (EARNING_RULES) |
| User rewards hook | `src/hooks/useUserRewards.ts` |

---

### What Will Be Added

**1. Rewards Wallet Card in the Home Sliding Panel**

A new compact card inserted between the Promo Carousel and the Recently Used section. It shows:

- Points balance (large number)
- Current tier badge with icon
- Progress bar to next tier
- "Redeem" button linking to `/rewards`
- Verdant green gradient accent

Design: Rounded-2xl card with `bg-gradient-to-br from-primary/10 to-emerald-500/10` border, large typography for the balance number, compact progress bar, and a single CTA.

**2. Recent Rewards Earned (inside the wallet card)**

A small "Recent" section below the balance showing the last 2-3 reward earnings as one-line items (e.g., "+200 pts - Ride booking", "+100 pts - Review") using data from the `rewards` table via `useUserRewards`.

---

### Technical Details

**File modified**: `src/pages/app/AppHome.tsx`

**New imports**:
- `useLoyaltyPoints` from `@/hooks/useLoyaltyPoints`
- `useUserRewards` from `@/hooks/useUserRewards`
- `Gift`, `TrendingUp` icons from lucide-react
- `Progress` from `@/components/ui/progress`

**New hook calls** (inside AppHome component):
```
const { points } = useLoyaltyPoints();
const { active: activeRewards } = useUserRewards();
```

**Rewards wallet card** -- inserted after the promo carousel (line ~313), before Recently Used (line ~315):

```text
<div className="mb-5">
  <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20 p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">My Rewards</span>
      </div>
      <Badge>Explorer</Badge>
    </div>
    <p className="text-3xl font-bold mb-1">{balance} <span className="text-lg text-muted-foreground">pts</span></p>
    <Progress value={progress} className="h-2 mb-3" />
    <p className="text-xs text-muted-foreground mb-3">{pointsNeeded} pts to {nextTierName}</p>
    
    <!-- Recent earnings (last 2-3) -->
    <div className="space-y-1 mb-3">
      {recentRewards.map(r => (
        <div className="flex justify-between text-xs">
          <span>+{r.reward_value} pts</span>
          <span className="text-muted-foreground">{r.reward_type}</span>
        </div>
      ))}
    </div>
    
    <Button onClick={() => navigate("/rewards")} className="w-full bg-gradient-to-r from-primary to-emerald-500">
      <Gift /> Redeem Points
    </Button>
  </div>
</div>
```

**Tier mapping** -- reuses the same mapping from RewardsPage:
```
const mapTier = (oldTier: string): ZivoTier => {
  if (oldTier === 'gold' || oldTier === 'silver') return 'elite';
  if (oldTier === 'bronze') return 'traveler';
  return 'explorer';
};
```

**Auth-gated**: The rewards card only shows when `user` is signed in. When signed out, the space is skipped cleanly.

---

### Summary

| Item | Detail |
|------|--------|
| Files modified | 1 (`src/pages/app/AppHome.tsx`) |
| New sections added | 1 (Rewards Wallet Card with recent earnings) |
| New hooks imported | 2 (`useLoyaltyPoints`, `useUserRewards`) |
| Existing infrastructure reused | Points system, tier config, rewards table |
| No new pages needed | Rewards page, redemption, and referral pages already exist |

