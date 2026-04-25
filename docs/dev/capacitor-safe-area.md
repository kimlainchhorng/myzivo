# Capacitor Safe-Area Handling — Read Before Touching CSS Insets

> TL;DR — On ZIVO's iOS Capacitor build, `env(safe-area-inset-top)` is **`0px`** by design.
> Never write `max(env(safe-area-inset-*), Npx)` in this codebase. Use the shared
> `.pt-safe` / `.pb-safe` / `.safe-area-top` / `.safe-area-bottom` utilities from
> `src/index.css`. If you re-add a hard floor like `44px`, you will reproduce
> the white-bar regression we fixed on 2026-04-25.

---

## Why `env(safe-area-inset-top)` is 0 in our app

Our `capacitor.config.ts` sets:

```ts
plugins: {
  StatusBar: {
    overlaysWebView: false, // ← critical
  },
}
```

When `overlaysWebView: false`, the **native iOS shell** moves the WebView's
origin **below** the status bar / notch. The browser engine inside the WebView
therefore sees a viewport that already starts at the safe area, so it
correctly reports `env(safe-area-inset-top) === 0px`.

If you then write CSS like:

```css
/* ❌ DO NOT DO THIS */
padding-top: max(env(safe-area-inset-top), 44px);
```

…you add **44px on top of an already-inset WebView** → giant white gap above
the header. This is exactly what users reported in "Picture 1" before the fix.

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
