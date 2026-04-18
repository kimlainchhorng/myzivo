

## What I see in your screenshot
Your face now looks like it has a **flat beauty mask layered on top** — skin looks plastic/uniform, the bright vertical "glow" stripe down your nose/forehead is way too obvious, and the smoothing has erased your real skin texture. It reads as "filter applied" instead of "I just look good today."

This is the classic over-processed Bigo look. Three things are making it feel mask-like:

1. **Highlight glow is too strong & too white** — that bright vertical band on your nose/forehead is the new 3D-glow pass. At the current alpha it looks like a stage spotlight, not natural skin sheen.
2. **Skin smoothing alpha 0.65–0.92 is too aggressive** — pores, micro-shadows, and skin grain are completely gone. Without grain the face reads as CGI.
3. **No texture restoration** — pro filters (TikTok, Snap) re-add a tiny noise/grain pass *after* smoothing so skin still looks like skin. We never do that.

Plus a 4th subtle one: **defaults are too high**. Natural preset is hitting smooth=55, brighten=40 — that's already "Glam" territory on a well-lit face.

## Plan — make it look like real skin, not a mask

### 1. Tone down the highlight glow (`useBeautyFilter.ts`)
- Cut highlight alpha from 0.05–0.12 → **0.02–0.05**
- Shrink the nose-bridge highlight radius by ~40% so it's a subtle sheen, not a stripe
- Remove the chin-tip highlight entirely (it was creating an unnatural shine spot)
- Tie highlight strength to `brighten` slider only — at brighten=0 it's fully off

### 2. Add skin-grain restoration pass (NEW)
After smoothing + brighten, paint a very subtle monochrome noise texture over the face mask at α 0.04–0.08 (scales *inversely* with smooth — more smoothing = more grain back). Uses a pre-generated 128×128 noise canvas tiled across the face. This is the single biggest "real skin" trick — pro filters all do it.

### 3. Soften smoothing curve
- Drop alpha range from 0.65–0.92 → **0.45–0.78**
- Reduce blur radius slider mapping by ~25% so pores survive at low/mid settings
- Skin will still look clean but keep micro-detail

### 4. Retune Natural preset to "barely-there"
- Natural: smooth 35 (was 55), brighten 20 (was 40), slim 15, eyes 10, lips 8, contour 12, highlight 8, teeth 0
- Sweet: smooth 50, brighten 30, slim 25, eyes 25, lips 20, contour 18, highlight 15
- Glam: keeps current strong values for users who want the full Bigo look
- Add a new **"Real"** preset = smooth 25, brighten 12, everything else minimal — for users who want "I just look rested"

### 5. Cap individual sliders' max effect
- Smooth slider 100 currently = alpha 0.92. Lower to **alpha 0.78** so even maxed it's not plastic
- Brighten slider 100 currently = +0.18 lighten. Lower to **+0.12**

### 6. Add a quick "Less" / "More" intensity master
At the top of the beauty panel, add a single intensity slider 0–100% that scales ALL effects together. Default 60%. Lets users dial back everything in one swipe without rebalancing each individual setting.

### Files
- `src/hooks/useBeautyFilter.ts` — weaken highlight, add grain pass, soften smoothing curve, lower max caps
- `src/pages/GoLivePage.tsx` — retune presets, add "Real" preset, add intensity master slider

### Out of scope
- AR stickers / face masks
- Real ML segmentation for BG blur
- Per-region smoothing strength (forehead vs cheeks)

