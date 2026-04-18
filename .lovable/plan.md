

## What I see in your screenshot
The face now looks **clean and natural** — no more ghost rectangles, no white patches, smooth skin, good color. The pipeline fix worked. 

But there are 3 things I can still improve to match Bigo/TikTok polish:

1. **Face looks slightly "flat / washed"** — smoothing is doing its job but we lost some facial definition (cheekbone shadow, jaw contour). Bigo adds a tiny **contour pass** to bring back depth.
2. **Eyes look a bit dull** — eye-enlarge is on but there's no **eye brightener / catchlight boost**, so eyes don't "pop" like Bigo.
3. **Slight visible halo on the right ear / hair edge** — the feathered face mask extends a bit past the cheek into hair when the user tilts. Need to clip mask tighter to the face oval landmarks (not the bounding box).

Plus 2 missing UX polish items the user keeps hitting:
- No way to know if Beauty is *actually* changing the frame (still asking "is it working?")
- No quick **"Auto Beauty"** one-tap that picks ideal settings based on lighting

## Plan — final polish pass

### 1. Add subtle contour (`useBeautyFilter.ts`)
After smoothing, paint a very faint **dark multiply** along the outer 15% of each cheek (between cheek landmark and jaw landmark) at α 0.06–0.12. Restores the cheekbone shadow that smoothing flattened. Bigo signature look.

### 2. Eye sparkle pass
Inside the existing eye mask, add:
- `brightness(1.08) saturate(1.1)` on the iris region
- A 1px white dot (catchlight) at the upper-inner iris point, α 0.25
- Tiny sharpen on lash line
Eyes will look noticeably brighter/sharper without changing color.

### 3. Tighten face mask to oval landmarks
Replace the current bounding-rect-based feather with a polygon built from MediaPipe's **silhouette landmark ring** (indices 10, 338, 297, 332, …, 152, 148, 176, …). Blur that polygon → use as `destination-in` mask. Eliminates the hair/ear halo entirely.

### 4. Visible "Beauty active" feedback
- When Beauty toggles on, briefly flash a green checkmark + "Beauty Pro active" toast at top of preview (1.5s).
- The status pill gets a subtle pulsing emerald dot when actively processing frames (proves it's running).

### 5. New "Auto" preset chip
Add **Auto** next to Natural / Sweet / Glam / Off:
- Samples average luma of the face region every 2s
- Dark frame → boost brighten +20, smooth +10
- Bright frame → reduce brighten −15, boost contour
- Always-on, self-tuning. Single tap = "looks great everywhere".

### Files
- `src/hooks/useBeautyFilter.ts` — add contour pass, eye sparkle, polygon face mask, expose `lumaSample` for Auto.
- `src/pages/GoLivePage.tsx` — add Auto preset chip, green flash toast on toggle, pulsing dot in status pill.

### Out of scope
- AR stickers / filters
- Background blur
- Color LUTs
- WebGL rewrite (current canvas pipeline is now stable and good enough)

