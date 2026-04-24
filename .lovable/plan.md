## Problem

In your screenshot the **X close button** and the **profile name "kimlain Chhorng / recent ago"** are sitting directly under the iPhone's status bar / Dynamic Island. They visually overlap signal/wifi/battery icons — they're inside the unsafe zone.

Root cause in `src/pages/ReelsFeedPage.tsx`:

```tsx
style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0.75rem)' }}
```

When `env(safe-area-inset-top)` reports 0 (Android, in-app browsers, some Capacitor WebViews), the fallback is only **12 px** — far smaller than the ~30–48 px status bar. The header collapses against the top.

The same flaw exists in:
- Feed sticky header (line 675) — fallback `10 px`
- Search overlay header (line 704) — fallback `8 px`
- Fullscreen post-detail header (line 957) — fallback `12 px` ← the one in your screenshot
- ReelSlide close button (line 1297) — fallback `12 px`

## Fix — Two parts

### 1. Raise the safe-zone floor everywhere a top control lives

Replace every `max(env(safe-area-inset-top, 0px), <12px>)` with a guaranteed-safe minimum that clears a real status bar even when the OS reports 0:

```tsx
style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 2.75rem)' }} // 44px floor
```

Applied to:
- Post-detail fullscreen header (line 955)
- ReelSlide close button `top` (line 1297)
- Feed sticky header (line 675) — slightly smaller floor (`2.25rem`) since it sits below the URL bar in browsers
- Search overlay header (line 704) — same `2.25rem` floor

This guarantees the X and profile chip never enter the unsafe zone on **any** device/runtime combination, while still expanding correctly on notched iPhones where `env()` returns the real inset.

### 2. Refresh post-detail header to match your screenshot

Replace the current minimal "X · Post · drag pill" bar with a richer Instagram-style header that shows the author inline (matching your screenshot intent and `Boost your host potential` style):

```text
┌───────────────────────────────────────────────┐
│ [X]  ⓐ  kimlain Chhorng              [drag] │
│         recent ago                            │
└───────────────────────────────────────────────┘
```

- Left: 40×40 X close button (rounded, hover/active states preserved)
- Center-left: author avatar (32 px) + name (medium weight) + relative timestamp (muted)
- Right: drag-pill grabber hint (kept, as added by SwipeableSheet pattern)
- Tap on author area → navigate to `/user/<share_code|id>`
- Avatar uses `optimizeAvatar` util (already in repo) for fast load

The header background stays `bg-background/95 backdrop-blur-xl border-b` — only contents and padding change.

## Files to edit

| File | Change |
|---|---|
| `src/pages/ReelsFeedPage.tsx` | Lines 675, 704, 955–968, 1297 — bump safe-area floor to 44 px (`2.75rem`) for fullscreen / ReelSlide and 36 px (`2.25rem`) for in-page sticky headers; redesign the fullscreen post-detail header to show avatar + name + relative time, keep drag pill |

No other files require changes. Existing SwipeableSheet, CommentsSheet, ShareSheet safe-area work from prior turns is unaffected.

## Verification

After the change, run the existing safe-area QA we already wired up:

- `npm run qa:safe-area` — static check across all `env()` expressions
- `npx vitest run src/components/social/__tests__/SwipeableSheet.safeArea.test.tsx` — already covers iPhone 15 Pro / Pro Max / Pixel 8 Pro / Galaxy S24 Ultra / iPad Pro 11

I'll add one extra `data-testid="post-detail-header"` assertion to the suite confirming the new fullscreen header's `paddingTop` resolves ≥ 44 px even when device profile reports `top: 0` (covers the Android / in-app browser case from your screenshot).
