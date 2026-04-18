
The face in the screenshot shows a soft, blurred halo around the silhouette — the segmentation mask is still being applied, which causes the "filter/mask" feel even though no beauty filter is active. The user wants raw face pixels with only the background swapped behind them.

Looking at the current `useVirtualBackground.ts`, the mask thresholding band (`LO=0.5, HI=0.62`) still produces semi-transparent pixels at the silhouette edge, and the `imageSmoothingEnabled` upscaling of the low-res MediaPipe mask (256px) onto the 720p person canvas creates a soft, mask-like edge across the face perimeter.

## Fix
Make the mask **fully binary** (no anti-aliased edge band) and **pixel-perfect upscale** so the face inside the silhouette is 100% raw video, with no transparency falloff anywhere.

### Single file: `src/hooks/useVirtualBackground.ts`

1. **Binary mask** — replace smoothstep band with hard threshold:
   ```ts
   const T = 0.5;
   for (i): a = maskData[i] >= T ? 255 : 0;
   ```
   No partial alpha → no halo, no soft edge that reads as "mask on face."

2. **Disable smoothing on mask upscale** — set `pctx.imageSmoothingEnabled = false` before the `destination-in` draw so the mask scales nearest-neighbor (sharp, no blur into face).

3. **Keep person draw smooth** — only the mask upscale is nearest-neighbor; the video itself stays high-quality.

4. **Remove vignette** — it darkens the edge of the frame around the face, contributing to the "processed" look. Background stays clean: just blur + slight brightness.

### Result
- Face = 100% raw camera pixels, no edge softening
- Background swaps cleanly behind a hard silhouette
- No filter/mask appearance on skin

No new dependencies. No UI changes.
