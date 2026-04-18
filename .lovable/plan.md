

## Why nothing changed for you
The model is still showing **"Loading face tracking…"** in your screenshot — that means MediaPipe never loaded, so the filter is silently running the *fallback* path (a tiny 10% brightness bump, no smoothing, no slim, no eye enlarge). That's why you can crank every slider to 100 and see basically zero difference.

Two likely root causes:
1. **WASM CDN blocked / slow** — `cdn.jsdelivr.net/.../tasks-vision/wasm` sometimes fails on mobile carriers. We never recover from that.
2. **GPU delegate fails on Safari iOS** → throws → we never retry on CPU.

The fallback itself is also way too weak — even if MediaPipe never loads, the user should still see a clearly beautified face.

## Plan — make beauty *actually* look like Bigo/TikTok

### 1. Make MediaPipe actually load (root-cause fix)
- Self-host the WASM + `face_landmarker.task` model under `/public/mediapipe/` so there's no CDN dependency.
- Try **GPU delegate first → auto-retry with CPU delegate** on failure.
- Add a 6-second timeout: if still not ready, fall through to the *strong* fallback (below) instead of staying stuck on "Loading…".
- Surface real status: `loading → ready` or `loading → fallback` so the UI shows "Beauty active (lite)" instead of an infinite spinner.

### 2. Strong fallback that always looks good (no MediaPipe required)
Replace the current 10% brighten with a **real beauty pass** that runs on every device:
- **Bilateral-style smoothing**: draw the frame, then composite a softly-blurred copy on top with `globalAlpha = 0.45` clipped to a **center oval** (estimated face region — most users frame their face center). No more global mush.
- **Brighten + warmth + saturation lift** inside the same oval.
- **Soft vignette** outside the oval to draw the eye to the face (Bigo signature look).
- **Teeth/eye sharpening pass**: slight unsharp mask in the lower-center region.

This alone will look 5× better than today even when MediaPipe fails.

### 3. Stronger landmark-based effects (when MediaPipe loads)
Current values are too subtle. Bump the upper range:
- **Skin smoothing**: blur 4–10px → **6–18px**, alpha 0.55–0.9 → **0.7–0.95**. Add a second pass with `saturate(1.1) contrast(1.05)` inside mask for the "glow".
- **Brighten**: warm overlay alpha 0.10–0.28 → **0.15–0.42**, also lift mid-tones with a `brightness(1.0–1.15)` pass on the masked region.
- **Face slim**: pinch 0–20px → **0–45px** scaled by face width (so it works zoomed in or out). Use 4 cheek slices per side (feathered) instead of 2 hard slices — kills any residual seam.
- **Eye enlarge**: 0–18% → **0–28%**, with proper feathered radial gradient mask (no hard circle edge).
- **NEW – Lip enhance**: subtle saturation+contrast bump inside the lip contour (very Bigo).
- **NEW – Nose slim**: tiny horizontal pinch around nose-tip landmark 4 (just ~6–10% reduction).

### 4. Auto-on, smarter defaults
- Change `DEFAULT_BEAUTY` to `{ smooth: 80, brighten: 55, slim: 35, eyes: 25, lips: 40, nose: 20 }` — closer to Bigo defaults so the *first frame* with Beauty on already looks dramatically better.
- Update **Glam preset** to push everything to 90+ for the "filter face" look users expect.
- Add a new **"Sweet"** preset (high smooth+brighten, low slim) for the soft kawaii look.

### 5. UI tweaks (`GoLivePage.tsx`)
- Replace "Loading face tracking…" with a status pill: **"Beauty: Pro"** (landmarks) / **"Beauty: Lite"** (fallback) / **"Loading…"** (first 2s only).
- Add **Lip** and **Nose** sliders to the panel.
- Add a **Sweet** preset chip next to Natural / Glam / Off.
- Show a live A/B "Compare" press-and-hold button on the preview so the user can *see* the before/after instantly — this is the #1 reason users say "nothing changed" (they don't have a reference).

### Files
- `src/hooks/useBeautyFilter.ts` — self-host WASM, GPU→CPU retry, timeout, much stronger fallback, stronger landmark effects, add lips + nose.
- `src/pages/GoLivePage.tsx` — status pill, Lip/Nose sliders, Sweet preset, hold-to-compare button.
- `public/mediapipe/` — bundled WASM + model file (added via download script).

### Out of scope (next iteration)
- AR stickers / face masks
- Background blur / replacement
- Color LUTs (warm/cool/film)

