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
