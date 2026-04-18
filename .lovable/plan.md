

## What you're seeing
Faint rectangular ghost-patches on forehead and right cheek = **hard-edged source-over rectangles** from face-slim and nose-slim. They paint a clean video copy on top of the already-smoothed face, so the smoothed/unsmoothed boundary forms a visible rectangle.

## Root causes
1. **Face slim** (lines 399-413): 4 cheek slices per side drawn with `ctx.drawImage(video, ...)` — that's *unfiltered* video stamped on top of the smoothed face. Each slice = 1 visible rectangle.
2. **Nose slim** (lines 429-438): Same problem — 2 hard rectangles around the nose.
3. **Smoothing alpha too low** (0.55-0.85) — the boundary contrast between smoothed face and unsmoothed slim/nose patches is amplified.
4. **Lip enhance** allocates a *new canvas every frame* (line 366) — memory churn / GC pauses on mobile.

## Fix plan — `src/hooks/useBeautyFilter.ts`

### A. Reorder pipeline — slim/nose BEFORE smoothing
Currently: draw video → smooth → brighten → lips → **slim (hard rect)** → nose (hard rect) → eyes.
New order: draw video → **slim → nose** → rebuild face mask (slim moved cheeks!) → smooth → brighten → lips → eyes → finishing.
This way slim/nose warps go *under* the smoothing pass — patches get blended away.

### B. Feather slim/nose slices
Even pre-smooth, draw each slice into `fxCanvas` first, then composite onto `ctx` through a vertical-gradient alpha mask (transparent at top/bottom edges of each slice, opaque in middle). Eliminates horizontal seams between slice rows entirely.

### C. Slim slices — overlap + crossfade
Draw 6 slices instead of 4, each overlapping its neighbor by 30%, with `globalAlpha = sin(π·t)` per slice. No piece-edge boundaries.

### D. Reuse the lip-feather canvas
Promote `featherLips` to a hook-scoped persistent canvas (allocated once). Stops per-frame allocation jank.

### E. Bump smoothing alpha back up
Range 0.65-0.92 (was 0.55-0.85). Stronger smoothing also hides any residual slim/nose seams.

### F. Tighten slim band
Currently `top = forehead + 25%` of face height — that puts slim slices on the **forehead**. Move to `top = nose-tip y` so slim only affects jaw/cheeks. This alone removes the forehead ghost-patch.

### G. Tone down nose pinch on small faces
Cap nose pinch at `min(noseW * 0.06, 6px)` — too aggressive on phone-distance faces creates the side-of-nose rectangles you see.

### H. Add cheap frame-pacing guard
Skip the *finishing pass* (G) when avgFrameMs > 33ms so low-end devices don't drop below 24fps.

### Files
- `src/hooks/useBeautyFilter.ts` — reorder pipeline, feather slim/nose slices, persistent lip-feather canvas, tighten slim band, cap nose pinch.

### Out of scope
- WebGL pipeline (would fix this perfectly but ~2 days of work)
- AR stickers
- Background blur

