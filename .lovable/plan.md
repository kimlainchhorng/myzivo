

## What I see across your 4 screenshots
The face now looks **clean, natural, and stable** across multiple poses (smiling, mouth open, head down, side profile). No square patches, no white halo, no ghost rectangles. Skin smoothing + contour + eye sparkle are working — the pipeline is healthy.

But comparing to Bigo/TikTok the look is still missing **3 signature finishing moves**:

1. **Teeth look slightly yellow / dim** when mouth opens (screenshot 2). Bigo always whitens teeth automatically.
2. **No "glow" rim on cheeks/nose-bridge** — Bigo adds a subtle highlight that makes faces look 3D under flat phone lighting.
3. **Still no AR layer** — no choice of color tone (warm/cool/film), no light leaks, no soft-focus background. These are the *visible* features users associate with "looks like Bigo."

Plus one bug visible in screenshot 3: when the user looks down sharply, the **forehead briefly desaturates** because contour multiply lands on hair instead of skin.

## Plan — Bigo-grade finishing layer

### 1. Teeth whitening (`useBeautyFilter.ts`)
- Detect mouth-open state from MediaPipe inner-lip landmarks (vertical gap > threshold).
- When open, sample inner-mouth region → apply `saturation 0.6 brightness 1.15` only on pixels where R≈G≈B and luma > 130 (teeth detection by color, not box).
- Alpha tied to existing `lips` slider so it's already controllable.

### 2. Highlight pass (3D glow)
- After contour, paint a soft white radial-gradient on:
  - Nose bridge (between landmarks 6 and 197)
  - Top of cheekbones (above the contour stripe)
  - Chin tip
- Alpha 0.05–0.12, scales with `brighten` slider. Gives the Bigo "lit from above" look.

### 3. Hair-safe contour
- Restrict contour stripe to the silhouette polygon (already built for face mask) — clip with `destination-in` against the face oval before multiplying. Eliminates the forehead-desaturation issue from screenshot 3.

### 4. Color filter LUTs (`useBeautyFilter.ts` + UI)
Add 4 instant tone presets, applied as a final full-frame overlay through the face mask:
- **Natural** — none (current)
- **Warm** — `rgba(255, 200, 150, 0.10)` overlay + `saturate(1.08)`
- **Cool** — `rgba(180, 210, 255, 0.10)` overlay + `saturate(1.05)`
- **Film** — sepia-lite: `rgba(255, 220, 180, 0.14)` + `contrast(1.05)`
- **Pink** — `rgba(255, 200, 210, 0.12)` + `saturate(1.12)` (Bigo signature)

### 5. Soft background blur (light)
- Use the *inverse* of the silhouette mask (`destination-out`) to blur everything outside the face by 3px. Cheap, no segmentation model needed. Approximates Bigo's "bokeh look" well enough on phone-distance shots.
- Toggle via new "Blur BG" chip.

### 6. UI additions (`GoLivePage.tsx`)
- New horizontal scroll row above presets: **Tone** chips (Natural · Warm · Cool · Film · Pink)
- New toggle: **Blur Background**
- Keep existing presets/sliders untouched

### Files
- `src/hooks/useBeautyFilter.ts` — teeth whitening, highlight pass, hair-safe contour clip, tone LUTs, BG blur
- `src/pages/GoLivePage.tsx` — Tone chip row, Blur BG toggle

### Out of scope (next round)
- AR stickers / face masks (cat ears, sunglasses)
- Real ML background segmentation (would need MediaPipe SelfieSegmentation)
- Color grading curves / film LUT files

