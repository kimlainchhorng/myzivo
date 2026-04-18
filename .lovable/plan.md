
Goal: fully finish the mobile signup fix so the Create Account email field can be tapped and typed into on iPhone/mobile, then verify it with a real fill test.

Plan

1. Harden the auth page itself
- Update `src/pages/Login.tsx` to make the signup form fully “flat” on touch devices, not just partly flat.
- Remove/disable any remaining motion/transform/backdrop behavior on the mobile auth container that can confuse iOS hit-testing.
- Ensure every decorative auth layer is explicitly `pointer-events-none`.
- Keep only the actual form controls interactive.

2. Make the signup email field mobile-safe
- Add native mobile-friendly attributes to the signup email input:
  - `inputMode="email"`
  - `autoCapitalize="none"`
  - `autoCorrect="off"`
  - `spellCheck={false}`
- Do the same for related auth inputs where needed so iOS uses the correct keyboard and does not interfere with entry.
- If needed, simplify the signup input wrapper so the input sits above icons and visual effects with a clean stacking order.

3. Suppress any remaining global blockers on auth routes
- Review global overlays already mounted in `App.tsx`, especially:
  - `PWAInstallBanner`
  - `InAppBrowserInterstitial`
  - `PWAUpdatePrompt`
- Hide non-essential overlays on auth routes the same way cookie consent was hidden, so nothing can sit above `/login`, `/signup`, `/verify-*`, `/forgot-password`, or `/reset-password`.

4. Retest the exact broken flow
- Open the mobile signup route: `/login?mode=signup`
- Tap directly into the signup email field
- Type the exact address you gave: `abexpress68@gmail.com`
- Confirm:
  - caret appears
  - keyboard stays open
  - text entry works normally
  - field keeps focus
  - password fields also still work
  - no banner/sheet/overlay blocks taps

5. Final cleanup if anything still blocks taps
- If mobile typing still fails after the above, I’ll do one more pass to temporarily strip the auth card down to a plain mobile container, verify input works, then reintroduce visuals safely.
- That guarantees the fix is completed instead of stopping at a partial patch.

Files likely involved
- `src/pages/Login.tsx`
- `src/components/shared/PWAInstallBanner.tsx`
- `src/components/shared/InAppBrowserInterstitial.tsx`
- `src/components/shared/PWAUpdatePrompt.tsx`
- possibly `src/components/common/CookieConsent.tsx` only if route guards need aligning

Technical details
- The pattern in the code suggests this is most likely a mobile hit-testing / overlay / transform stacking issue, not a validation issue.
- The signup screen still has layered visuals and app-level overlays that can interfere with focus on iOS even when the input itself looks correct.
- The fix should prioritize reliable native text entry over decorative effects on touch devices.

Definition of done
- On mobile signup, I can tap the email box and successfully type `abexpress68@gmail.com` end-to-end without the field losing focus or being blocked.
