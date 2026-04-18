

## Goal
Make the virtual background look like a real, professionally-shot photo — sharp person edges, no halo bleed, and natural color/light blending with the chosen scene.

## Issues in current screenshot
1. Person edges are mushy — background blur leaks into the face/hair
2. Threshold band (0.35–0.7) is too wide → translucent halo around shoulders
3. Mask runs at low MediaPipe resolution (256px) without upscaling smoothing
4. No light/color matching, so person looks "pasted on"
5. Background is too sharp/bright → competes with subject

## Fix plan (single file: `src/hooks/useVirtualBackground.ts`)

**1. Tighter, cleaner mask**
- Narrow the smoothstep band to `0.5–0.62` (sharper silhouette, no halo)
- Add a 2-pass dilate+erode-style refinement: blur mask `0.8px`, then re-threshold high (≥0.55→255) so edges stay crisp but anti-aliased
- Upscale mask with `imageSmoothingQuality: "high"` when drawing into personCanvas

**2. Edge treatment (real-camera feel)**
- Draw person with a **1px inner feather only** (not 1.2px full blur which softens face)
- Add a thin dark inner rim (1px shadow at edges) using a second masked draw with `0.5px` offset → gives natural depth separation

**3. Background realism**
- Increase background blur to `4px` + `brightness(0.88)` + `saturate(1.1)` → mimics shallow depth-of-field, pushes scene back
- Add a soft radial vignette over the background only (darker corners) for cinematic framing
- Keep ambient tint but lift to `rgba(0,0,0,0.06)` for stronger grounding

**4. Color/light match**
- Sample average background color (downscale bg to 1×1 px once on load) and overlay it on the person at `rgba(R,G,B,0.05)` with `multiply` blend → ties subject lighting to scene

**5. Pipeline order**
```text
[bg image] → blur+vignette+tint
   ↓
[mask] → refine (blur→threshold→upscale smooth)
   ↓
[person] = video ∩ refined-mask + inner rim shadow
   ↓
[person] → light-match overlay (multiply with bg avg color)
   ↓
composite onto bg
```

## Files
- `src/hooks/useVirtualBackground.ts` — refine mask thresholds, add vignette + bg-avg color sampling + inner rim, tune filters

No new dependencies. No UI changes.

