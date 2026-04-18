

## Goal
Replace the current naive canvas warp (which causes visible seams + global blur) with a real face-aware beauty pipeline that looks like Bigo/TikTok.

## Root cause of current issues
1. **Global blur**: `ctx.filter = blur(...)` blurs the *entire* frame (hair, background, edges) → everything looks mushy, not smooth-skinned.
2. **Visible seam under jaw**: face-slim redraws a horizontal band on top of the already-drawn frame → creates a faint horizontal "cut" artifact (visible in your screenshot under the chin).
3. **No face detection**: slim/eye warps are applied to a fixed center region → if the face moves, the warp misses the face entirely.
4. Runtime error `setLocalStream` is stale from a previous build — current code uses `setRawStream`. A clean reload clears it.

## New approach — MediaPipe FaceLandmarker

### Pipeline (`src/hooks/useBeautyFilter.ts` — rewrite)
1. Lazy-load **`@mediapipe/tasks-vision`** (`FaceLandmarker`, GPU delegate, 478 landmarks, runs at 30fps on phones).
2. Per frame:
   - Detect face landmarks (~3ms on modern devices).
   - **Skin smoothing**: draw the raw frame, then draw a *blurred copy* on top **masked to the face oval** (using landmarks 10, 338, 297, 332, …, 152 — the standard face-oval contour) with `globalAlpha = smooth/100 * 0.7`. Eyes, brows, lips are punched out so they stay sharp.
   - **Brightening + warmth**: only inside the same face mask (composite a soft warm overlay).
   - **Face slim**: instead of a hard band redraw, do a smooth horizontal pinch using two thin vertical slice draws on left+right cheek regions (landmarks 234, 454) with bilinear interp — no visible seam.
   - **Eye enlarge**: scale-up two small circular regions centered on landmarks 33 (left eye) and 263 (right eye), feathered alpha edge so there's no halo.
3. Fallback: if MediaPipe fails to load (slow connection, unsupported browser), keep current pipeline but **drop the global blur** and only apply brightness/saturate so we never ship the mushy look.

### Performance
- Run landmarker on a downscaled 256×256 ImageBitmap, scale results back — keeps us at 30fps even on mid-range phones.
- Skip every other landmark frame on devices where `requestAnimationFrame` drops below 25fps (reuse last landmarks).
- All work on offscreen canvas; output via `canvas.captureStream(30)` exactly as today, so the WebRTC publisher path is unchanged.

### UI tweaks (`src/pages/GoLivePage.tsx`)
- Add a **"Loading beauty…"** shimmer on the Beauty button for the first ~500ms while MediaPipe initializes.
- Add a 4th slider: **"Brighten"** (0–100) — currently bundled into "Smooth", users want it separate (matches Bigo).
- Default presets: change `DEFAULT_BEAUTY` to `{ smooth: 65, slim: 25, eyes: 20, brighten: 40 }` (more natural — current 55/35/25 was over-slimming).
- Add 3 quick-preset chips at the top of the panel: **Natural · Glam · Off**.

### Files
- `src/hooks/useBeautyFilter.ts` — full rewrite around FaceLandmarker.
- `src/pages/GoLivePage.tsx` — add Brighten slider, presets, loading state on Beauty button.
- `package.json` — add `@mediapipe/tasks-vision`.

### Out of scope (can add later)
- Color filters (warm/cool LUTs)
- Sparkle/glam overlays
- AR stickers/masks

