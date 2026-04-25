## Match the real Facebook verified badge

Comparing your reference (Kim Thai) to the current ZIVO badge: ours is close, but the **starburst shape is too round/wavy** and the **checkmark is too thin and sits off-center**. Facebook's mark is a crisper 12-point scalloped star with a thick, perfectly centered checkmark.

### What I'll change

**1. `src/components/VerifiedBadge.tsx` — redraw the SVG**

- Replace the current 14-point wavy starburst with the **Facebook 12-point scalloped circle** (shorter, evenly-spaced bumps — more disc-like, less "flower").
- Use the exact Facebook blue: **`#1877F2`** (already correct, keep it).
- Redraw the checkmark:
  - Shift it to true optical center (Facebook's tick sits slightly low-left of geometric center).
  - Increase stroke from `2.4` → `3` for that bold, chunky Facebook tick.
  - Keep `strokeLinecap="round"` and `strokeLinejoin="round"`.
- Add `vector-effect="non-scaling-stroke"` so the checkmark stays crisp at every size (14px → 22px).

**2. Tiny inline-alignment fix**

Change wrapper alignment from `align-[-0.125em]` → `align-[-0.2em]` so the badge sits flush with the **cap-height** of the bold name (currently floats slightly high next to `text-2xl font-bold`).

### Visual comparison

```text
Before (ours)         After (Facebook)
   ✿                     ✦
  ✓                      ✓     ← thicker, centered
 wavy 14-point         12-point scalloped
 thin tick             chunky tick
```

### Files touched

- `src/components/VerifiedBadge.tsx` — only this one file.

### What stays the same

- All sizing (22 / 16 / 14), placement, tooltip, ARIA, `interactive` prop, verification logic, admin controls, realtime sync, and tests — untouched. The existing snapshot test will pick up the new SVG path automatically.
