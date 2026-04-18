

## What I see in your two screenshots
1. **Screenshot 1 (close-up, looking down)**: Forehead/skin looks **smooth and clean** — the grain pass is working, no plastic look. Good.
2. **Screenshot 2 (face visible)**: Skin looks **natural now** — no more mask effect, but the face is **slightly washed out / low contrast**, eyes look a bit dim, and there's still a faint **vertical brightness band** down the center of the face from the residual highlight + brighten overlay stacking on the nose ridge.

So the "real skin" fix worked. Next-level upgrade should focus on what Bigo/TikTok do that we still don't:

## Plan — v3 "Pro Polish" upgrade

### 1. Eye brightening + under-eye de-darkening (NEW)
Bigo's signature move. When eyes are detected:
- Paint a soft warm-white radial under each eye (landmark indices 230, 450) at α 0.06–0.10 → reduces dark circles instantly
- Brighten the iris region by +8% luma → eyes "pop" without looking fake
- Tied to existing `eyes` slider

### 2. Lip definition pass (NEW)
Currently lips just get saturation. Add:
- Detect upper-lip cupid's bow (landmarks 0, 11, 12) and paint a 1px subtle dark line for definition
- Add tiny radial highlight on lower-lip center (landmark 17) for "glossy" look
- Both at α 0.10–0.18, scales with `lips` slider

### 3. Auto white-balance correction (NEW)
The face in screenshot 2 has a slight orange/warm cast from indoor lighting. Sample the forehead patch every 60 frames; if R/B ratio > 1.15 (too warm) push a `rgba(180, 200, 255, 0.04)` cool overlay on face mask. If too cool (< 0.92), push warm. Self-correcting → looks natural in any light.

### 4. Fix vertical brightness band
Brighten + highlight currently both pass through the *full* face mask, so the central nose/forehead axis double-brightens. Fix:
- Make brighten overlay use a horizontal *gradient* mask (stronger at cheeks, fade out at center) so the centerline doesn't get hit twice
- Cap combined center-axis brightness with `globalAlpha` calc: `min(brightAlpha + highlightAlpha, 0.18)`

### 5. Subtle face-shape harmonizer
Light tooth-pinch already exists. Add:
- Tiny **jaw-line softening**: feather the jawline mask edge by extra 4px so chin transition into neck looks more refined (no hard edge)
- Micro **chin-lift**: push landmarks 152, 175 up by `slim * 0.5%` of face height — reduces "double chin" appearance subtly

### 6. New "Pro" preset (between Sweet and Glam)
- Pro: smooth 60, brighten 35, slim 30, eyes 28, lips 35, nose 18 — the "everyone wants to look like this" sweet spot

### 7. Performance: skip grain pass when smooth < 30
Grain only matters when smoothing is heavy. Skip the pass entirely on low-smooth settings to save 2–3ms per frame on phones.

### Files
- `src/hooks/useBeautyFilter.ts` — under-eye brighten, lip definition, auto white balance, fixed brighten gradient, jaw feather, chin-lift, perf guard
- `src/pages/GoLivePage.tsx` — add "Pro" preset chip

### Out of scope
- AR stickers / cat ears
- ML background segmentation
- Real bilateral filter (would need WebGL)
- Hair recoloring

