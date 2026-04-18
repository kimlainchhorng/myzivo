

## Why the screenshot looks broken
The white rectangular patches over the forehead, eyes, and chin are bugs in the Pro pipeline — not a tuning issue:

1. **Eye enlarge paints square patches.** `clearRect` on the helper canvas leaves a transparent rectangle, then we copy that whole 3r × 3r region onto the output. The clipping circle only protects the *write* but not the *read*, so a hard-edged square around each eye gets stamped onto the face. That's the two boxes over the eyes and the box over the forehead.
2. **Lip enhance leaks as a colored rectangle on the chin.** The lip block reuses the shared `maskCanvas` for two different purposes in the same frame, so the lips-only mask is briefly the wrong shape and the saturated/contrasted layer is composited as an opaque blob below the mouth.
3. **Brighten is way too strong.** Screen-blend at α 0.8 with a warm fill blows out skin to near-white, killing detail.
4. **Face mask flicker.** When the landmarker drops a frame we fall straight to the lite oval, which doesn't align with the real face → visible "mask jumping" between frames.

## Fix plan — `src/hooks/useBeautyFilter.ts`

### A. Eye enlarge — rebuild correctly
- Use a dedicated offscreen canvas (`eyeCanvas`) sized only to 3r × 3r, draw the scaled eye into it, then composite onto the output **inside** a feathered radial-gradient alpha mask drawn with `globalCompositeOperation = "destination-in"` on the eye canvas itself. Result: soft circular blend, zero square edges.
- Cap scale at +22% (28% looked alien).

### B. Lip enhance — isolate the mask
- Use a third dedicated canvas (`fxCanvas`) for per-feature masks so we never stomp on the main face mask mid-frame.
- Drop saturation boost from 1.6 → 1.35, contrast 1.2 → 1.1, alpha 0.85 → 0.55. Subtle "Bigo lip tint", not lipstick paint.

### C. Brighten — tone it down + soften
- Screen alpha 0.8 → 0.35.
- Warm overlay alpha 0.15-0.42 → 0.08-0.22.
- Add a tiny `brightness(1 + brighten * 0.08)` pass on the masked region instead of relying entirely on screen blend.

### D. Smoothing — feather the mask edge
- Apply `filter: blur(8px)` when drawing the face mask into a copy, then use *that* feathered mask for `destination-in`. Eliminates the hard oval edge that was visible across the forehead.
- Reduce smoothing alpha range from 0.7-0.95 → 0.55-0.85 so pores don't fully disappear.

### E. Stability — keep last good landmarks longer
- Keep `lastLandmarks` for up to 500ms instead of falling back to lite oval on a single missed detection. Eliminates mask-jumping flicker.

### F. Defaults — more flattering, less "filter face"
- `DEFAULT_BEAUTY`: `{ smooth: 70, brighten: 35, slim: 25, eyes: 18, lips: 30, nose: 12 }`
- `glam` preset: lower smooth 95→85, brighten 75→55, lips 70→55. Still glam, no longer plastic.
- `sweet`: smooth 92→82, brighten 70→50, eyes 32→25.

### G. Add subtle "Bigo finishing pass" (only inside face mask)
- Tiny unsharp on lips + eyes region so they look defined, not blurred away.
- Mid-tone lift via a single `multiply` pass with rgba(255,235,225,0.08) — gives the warm Bigo glow without washing out.

### H. UI (`src/pages/GoLivePage.tsx`)
- No layout changes — just wire the new defaults.
- Add a small subtitle under the status pill: *"Move closer for best results"* — helps when the landmarker can't find a face.

### Files
- `src/hooks/useBeautyFilter.ts` — fix eye/lip/brighten bugs, feather mask, stabilize landmarks, retune defaults.
- `src/pages/GoLivePage.tsx` — minor copy tweak under status pill.

### Out of scope (later)
- AR stickers / face masks
- Background blur
- Color LUTs (warm/cool/film tone)

