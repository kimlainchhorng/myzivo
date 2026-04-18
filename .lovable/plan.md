

## Problem
On mobile, the "Set up instant payouts" button opens the embedded Stripe modal, which tries to load Stripe's `connect.js` script. In Lovable preview, in-app webviews (Instagram/Facebook/TikTok), and many mobile Safari/Chrome contexts, that script is blocked or throws an unhandled rejection. Users see "Couldn't load Stripe" / runtime error and have to tap a second "Continue to Stripe" button.

I cannot log in with the credentials you shared (security policy — never use user passwords). But the bug is environment-level, not auth-level, and the fix doesn't need a logged-in test.

## Root Cause
Stripe Connect Embedded Components are not designed for mobile webviews or sandboxed iframes. The embedded flow should only be attempted on a true desktop browser. Everywhere else, we should go straight to the hosted Stripe onboarding URL (the redirect flow that already works).

## Fix

**1. `src/components/wallet/StripeConnectPayoutCard.tsx`** — Detect environment and route accordingly:
- Add a small `shouldUseEmbedded()` helper: returns `true` only if desktop viewport (`window.innerWidth >= 1024`), not in Capacitor native, not in an in-app browser (FB/IG/TikTok/Line UA), and not inside the Lovable preview iframe (`window.self !== window.top` and host contains `lovableproject.com`).
- "Set up instant payouts" button: if `shouldUseEmbedded()` → open embedded modal (current behavior). Otherwise → call `onboard.mutate(country)` directly (same-tab redirect to Stripe — this already works on mobile).
- "Manage" link: same routing logic.

**2. `src/components/wallet/StripeEmbeddedOnboarding.tsx`** — Tighten the fallback so users never see the error screen:
- When `blocked` is detected, don't render the error UI at all — automatically trigger `onboard.mutate(country)` and close the modal. The redirect flow takes over silently.
- Keep the script-loading pre-check and the async rejection swallow as a safety net.

**3. No edge function changes needed.** `connect-onboard` already returns a working `accountLinks.create` URL with proper `return_url` back to `/wallet?connect=done`, and `StripeConnectPayoutCard` already handles that param to refresh status.

## Result
- Mobile users: tap "Set up instant payouts" → instantly redirected to Stripe's hosted onboarding (works everywhere) → returned to `/wallet` with status refreshed.
- Desktop users on the published site: still get the in-app embedded experience.
- Lovable preview: skips embedded, uses redirect — no more error screens.

## Files Changed
- `src/components/wallet/StripeConnectPayoutCard.tsx` — environment detection + conditional routing
- `src/components/wallet/StripeEmbeddedOnboarding.tsx` — auto-fallback to redirect when blocked (no error UI)

