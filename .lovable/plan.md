
The current edges look torn/jagged because the soft-ramp (0.35–0.65) on a low-res 256px mask still produces stair-stepping when upscaled to 720p. Need a higher-quality smoothing pass.

## Fix — `src/hooks/useVirtualBackground.ts`

1. **Render mask at video resolution first**: upscale the low-res confidence mask into a full-size offscreen canvas with `imageSmoothingQuality = "high"` bilinear, then apply a stronger `blur(3px)` filter on that upscale. This kills the staircase before alpha thresholding.

2. **Wider, smoother alpha ramp**: map confidence `[0.30 .. 0.70]` → alpha `[0..255]`. Wider band = smoother feathered edge (like Zoom/Meet) without halo bleeding into face center (which stays at 1.0 confidence = fully opaque).

3. **Two-pass mask refinement**:
   - Pass 1: upscale low-res mask → mid canvas with `blur(2px)`
   - Pass 2: draw mid → person clip with `blur(1.5px)` 
   - Combined gives a clean ~3-4px feather, no jaggies.

4. **Keep face raw**: video drawn with `filter: none`, no smoothing applied to person pixels themselves — only the mask alpha channel is smoothed.

5. **Background unchanged**: image cover-fit with `blur(2px) saturate(1.05)`, or `blur(22px)` for blur mode.

6. Reuse all canvases, preserve audio, 8s timeout fallback to raw.

Result: clean professional silhouette with soft natural feathered edge — no torn pixels, no halo, no face filter.
