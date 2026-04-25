I’ll complete the profile cover fix so it matches the Facebook-style screenshot and the Add Cover camera is reliably clickable.

What I’ll change:
1. Remove the cover upload/edit controls from the top-right/safe-area overlay entirely.
2. Keep only navigation controls in the top header: back, profile/name, bell, more.
3. Move cover actions into the cover photo layer at the bottom-right, clear of the status bar and header.
4. Make the cover camera/edit controls match the screenshot: compact circular buttons over the cover, not blocking the top status area.
5. Increase the cover action layer z-index and pointer handling so taps go to the button/label, not the cover image, gradient, or pull-to-refresh wrapper.
6. Keep the hidden file input outside transformed/animated containers so iOS/Capacitor can open the picker from a native label tap.
7. Verify the profile cover area at the current mobile viewport size and adjust spacing so the avatar overlap and cover controls do not collide.

Technical details:
- Main target: `src/pages/Profile.tsx`.
- I’ll separate “header controls” from “cover photo actions” so they cannot overlap.
- I’ll use `pointer-events-none` only for decorative cover layers and `pointer-events-auto` on actual controls.
- I’ll keep safe-area behavior: the cover image remains full-bleed behind the status bar, while interactive buttons stay inside tappable zones.
- If needed, I’ll also adjust `PullToRefresh` selectors only if the cover upload label still conflicts with touch gestures.