
The screenshot shows the current issue: hair edges look thin/translucent and there's a faint white halo/blind glow around the silhouette, especially around the head/hair. The wide alpha ramp (0.30–0.70) is making mid-confidence pixels semi-transparent, so background light bleeds through hair → washed-out "blind white" look.

## Root cause
- Wide ramp `0.30–0.70` makes hair pixels ~50% alpha → background glows through
- No edge color decontamination → bright background bleeds onto hair edge
- 2px+1.5px blur is too soft for hair detail

## Fix — `src/hooks/useVirtualBackground.ts`

1. **Tighten alpha ramp to `0.45–0.60`** — narrower band keeps hair fully opaque, only the outermost 1-2px feathers. Eliminates the see-through hair effect.

2. **Erode mask by 1px before feather** — shrink the opaque region slightly so the soft edge sits *inside* the silhouette, not bleeding outward into background. Done by drawing mask with `filter: brightness(1.2)` then re-thresholding visually via composite.

3. **Reduce blur passes** — drop pass-1 from 2px → 1px, pass-2 from 1.5px → 0.8px. Sharper hair, no halo.

4. **Add dark inner rim** (1px) to kill bright background bleed: after person clip, draw a 1px `destination-atop` of the person itself slightly inset — this is too complex; simpler: just tighten the ramp + reduce blur, which solves 95% of the issue.

5. **Optional temporal smoothing** — keep previous mask, blend `0.6 * current + 0.4 * previous`. Reduces edge flicker between frames. Adds one extra canvas (`maskPrev`).

### Net changes
- `LO=0.45, HI=0.60` (was 0.30/0.70)
- Pass 1 blur: `1px` (was 2px)
- Pass 2 blur: `0.8px` (was 1.5px)
- Add `maskPrev` canvas + temporal blend at 60/40

Result: solid opaque hair, crisp 1-2px edge, no white halo, no see-through, still smooth (no jaggies).
