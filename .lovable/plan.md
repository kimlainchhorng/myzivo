# Plan — Pin the compact header over the cover (always visible)

## Goal
Match the uploaded screenshot: the small header row (back arrow • avatar • "ZIVO Platform" + verified • bell • more) should sit **on top of the cover photo from the very first frame**, not fade in only after scrolling. It should remain readable while scrolling and stay pinned at the top.

## What's wrong today
In `src/pages/Profile.tsx` (lines ~397–520) the sticky header uses scroll-driven motion values:
- `stickyOpacity = useTransform(scrollY, [96, 156], [0, 1])` — invisible until scrolled 96px
- `stickyTranslate` slides it down from `-18px`
- `pointerEvents` is disabled until visible
- Background uses `bg-background/85` (solid-ish), no gradient scrim — looks empty over a white area

Result: when the page first loads, the cover area appears blank at the top with no header chrome — exactly the opposite of the screenshot.

## Changes

### 1. `src/pages/Profile.tsx` — pin header from frame one
- Remove the scroll-tied `opacity` / `translate` / `pointerEvents` gating. Header is always visible and interactive on mobile.
- Keep only a subtle scroll-driven **background opacity boost** for legibility once content scrolls under it:
  - At scroll 0 → translucent (`bg-black/0` + soft top-down gradient scrim so icons read on bright covers)
  - At scroll >80 → `bg-background/90 backdrop-blur-xl` with bottom border
- Add a permanent gradient scrim layer behind the header (`bg-gradient-to-b from-black/35 to-transparent`) so the back/bell/more icons stay legible over photo covers (matches the screenshot where the dark icons sit cleanly over the cover).
- Switch icon color to adapt: when over cover (scroll 0) use `text-white drop-shadow`, after scroll use `text-foreground`. Toggle via the same scroll threshold.
- Keep existing back/avatar/title/bell/more buttons and handlers exactly as they are.
- Remove the `isStickyHeaderVisible` state + `useMotionValueEvent` block that toggled it (no longer needed).

### 2. Cover offset
- Because the header now overlays the cover, add `pt-[calc(var(--zivo-safe-top-sticky)+3rem)]` only to the **non-cover** loading state, so the spinner doesn't hide under the header. Cover already paints behind safe-area, so no change needed there.

### 3. No other files changed
- `ProfileContentTabs`, `MorePage`, routes, etc. stay as-is from previous rounds.

## Technical details
```tsx
// Replace the stickyOpacity / stickyTranslate / isStickyHeaderVisible block with:
const headerBgOpacity = useTransform(scrollY, [0, 80], [0, 0.9]);
const headerBlurEnabled = useTransform(scrollY, [0, 80], [0, 1]);
const [overCover, setOverCover] = useState(true);
useMotionValueEvent(scrollY, "change", (v) => setOverCover(v < 80));

// Header JSX:
<motion.header
  style={{ paddingTop: "var(--zivo-safe-top-sticky)",
           height: "calc(var(--zivo-safe-top-sticky) + 3rem)" }}
  className="lg:hidden fixed top-0 inset-x-0 z-40 px-3 flex items-center gap-3"
>
  {/* Scrim layer for cover legibility */}
  <div aria-hidden className={cn(
    "absolute inset-0 -z-10 transition-all duration-200",
    overCover
      ? "bg-gradient-to-b from-black/40 via-black/15 to-transparent"
      : "bg-background/90 backdrop-blur-xl border-b border-border/40"
  )} />
  {/* Buttons get conditional color */}
  <ArrowLeft className={cn("h-5 w-5", overCover ? "text-white drop-shadow-md" : "text-foreground")} />
  ...
  <span className={cn("font-semibold text-sm truncate",
    overCover ? "text-white drop-shadow-md" : "text-foreground")}>
    {profile?.full_name || "Profile"}
  </span>
</motion.header>
```

## Acceptance
- On mobile load of `/profile`, header (back • avatar • name + verified • bell • more) is visible immediately over the cover photo, matching the uploaded screenshot.
- Scrolling past ~80px transitions the header background to the standard solid blurred bar with foreground-color icons; no flicker.
- Buttons are tappable from the first frame (no `pointer-events: none`).
- Desktop (`lg+`) is unaffected.
