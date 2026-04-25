# Premium text-story image renderer

The reason "nothing changed" is that the green disc in the ring is the **actual saved image** — `media_type` is `"image"` (not `"text"`), so the StoryTextTile branch never runs. The flat green PNG is produced by `CreateStorySheet`'s `renderTextToBlob` canvas function, which paints a basic 2-stop gradient + plain text. Fixing the ring isn't enough — the source image itself is flat.

## Fix: upgrade the canvas renderer + preview to match the StoryTextTile aesthetic

Single file: `src/components/profile/CreateStorySheet.tsx`

### 1. Upgrade `TEXT_BACKGROUNDS` to 3-stop palettes

Replace the 6 flat 2-stop gradients with premium 3-stop ones (start → mid → end) so both the picker chip preview, the live compose preview, and the canvas render share the same colors.

```ts
const TEXT_BACKGROUNDS: { css: string; stops: [string, string, string] }[] = [
  { css: "linear-gradient(135deg,#10b981 0%,#0ea371 45%,#0f766e 100%)", stops: [...] }, // ZIVO emerald
  { css: "linear-gradient(135deg,#6366f1 0%,#7c3aed 50%,#8b5cf6 100%)", stops: [...] }, // indigo→violet
  { css: "linear-gradient(135deg,#f59e0b 0%,#f97316 50%,#ef4444 100%)", stops: [...] }, // sunset
  { css: "linear-gradient(135deg,#06b6d4 0%,#0ea5e9 50%,#3b82f6 100%)", stops: [...] }, // ocean
  { css: "linear-gradient(135deg,#ec4899 0%,#db2777 50%,#f43f5e 100%)", stops: [...] }, // rose
  { css: "linear-gradient(135deg,#0f172a 0%,#1e293b 55%,#334155 100%)", stops: [...] }, // graphite
];
```

Update the two consumers — preview `style={{ background: TEXT_BACKGROUNDS[bgIdx].css }}` and chip `style={{ background: bg.css }}`.

### 2. Rewrite `renderTextToBlob` for depth

Replace the flat single linear-gradient + plain text with a layered composition (1080×1920 canvas):

1. **Base**: 3-stop diagonal `createLinearGradient` (using `stops`).
2. **Top-left highlight**: large radial gradient `rgba(255,255,255,0.32) → 0` for glass dimensionality.
3. **Bottom-right shade**: radial `rgba(0,0,0,0.35) → 0` for depth.
4. **Decorative orbs**: two soft white radial blooms (top-right, bottom-left) for visual interest.
5. **Text**: weight bumped to `800`, larger sizes, with `shadowColor rgba(0,0,0,0.35)`, `shadowBlur: 24`, `shadowOffsetY: 6`. Reset shadow after drawing.

Word-wrapping logic stays unchanged.

## Out of scope

- Existing 3 stories already in DB stay flat (they're immutable JPGs in storage). New text stories created from now on will render premium.
- No DB / RLS / test changes.

## Files touched

- `src/components/profile/CreateStorySheet.tsx` only (3 small edits: palette, preview/chip style, `renderTextToBlob`).
