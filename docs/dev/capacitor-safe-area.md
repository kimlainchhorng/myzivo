# Capacitor Safe-Area Handling — Read Before Touching CSS Insets

> **UPDATED 2026-04-25 (edge-to-edge):** We switched `StatusBar.overlaysWebView`
> to **`true`** so cover photos, gradients, and page backgrounds reach the very
> top of the screen. `env(safe-area-inset-top)` now returns the **real** notch /
> status-bar height on iOS (≈47–59px) and Android (≈24–32px).
>
> **Rules:**
> - **Visual content** (images, gradients, full-bleed backgrounds) → no top
>   padding; let it flow under the status bar for an immersive look.
> - **Interactive controls** (buttons, tabs, sticky headers, nav bars) → use
>   `.pt-safe`, `.safe-area-top`, or `var(--zivo-safe-top-sticky)` so they
>   sit below the status bar.
> - **Bottom nav / home indicator** → use `.pb-safe` or
>   `var(--zivo-safe-bottom)`.
>
> Never add a hardcoded pixel floor like `max(env(...), 44px)` — the env()
> value is now accurate and a floor will double-pad on notch devices.

---

## Why `env(safe-area-inset-top)` is now non-zero

Our `capacitor.config.ts` sets:

```ts
plugins: {
  StatusBar: {
    overlaysWebView: true, // edge-to-edge
    style: 'DARK',
  },
}
```

The WebView fills the entire screen (including under the status bar). The
browser correctly reports `env(safe-area-inset-top)` as the status-bar height,
and our `.pt-safe` / `.safe-area-top` utilities push interactive UI down by
exactly that amount — no hardcoded floor required.

## When `env()` is non-zero

| Platform | `env(safe-area-inset-top)` | Notes |
|---|---|---|
| Capacitor iOS (`overlaysWebView: false`) | **`0px`** | WebView is pre-inset. |
| Capacitor iOS (`overlaysWebView: true`) | ~47px on notched devices | We do **not** use this mode. |
| Capacitor Android | `0px` | StatusBar plugin handles it natively. |
| iOS Safari PWA (standalone) | ~47px on notched devices | Real notch reported. |
| iOS Safari (browser tab) | `0px` | URL bar handles it. |
| Desktop / Android Chrome | `0px` | No notch. |

## Decision Cheatsheet — which utility to reach for

```text
┌─────────────────────────┬───────────────────────────────────────────────┐
│ Use this                │ When                                          │
├─────────────────────────┼───────────────────────────────────────────────┤
│ Nothing                 │ You're inside <AppLayout> with the default    │
│                         │ header — main already has padding-top set.    │
│ .safe-area-top          │ A page renders its OWN header (no AppLayout) │
│                         │ as the first child, sticky to the top.        │
│ .pt-safe                │ Adding top inset to a non-header element such │
│                         │ as a fullscreen overlay or modal that starts  │
│                         │ at y=0 and isn't covered by safe-area-top.    │
│ .pb-safe                │ Fixed/sticky bottom navs, action bars, bottom │
│                         │ sheets, FABs, footers inside drawers.         │
│ .safe-area-bottom       │ Same as .pb-safe — pick one, prefer .pb-safe  │
│                         │ for consistency.                              │
│ var(--zivo-safe-top-*)  │ Browser-PWA only; you need a minimum floor    │
│                         │ to work around the Dynamic Island env()=0     │
│                         │ bug. Tokens: -overlay (60), -sheet (44),      │
│                         │ -sticky (48). NEVER inline max(env(...), N).  │
└─────────────────────────┴───────────────────────────────────────────────┘
```

**Three-question decision flow:**

1. *Is this inside `<AppLayout>` and using the default header?* → **Do nothing.**
2. *Is it a bottom-anchored UI element (nav, action bar, sheet)?* → **`pb-safe`**.
3. *Is it a top-anchored element rendered outside `<AppLayout>`?* → **`safe-area-top`** (header) or **`pt-safe`** (everything else).

If you ever feel tempted to write `max(env(safe-area-inset-*), Npx)` — stop. Use a `--zivo-safe-*` token instead, or accept that the inset is genuinely zero on Capacitor iOS.

## Common mistakes (before / after)

**1. Double-padding the header**
```tsx
// ❌ BEFORE — adds inset twice on iOS Capacitor
<header style={{ paddingTop: "max(env(safe-area-inset-top), 44px)" }}>

// ✅ AFTER
<header className="safe-area-top">
```

**2. Stacking utilities on parent + child**
```tsx
// ❌ BEFORE — both elements add the inset
<div className="safe-area-top">
  <div className="pt-safe">…</div>
</div>

// ✅ AFTER — pick exactly one layer
<div className="safe-area-top">
  <div>…</div>
</div>
```

**3. Inline floor on a bottom nav**
```tsx
// ❌ BEFORE — the 1rem extra makes the bar float on Capacitor
<nav style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}>

// ✅ AFTER — Tailwind composition keeps semantic intent
<nav className="pb-safe pb-4">
```



## Correct patterns

### Top inset (status bar)

```tsx
// Sticky header that sits flush with the system UI:
<header className="sticky top-0 safe-area-top">…</header>

// Or, when you need an inline style:
<div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }} />
```

### Bottom inset (home indicator)

```tsx
// Bottom nav, action bars, sheets:
<nav className="fixed bottom-0 pb-safe">…</nav>
```

### When you genuinely need a minimum (browser PWAs only)

Use the design token, never an inline `max()`:

```css
padding-top: var(--zivo-safe-top-overlay); /* max(env(...), 60px) */
```

Tokens live in `src/index.css` under `:root`:

- `--zivo-safe-top` — raw env, no floor
- `--zivo-safe-bottom` — raw env, no floor
- `--zivo-safe-top-overlay` — floored at 60px (modal headers in browser)
- `--zivo-safe-top-sheet` — floored at 44px (sheet headers in browser)
- `--zivo-safe-top-sticky` — floored at 48px (sticky headers in browser)

These tokens are safe in browsers because the floor only matters when the
browser fails to report a real inset — Capacitor never hits the floor since
`overlaysWebView: false` already pre-insets.

## Forbidden patterns

```tsx
// ❌ Doubles padding on Capacitor iOS
style={{ paddingTop: "max(env(safe-area-inset-top), 44px)" }}

// ❌ Same problem with Tailwind arbitrary values
className="pt-[max(env(safe-area-inset-top),44px)]"

// ❌ Stacking pt-safe ON a parent that already has safe-area-top
<div className="safe-area-top">
  <div className="pt-safe">…</div> {/* doubled */}
</div>
```

## Verifying changes

1. Toggle the in-app overlay: **Account → Developer → Show safe-area overlay**
   (or `Ctrl+Shift+S` on web). You'll see live `env()` values.
2. Walk the QA checklist at **`/dev/qa/safe-area`**.
3. Run visual regression: `bun run test:visual`.
4. On a real device: `npx cap sync ios && npx cap run ios`.

## Related

- Memory: `mem://style/mobile-native-ux-standards`
- Fix history: 2026-04-25 — removed `max(env(...), 44px)` floors from
  `.safe-area-top`, `.pt-safe`, `.pb-safe` in `src/index.css`.
