# Polish Blue Verified Badge

You're right — the current blue verified mark next to "ZIVO Platform" looks weak: the starburst is too small (16px), the checkmark is misaligned inside the burst, and there's no white halo so it visually merges with the text. Real verified marks (Instagram, Twitter/X, Facebook) read instantly because of three things: clean geometry, proper inner padding, and a subtle white outline.

## What will change

**1. Header verified badge (next to "ZIVO Platform")**
- Increase size from 16px → 18px so it visually balances the bold name.
- Redraw the SVG with a cleaner 12-point burst, geometrically centered.
- Re-position the inner checkmark so it sits perfectly in the middle (currently slightly off).
- Add a thin white inner stroke (1px) so the badge separates cleanly from any background.
- Add a soft drop shadow for a premium "lifted" feel.
- Use Twitter's exact verified blue (`#1d9bf0`) with a subtle gradient (lighter top → darker bottom) so it doesn't look flat.

**2. Account Status strip "Verified" tile**
- Reuse the same upgraded badge component at 20px so the header and status card match.

**3. Consistency across app**
- Profile page (`/profile`) already uses its own verified rendering — align it to use the same component so the badge looks identical everywhere the user sees their name.

## Before / after (conceptual)

```text
Before:  ZIVO Platform ✦   ← small, flat, checkmark off-center
After:   ZIVO Platform ✓   ← crisp burst, centered check, soft shadow, white halo
```

## Technical details

- File: `src/pages/MorePage.tsx` — replace the inline `VerifiedCheck` SVG (lines 242-264) with a refined version: linearGradient fill, centered check path, optional white stroke, drop-shadow filter.
- Extract the badge into `src/components/VerifiedBadge.tsx` so `MorePage.tsx` and `ProfilePage.tsx` share one source of truth.
- Update `src/pages/MorePage.tsx` line 285 (header) to size 18, and line 325 (status strip) to size 20.
- Update `ProfilePage.tsx` to import and use the shared `VerifiedBadge` next to the profile name.
- No backend / schema / route changes.

Approve to apply.
