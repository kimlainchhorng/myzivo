# Premium Story Ring Tile Redesign

The current text-only story tile renders a flat emerald-green disc with a small "Test story 1234" label. It looks generic, clashes with the Instagram-style conic ring, and doesn't match ZIVO's signature visual identity. The same issue shows up on the Profile, Feed, and Chat carousels.

## Goal

Replace the flat green text tile with a premium, ZIVO-branded preview that:

- Reads as a proper "story preview" — not a colored avatar.
- Uses the project's design tokens (no hardcoded `bg-primary` flat fills).
- Has depth: layered gradient + soft inner glow + subtle noise/sparkle texture.
- Renders the caption legibly at 64×64 px (auto-shrinks for longer text, max 3 lines).
- Stays visually consistent across image / video / text / avatar states.

## Design direction

Reference: ZIVO Signature Identity (emerald brand) + Instagram text-story aesthetic.

```text
+--------------------+
|  ◢ deep emerald ◣  |   ← angled gradient (brand emerald → teal → indigo)
|   "Test story"     |   ← bold display text, drop-shadow, auto-fit
|  ◣ subtle glow  ◢  |   ← inner radial highlight top-left
+--------------------+
```

- Background: diagonal gradient using `hsl(var(--primary))` → a darker tonal stop → `hsl(var(--accent))`. Pulled from `index.css` tokens, not hardcoded hex.
- Overlay: soft radial highlight (top-left, white/15) for dimensionality.
- Text: 1–3 lines, `font-bold`, white, drop-shadow, `text-balance`. Font size auto-scales based on caption length (≤8 chars: `text-[11px]`, ≤20: `text-[9px]`, else: `text-[7.5px]`).
- Slight inner ring (`shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]`) so the tile reads as a glass disc inside the IG conic ring.

## Implementation

Single shared component used by all three carousels.

### 1. New component

`src/components/stories/StoryTextTile.tsx`

```tsx
interface Props { text: string; className?: string; }
export default function StoryTextTile({ text, className }: Props) {
  const len = text.trim().length;
  const size =
    len <= 8 ? "text-[11px] leading-[12px]" :
    len <= 20 ? "text-[9px] leading-[11px]" :
    "text-[7.5px] leading-[10px]";
  return (
    <div className={cn(
      "relative h-full w-full overflow-hidden flex items-center justify-center",
      "bg-gradient-to-br from-primary via-primary/85 to-accent",
      "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]",
      className,
    )}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
      <span className={cn(
        "relative z-10 px-1.5 text-center font-bold text-primary-foreground",
        "drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] line-clamp-3 break-words",
        size,
      )}>
        {text || "Story"}
      </span>
    </div>
  );
}
```

### 2. Wire it into the three ring components

Replace the inline `<div className="...bg-gradient-to-br from-primary/80 to-primary...">` text branch in:

- `src/components/social/FeedStoryRing.tsx`
- `src/components/profile/ProfileStories.tsx`
- `src/components/chat/ChatStories.tsx`

with `<StoryTextTile text={latest.caption ?? ""} />`. No other ring logic changes.

## Files touched

- `src/components/stories/StoryTextTile.tsx` (new, ~25 lines)
- `src/components/social/FeedStoryRing.tsx` (1 branch swap)
- `src/components/profile/ProfileStories.tsx` (1 branch swap)
- `src/components/chat/ChatStories.tsx` (1 branch swap)

No DB, RLS, or test changes required. Existing Playwright spec keeps working.
