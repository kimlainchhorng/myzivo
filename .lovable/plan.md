
The user wants the virtual background swap to work again — but cleanly, with no face filter/mask appearance. Currently `useVirtualBackground` is a pass-through stub, so selecting Office/Beach/etc. does nothing (raw camera shows through).

## Goal
Re-enable real background replacement using MediaPipe selfie segmentation, but with a **professional, clean** result:
- Background swaps properly (image or blur)
- Face stays raw — no smoothing, no filter, no halo
- Hard binary mask with crisp silhouette
- Slight edge antialiasing only at the very boundary (1px) so silhouette doesn't shimmer

## Implementation — `src/hooks/useVirtualBackground.ts`

Restore segmentation pipeline with these upgrades over the previous version:

1. **MediaPipe ImageSegmenter** (selfie_segmenter.tflite) loaded from `/mediapipe`, GPU→CPU fallback.

2. **Hard binary mask** with single-pixel edge softening:
   - Threshold at 0.5 → fully person or fully background
   - Apply `maskCtx.filter = "blur(0.6px)"` only on the *upscale draw* to soften jaggies by ~1px (no halo, no face-bleed)

3. **Background rendering**:
   - `image` mode: cover-fit, `blur(2px) saturate(1.05)` for subtle depth-of-field, no vignette, no tint
   - `blur` mode: blur the live video at 22px

4. **Person rendering**:
   - Raw video, NO filter, NO smoothing applied to person pixels
   - `imageSmoothingEnabled = true` for person draw, `false` for mask upscale

5. **Performance**:
   - Reuse canvases (out / person / mask) — never allocate per frame
   - `captureStream(30)` published immediately so preview never blanks
   - Audio tracks preserved
   - Pass-through immediately if `kind === "off"`

6. **Robustness**:
   - 8s timeout → if segmenter fails, fall back to raw pass-through (don't block stream)
   - Per-frame try/catch so one bad frame doesn't kill the loop

No new dependencies. No UI changes. No beauty filter — that hook stays a pass-through stub.
