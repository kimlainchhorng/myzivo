The screenshot confirms the target: the cover photo should touch the top/left/right edges of the app content area, while the cover buttons stay below the notch/status area.

Plan:

1. Fix the Profile page wrapper
   - Remove `safe-area-top` from the outer Profile wrapper because it pushes the whole page down, including the cover.
   - Keep bottom safe-area spacing so the bottom navigation/home indicator remains safe.

2. Make the cover photo full-bleed
   - Let the cover container start at the very top of the app viewport.
   - Make the cover image/gradient fill the full container with `absolute inset-0`, `w-full`, `h-full`, and `object-cover`.
   - Avoid applying `.pt-safe`, `.safe-area-top`, or top padding to the cover visual layer.

3. Keep only the buttons inside the safe zone
   - Keep the reposition/change-cover buttons using `top: calc(var(--zivo-safe-top) + ...)` so they sit below the status/notch area.
   - Keep the sticky profile header using the safe-top token.
   - If needed, increase the cover buttons’ top offset slightly so they do not overlap the phone status UI.

4. Preserve the visual height
   - Because removing wrapper safe padding changes the layout, adjust the cover height to include the safe-area top visually, so the cover still looks tall and full like the screenshot.
   - Keep the avatar overlap and profile content alignment natural below the cover.

5. Update the safe-area note
   - Add a Profile example to the developer doc: “cover photo = full-bleed visual layer, no safe-area class; cover buttons/header = interactive layer, use safe-area offset.”

Important limitation:
The black top area in your screenshot that shows the time and “Facebook” is Facebook’s in-app browser chrome. A website cannot draw behind that black native browser bar. This fix will make the cover fill the full available ZIVO app/webview area underneath that native bar, and in the real Capacitor app/PWA it will extend edge-to-edge as much as the platform allows.