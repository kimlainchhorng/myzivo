I found two likely causes for why it still looks wrong and why Add Cover is hard/impossible to click:

1. `capacitor.config.ts` says the app should be edge-to-edge, but `src/main.tsx` overrides it at runtime with `StatusBar.setOverlaysWebView({ overlay: false })`. That prevents the cover from truly crossing into the status bar area on iOS.
2. The cover upload uses a hidden file input triggered by `ref.click()`. On mobile/iOS this can be unreliable when nested inside animated/transformed wrappers, so the Add Cover button may not open the picker.

Plan to fix it:

1. Make the native status bar match the Facebook-style cover behavior
   - Update the runtime Capacitor status bar setup so iOS keeps `overlay: true` instead of forcing `false`.
   - Keep status-bar icon color readable over the cover.

2. Rebuild the profile cover top area like the Facebook reference
   - Cover image starts at the very top of the screen and fills the status/safe-area region.
   - Buttons stay inside the safe area, not under the clock/battery.
   - Remove the current negative-margin workaround and use a cleaner full-bleed mobile cover height: `cover height + safe top`.
   - Keep desktop layout unchanged.

3. Fix Add Cover click on mobile
   - Replace the hidden-input/ref-click pattern for cover upload with a real clickable `<label>` tied to the file input.
   - Position the actual input/label above overlays with proper `z-index`, so tapping the camera/image button always opens the file picker.
   - Apply the same reliability pattern to the avatar camera button if needed.

4. Reduce click blockers in the cover area
   - Disable pointer events on decorative cover layers, gradients, and scrims.
   - Keep only real controls clickable.
   - Make PullToRefresh ignore touches that start on file-upload controls.

5. Verify after implementation
   - Test `/profile` in mobile viewport.
   - Confirm the cover visually reaches the top like Facebook.
   - Confirm action buttons are below the status bar.
   - Confirm tapping Add/Change Cover opens the file picker.

After approval, I’ll apply these changes. For the native iPhone/Android app, you will also need to pull the updated project and run `npx cap sync ios` / `npx cap sync android` so the native status bar change is included.