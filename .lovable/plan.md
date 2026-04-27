# Fix: Status bar overlapping page titles across chat & account pages

## Problem

On iOS (and in the Lovable preview iframe on mobile), the status bar (e.g. "9:49") overlaps page titles like "Chat Folders". This affects every sub-page that uses our recently added `pt-safe` utility on a sticky header.

Root cause:
- `pt-safe` resolves to `max(env(safe-area-inset-top, 0px), 12px)`.
- In the Lovable preview iframe and in some webview contexts, `env(safe-area-inset-top)` returns `0px`, so the padding falls back to a tiny 12px floor — not enough to clear the iOS status bar (~44–59px).
- The codebase already has a better, proven utility (`safe-area-top`, used by `AccountSettingsPage`) that adds true safe-area inset on top of Tailwind padding (`pt-3`, `py-3`, etc.).

## Fix

### 1. Raise the floor on `pt-safe` (one-line CSS change)

In `src/index.css`, change the floor from `12px` to `max(env(safe-area-inset-top, 0px), 44px)`. This guarantees a minimum of 44px (standard iOS status bar height) when the env() var isn't reported, while still honoring the real notch/Dynamic Island value when available.

```css
.pt-safe {
  padding-top: max(env(safe-area-inset-top, 0px), 44px);
}
```

This single change instantly fixes every page we updated in the last pass (18+ chat sub-pages) without touching them again.

### 2. Audit remaining sticky headers without any safe-area handling

Scan the rest of `src/pages/` for `sticky top-0` headers that use neither `pt-safe` nor `safe-area-top`, and add `safe-area-top` to them. Likely candidates from the search:
- `src/pages/account/WalletPage.tsx`
- `src/pages/account/ReferralsPage.tsx`
- `src/pages/account/GiftCardsPage.tsx`
- `src/pages/account/PromosPage.tsx`
- `src/pages/account/NotificationSettings.tsx`
- `src/pages/account/ActivityLogPage.tsx`
- `src/pages/account/ProfileEditPage.tsx`
- `src/pages/account/PrivacySettingsPage.tsx`
- `src/pages/account/AccountSecurity.tsx`
- `src/pages/account/AccountAnalyticsPage.tsx`
- `src/pages/account/FavoritesPage.tsx`
- `src/pages/account/AccountExportPage.tsx`
- `src/pages/account/AddressesPage.tsx`
- `src/pages/account/LinkedDevicesPage.tsx`
- `src/pages/account/LegalPoliciesPage.tsx`
- `src/pages/account/LoyaltyPage.tsx`
- `src/pages/account/BusinessInvoicesPage.tsx`
- `src/pages/account/VerificationRequestPage.tsx`
- `src/pages/account/GiftCardSuccessPage.tsx`
- `src/pages/account/ScanDevicePage.tsx`
- `src/pages/account/LinkDevicePage.tsx`

Each gets the same minimal change: add `safe-area-top` to the sticky header's class list (it composes with existing `py-*` padding correctly).

### 3. Verify with build check

Run `bunx tsc --noEmit` to confirm no regressions.

## Out of scope

- No changes to `safe-area-top` semantics (it works as designed for Capacitor native).
- No changes to bottom-safe utilities or the home indicator handling.
- No changes to the navigation logic added in the previous pass — only the visual top-padding fix.

## Result

After this change, every sticky header — whether in a Capacitor native build, a PWA, mobile Safari, or the Lovable preview iframe — will reserve at least 44px of clearance above the title, eliminating the status-bar overlap shown in the screenshot.
