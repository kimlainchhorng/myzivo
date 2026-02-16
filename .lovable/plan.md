

# Upgrade Car Icons to Premium, Detailed SVGs

## Problem
The current car icons are identical basic outlines (same shape for all 3 tiers) with only color differences. They look generic and don't convey tier differences.

## Solution
Replace all three car SVGs with detailed, visually distinct side-profile car illustrations:

### Economy Car
- Compact hatchback/sedan silhouette with filled body
- Emerald green filled body with lighter roof/window area
- Visible wheel details with hubcap circles
- Door line detail and side mirror
- Friendly, approachable shape

### Premium Car
- Longer, lower sedan profile (BMW/Mercedes style)
- Gold/dark filled body with tinted window area
- More refined wheel details (larger rims)
- Sleek roofline with a sportier stance
- Side accent stripe in gold

### Elite Car
- Long, ultra-low luxury sedan (Rolls Royce/Maybach silhouette)
- Deep purple body with gold accent trim line
- Detailed large chrome-style wheels
- Extended wheelbase, prominent hood
- Gold star/emblem on the side
- Most detailed of the three

### Thumbnail Adjustments
- Increase icon sizes: Economy 32px, Premium 34px, Elite 36px
- Adjust circular backgrounds to 56px for non-compact to give more room

## Technical Details

| File | Changes |
|------|---------|
| `src/components/ride/ZivoRideRow.tsx` | Replace `EconomyCarSvg`, `PremiumCarSvg`, `EliteCarSvg` with detailed filled SVG illustrations; adjust `ZivoCarThumbnail` sizing from 52px to 56px (non-compact) |

### EconomyCarSvg (new)
- viewBox `0 0 40 24`, width 32
- Filled rounded body path in emerald (`#10B981`)
- Light gray windows (`#D1FAE5`)
- Two detailed wheels with dark rims and lighter hubcaps
- Small side mirror and door handle detail

### PremiumCarSvg (new)
- viewBox `0 0 44 24`, width 34
- Lower, longer profile body in charcoal (`#292524`) with gold trim line (`#D4AF37`)
- Tinted dark windows (`#44403C`)
- Larger sport wheels with gold hubcap accent
- Side mirror, door handle, front grille detail

### EliteCarSvg (new)
- viewBox `0 0 48 24`, width 36
- Longest, lowest body in deep purple (`#581C87`) with gold lower trim (`#D4AF37`)
- Dark tinted windows with chrome window frame (`#C084FC`)
- Extra-large wheels with gold/chrome spokes
- Gold star emblem near rear quarter panel
- Extended hood proportion for luxury feel

