

# App Store Rejection Fix Plan (v1.0.1 → v1.0.2)

Apple identified **3 issues**. Here is what is wrong and how to fix each one.

---

## Issue 1: OAuth "Sign in with Apple" Redirects to Safari (Guideline 2.1a)

**Root cause**: `signInWithOAuth()` uses the default Supabase behavior which opens the system browser (Safari). On a native Capacitor app, this ejects the user out of the app, and the redirect back fails because there is no universal link or custom URL scheme configured to return to the app.

**Fix**: On native platforms, use `skipBrowserRedirect: true` so Supabase returns the OAuth URL instead of opening it. Then open that URL with an **in-app browser** (via `@capacitor/browser` plugin) so the user stays inside the app experience. After auth completes, the redirect to `https://myzivo.lovable.app/auth-callback` loads inside the Capacitor WebView automatically.

**Changes**:
- `src/contexts/AuthContext.tsx` — when `Capacitor.isNativePlatform()`, pass `skipBrowserRedirect: true`, capture the returned URL, and open it with `Browser.open({ url })` from `@capacitor/browser`.
- Install `@capacitor/browser` as a dependency.
- `capacitor.config.ts` — add `server.url` pointing to the published app URL so the WebView can intercept the redirect back.

---

## Issue 2: Cookie Consent Still Visible on Native (Guideline 5.1.2i)

**Root cause**: The cookie consent banner is already hidden on native builds, but Apple is still flagging cookie-related content. The **Cookie Policy page** (`/cookies`) is still accessible in-app and contains cookie toggles including "Marketing Cookies" and "Analytics Cookies" — Apple sees this as evidence of tracking. Additionally, the cookie consent component still references "advertising" cookies.

**Fix**:
- In `CookieConsent.tsx`, remove the `advertising` cookie category entirely (ZIVO does not do ad tracking).
- On native builds, redirect `/cookies` to home or hide tracking-related categories on that page.
- Update the cookie policy page to clarify that ZIVO does **not** track users on Apple devices and does not use cookies for advertising/tracking purposes.

---

## Issue 3: Camera Purpose String Too Vague (Guideline 5.1.1ii)

**Root cause**: The current string is `"ZIVO needs camera access to take a profile photo."` — Apple requires a more specific explanation with an example of how the data is used.

**Fix**: Update `ios/App/App/Info.plist`:
- `NSCameraUsageDescription` → `"ZIVO uses your camera to take a profile photo that is displayed on your account and visible to restaurant partners when you place orders."`
- `NSPhotoLibraryUsageDescription` → `"ZIVO accesses your photo library so you can select an existing photo to use as your profile picture on your account."`

---

## Summary of Files to Change

| File | Change |
|------|--------|
| `package.json` | Add `@capacitor/browser` dependency |
| `src/contexts/AuthContext.tsx` | Use `skipBrowserRedirect` + in-app browser on native |
| `capacitor.config.ts` | Add `server` config with published URL for redirect interception |
| `ios/App/App/Info.plist` | Update camera & photo library purpose strings |
| `src/components/common/CookieConsent.tsx` | Remove `advertising` category |
| `src/pages/legal/CookiePolicy.tsx` | Add native-aware messaging, hide tracking categories on native |

