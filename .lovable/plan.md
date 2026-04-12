

# Fix Sticker Rendering: Clean Transparent Stickers

## Problem
Sticker videos use MP4s with baked green/white backgrounds. The current canvas-based chroma key in `TransparentStickerVideo.tsx` produces visible artifacts: white halos, dark outlines, incomplete background removal, and edge fringing — falling short of Telegram/Messenger quality.

## Root Cause
The sticker source files are MP4 videos (no alpha channel support). The chroma key algorithm must remove green/white backgrounds per-frame in real-time, which is inherently imperfect — especially at edges where colors blend with the background.

## Plan

### 1. Upgrade chroma key algorithm in `TransparentStickerVideo.tsx`
- **Wider white key range**: Lower `SOFT_KEY_BRIGHTNESS` from 228 to 215 and increase `MAX_NEUTRAL_VARIANCE` from 22 to 30 to catch more of the white/gray background including foot shadows
- **HSL-based green detection**: Replace simple RGB comparisons with HSL hue/saturation checks for more accurate green screen removal across light and dark green shades
- **Premultiplied alpha compositing**: After keying, multiply RGB by the new alpha to prevent white fringe bleeding on semi-transparent edges (the main cause of "white halo")
- **Improved despill**: Replace the current 20% green retention with a proper color-balance despill that shifts green toward the average of red and blue channels

### 2. Multi-pass edge refinement
- **Gaussian-weighted edge erosion**: Replace the current binary neighbor counting with a weighted 3x3 kernel that considers diagonal neighbors, producing smoother anti-aliased edges
- **Alpha-aware feathering**: For pixels adjacent to keyed areas, apply a smooth falloff curve instead of hard 0.2/0.6 multipliers
- **Preserve dark content**: Add brightness check before erosion — skip erosion on pixels below brightness 80 to protect dark features (black eyes, dark fur, outlines)

### 3. Add WebGL rendering path (optional performance boost)
- Add a `"webgl"` render mode option to `TransparentStickerVideo`
- Use a fragment shader for real-time chroma keying — GPU-accelerated, no `getImageData`/`putImageData` overhead
- Fall back to canvas 2D if WebGL is unavailable
- This eliminates the per-pixel JavaScript loop which is the main performance bottleneck

### 4. Sticker container styling cleanup in `ChatMessageBubble.tsx`
- Ensure the sticker wrapper has no background color, border, or shadow that could appear as a "box"
- Add `drop-shadow` filter on the canvas element for a natural floating effect (like Telegram)
- Verify dark mode and light mode both render cleanly

### 5. Static sticker (PNG) validation
- For non-animated PNG stickers rendered via `<img>`, verify they have actual transparency
- Add a CSS `drop-shadow` instead of `box-shadow` to avoid rectangular shadow artifacts

## Files to modify
- `src/components/chat/TransparentStickerVideo.tsx` — upgraded chroma key + optional WebGL path
- `src/components/chat/ChatMessageBubble.tsx` — container styling, drop-shadow

## Technical Details

**Premultiplied alpha** (key improvement):
```typescript
// After setting new alpha, premultiply RGB to prevent white fringe
const alphaRatio = data[index + 3] / 255;
data[index] = Math.round(data[index] * alphaRatio);
data[index + 1] = Math.round(data[index + 1] * alphaRatio);
data[index + 2] = Math.round(data[index + 2] * alphaRatio);
```

**Dark pixel protection** (prevents clipping sticker content):
```typescript
// Skip erosion for dark pixels — they're likely part of the character
if (brightness < 80) continue;
```

**WebGL shader** (optional, for performance):
```glsl
// Fragment shader does chroma key in GPU
float greenExcess = color.g - max(color.r, color.b);
float key = smoothstep(0.05, 0.15, greenExcess * saturation);
gl_FragColor = vec4(color.rgb * (1.0 - key), 1.0 - key);
```

## What this will NOT include
- **Server-side AI background removal**: The stickers are pre-made animated MP4 assets from a fixed library, not user uploads. AI segmentation would require a backend pipeline and is not needed here.
- **Manual erase tool**: Not applicable — these are animated videos, not static images users edit.
- **Upload-time conversion**: Stickers come from a CDN config, not user uploads.

## Expected Result
Stickers will render with clean, anti-aliased edges, no white halo, no dark outlines, and no visible background — matching Telegram/Messenger quality on both light and dark chat backgrounds.

