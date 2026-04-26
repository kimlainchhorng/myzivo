## Problem

In your screenshot, the iOS status bar (12:37, signal, battery) is rendering on top of the "Contacts" page header — the title and back arrow collide with the system clock.

Root cause: `src/pages/chat/ContactsPage.tsx` uses `sticky top-0` on the header but is missing the `safe-area-top` utility (which adds `padding-top: env(safe-area-inset-top)`). Other chat screens (PersonalChat, GroupChat, CallHistory, ChatContactInfo, ChatMediaGallery) already use it correctly.

A quick audit shows the same bug exists on several chat settings pages.

## Fix

1. **`src/pages/chat/ContactsPage.tsx`** — add `safe-area-top` to the sticky `<header>` so the title clears the iOS notch/status bar.

2. **Audit + fix the same issue on these pages** (all use `sticky top-0` without `safe-area-top`):
   - `src/pages/chat/settings/LoginAlertsPage.tsx`
   - `src/pages/chat/settings/PasscodeSetupPage.tsx`
   - `src/pages/chat/settings/TwoStepSetupPage.tsx`
   - `src/pages/chat/settings/PrivacySecurityPage.tsx`
   - `src/pages/chat/settings/ActiveSessionsPage.tsx`
   - `src/components/chat/ChatSearch.tsx`

3. No design changes — only the safe-area padding so the header sits below the device status bar, matching PersonalChat / GroupChat behavior.

## Technical detail

```tsx
// Before
<header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b px-4 py-3 ...">

// After
<header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b px-4 py-3 safe-area-top ...">
```

`safe-area-top` is the existing project utility that resolves to `padding-top: env(safe-area-inset-top)`, already used across the v2026 chat surfaces per the mobile-native-ux-standards memory.
