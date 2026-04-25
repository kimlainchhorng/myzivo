I can see the problem now from the mobile profile screenshot: the cover image is full-width, but the cover edit/add buttons are placed at the top-right of the cover, underneath the fixed profile header layer. That makes them look unlike Facebook and can block taps, especially on iPhone/Capacitor.

Plan:

1. Move cover controls to the Facebook position
   - Put the cover edit/add button at the bottom-right of the cover photo, not at the top safe-area.
   - Keep the cover photo itself full-bleed at the top.
   - Keep header buttons (back, avatar, bell, menu) in the safe area only.

2. Fix the click issue
   - Remove the cover upload control from the sticky header’s touch zone.
   - Give the cover controls their own higher, isolated interactive layer.
   - Keep decorative gradients and cover image wrappers as `pointer-events-none` so they cannot steal taps.

3. Make the upload control more reliable on mobile
   - Keep the native `<label htmlFor="profile-cover-input">` upload pattern.
   - Move the hidden file input outside the transformed/parallax cover area where possible, so iOS does not swallow the file-picker tap.
   - Reset the input value after upload so choosing the same photo again works.

4. Adjust the visual layout to match Facebook more closely
   - Cover photo: visual layer reaches the very top / safe-area region.
   - Header: floats over the cover only for navigation, not for cover editing.
   - Cover edit button: small camera/image button over the lower-right of the cover, clear of avatar and header.
   - If there is no cover photo, show a clear “Add cover photo” button inside the lower part of the cover, not under the top bar.

5. Test after implementation
   - Log in with the test account and open `/profile` at the same mobile viewport.
   - Confirm the cover starts at the top, the header stays safe, and the cover upload button is visible/clickable.
   - Confirm the button is no longer underneath the sticky header layer.

Files to update:
- `src/pages/Profile.tsx`
- Possibly a small safe-area/CSS adjustment in `src/index.css` only if needed