## Status: previous fix targeted the wrong overlay

The screenshot shows the bug is **still happening** — NavBar, sidebars and right rail all bleeding through. Investigation:

Clicking a video post does **not** open `PostDetailOverlay` (which I already fixed last turn). It opens a **different** component: the TikTok-style **Reels viewer** at line 989 of `src/pages/ReelsFeedPage.tsx`:

```tsx
{reelsStartIndex !== null && (
  <motion.div className="fixed inset-0 z-[100] bg-black lg:top-[4.5rem]">
    ...
  </motion.div>
)}
```

Two bugs in that block:

1. **`lg:top-[4.5rem]`** — on desktop, the viewer is *intentionally* offset 72px from the top so the NavBar shows above it. Combined with bug #2, it creates the broken layout.
2. **Rendered inside `<PullToRefresh>`** which applies a CSS `transform`. A transformed ancestor becomes the containing block for `position: fixed`, so the "fullscreen" viewer collapses into the middle column (~672px wide), with the sidebars and NavBar visible around it and the close-X (which is rendered inside `ReelSlide`) clipped/hidden behind the NavBar.
3. **z-[100]** — too low to cover NavBar (z-[1200] per project memory) anyway.

This is the exact same gotcha already documented for `ZivoMobileNav` two lines below the closing `</PullToRefresh>` tag.

## Fix

Wrap the Reels viewer in `createPortal(..., document.body)` so it escapes PullToRefresh's transform; also:

- Drop `lg:top-[4.5rem]` → use plain `inset-0` so it covers the viewport including the NavBar.
- Bump `z-[100]` → `z-[1500]` so it stacks above NavBar (z-50/1200) and the chat hub (z-[1401]).
- Add an always-visible Close (X) button pinned to viewport top-right (lg+ only) — guaranteed to never be hidden behind anything.

## File modified
- `src/pages/ReelsFeedPage.tsx` — rewrite the `{reelsStartIndex !== null && …}` block (lines 989–1012) to portal the viewer to body, fix positioning/z-index, add desktop close button.

## Files unchanged
- `ReelSlide` markup, video logic, navigation, swipe gestures, NavBar, sidebars, mobile behavior.

## Acceptance
- Click a reel on desktop: video viewer covers the entire viewport — NavBar + both sidebars are no longer visible. Close (X) sits in the top-right corner and works. Esc still works (handled inside `ReelSlide`).
- Mobile: unchanged (`lg:top-[4.5rem]` was a no-op below lg, and `inset-0` on mobile is identical to before).
