# Full-bleed visuals, buttons inside safe zone

## What you want (from your screenshots)

- **Visual content** — cover photos, feed background, Home tab pills, gradients → continue to **fill all the way to the very top and very bottom edge** of the screen (full-bleed under the notch and home indicator). ✅ already correct.
- **Buttons / interactive controls** — bottom tab bar (Live, Feed, Reel, Home, Map, Chat, Account), top action buttons on Profile (← back, ↕, ＋, 🔔, ⋯), Feed search bar, Home service tabs → **must sit inside the safe zone** so the iPhone notch and the home-indicator bar never overlap them.

The visual layer is already correct. The bug is that the **buttons are still being clipped/overlapped** because our `.pb-safe` and `.pt-safe` utilities have no minimum floor — they only honor `env(safe-area-inset-*)`, which is fine on real iOS but produces 0px in browser/PWA and unreliable values in some Capacitor states. Result: tab labels touch the home-indicator bar; profile icons touch the status bar.

## Fix — add a guaranteed minimum to the safe-area utilities

Update `src/index.css`:

```css
/* Buttons must always clear the home indicator, even when env() = 0. */
.pb-safe {
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 12px);
}

/* Buttons must always clear the notch / status bar, even when env() = 0. */
.pt-safe {
  padding-top: max(env(safe-area-inset-top, 0px), 12px);
}
```

This keeps the visual layer full-bleed (we're only padding the **interactive containers** that already use `.pb-safe` / `.pt-safe` / `--zivo-safe-top-sticky`) while guaranteeing buttons never sit under the notch or home indicator on any device or preview.

## Components touched

1. **`src/index.css`** — add the `max(..., 12px)` floors to `.pb-safe` and `.pt-safe`. Update the inline comments (they still reference the old `overlaysWebView=false` rule).
2. **`src/components/app/ZivoMobileNav.tsx`** — already uses `pb-safe`; will inherit the new floor automatically. No structural change.
3. **`src/pages/Profile.tsx`** — sticky header already uses `--zivo-safe-top-sticky` (which has a 48px floor). Verify the four top-right action buttons (↕, ＋, 🔔, ⋯ shown in IMG_2197) are nested inside that sticky header so they get the safe-top padding. If any of them are positioned independently with `absolute top-2`, wrap them in a container that uses `pt-safe` or `style={{ top: 'var(--zivo-safe-top-sticky)' }}`.
4. **`src/pages/FeedPage.tsx`** — confirm the top "Feed / Search people…" header sits inside a wrapper with `pt-safe` (or `--zivo-safe-top-sticky`). If not, add it.
5. **`src/pages/app/AppHome.tsx`** — the Rides/Eats/Flights/Hotels chip row already has `pt-3`; add `pt-safe` to the same container so the chips clear the notch on edge-to-edge mode.
6. **`docs/dev/capacitor-safe-area.md`** — update the "Decision Cheatsheet" to document the new 12px floor, and clarify the rule:
   - **Visual layer (cover photos, gradients, feed bg)** → no padding, full-bleed.
   - **Interactive layer (buttons, nav, tabs, headers)** → always wrap in `.pt-safe` / `.pb-safe` / `--zivo-safe-top-sticky`. Never use raw `top-0` or `bottom-0` for buttons.

## Why this works

- The cover photo, home-tab pill row backgrounds, and feed page background are all in the **visual layer** — they never had the safe-area class applied, so they continue to extend edge-to-edge. They are unaffected by this change.
- Only the **wrappers around buttons** carry `.pb-safe` / `.pt-safe` / `--zivo-safe-top-sticky`. Adding the 12px floor moves *only those buttons* down/up into the safe zone — exactly what your screenshots show is needed.

## After approval

After the changes, you'll need to run `npx cap sync ios` and rebuild in Xcode for the iOS build to pick up the CSS update (or just refresh if you're using the live-reload server URL).
