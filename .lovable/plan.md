# Correct fix: make safe-area padding actually win everywhere

## Real problem

The screenshots still overlap because the previous fix did not always take effect.

Two CSS issues are happening:

1. **Tailwind padding overrides `pt-safe`**
   Headers use classes like:
   ```tsx
   className="... pt-safe px-3 py-3 ..."
   ```
   Tailwind generates `.py-3` later than our custom `.pt-safe`, so `.py-3` can override the top padding. Result: the page still only gets `py-3` instead of the iPhone-safe top padding.

2. **`safe-area-top` still uses only `env()`**
   Some chat pages use `safe-area-top`, but that utility currently resolves to `0px` when `env(safe-area-inset-top)` is unavailable in the Lovable preview / some WebView contexts. Result: no safe spacing.

External references for this class of issue confirm the same root causes: `viewport-fit=cover`, Capacitor `StatusBar.overlaysWebView`, and a reliable fallback padding are required. The project already has `viewport-fit=cover` and overlays enabled, so the missing piece is a CSS fallback that actually wins over Tailwind utilities.

## Changes

### 1. Fix the CSS utilities globally

Update `src/index.css`:

- `pt-safe` becomes `!important` and uses the existing sticky token:
  ```css
  .pt-safe {
    padding-top: var(--zivo-safe-top-sticky) !important;
  }
  ```

- `safe-area-top` gets a real fallback on small/mobile screens instead of raw `env()`:
  ```css
  .safe-area-top {
    --_safe-top: var(--zivo-safe-top-sticky);
    padding-top: var(--_safe-top) !important;
  }
  ```

- Update comments to match the behavior.

This is the core fix: all existing headers that already have `pt-safe`/`safe-area-top` will finally move below the iPhone clock.

### 2. Apply safe-area to the remaining chat headers

Add `pt-safe` or equivalent safe padding to the remaining missing chat headers:

- `src/pages/chat/ContactRequestsPage.tsx`
- `src/pages/chat/NearbyChatPage.tsx`
- `src/pages/chat/NewBroadcastPage.tsx`
- `src/pages/chat/SecretChatPage.tsx`
- `src/components/chat/ChatSecurity.tsx`
- `src/components/chat/ChatSearch.tsx`
- `src/components/chat/ChatNotificationSettings.tsx`
- `src/components/chat/ChatMiniApps.tsx`
- `src/components/chat/StickerKeyboard.tsx`

For `SecretChatPage`, remove the inline `env(...) + 10px` style and use the global safe utility so it cannot collapse to 10px.

### 3. Clean channel form spacing

`NewChannelPage` is now using a header, but the form starts too close visually after the header. Keep the safe header and ensure the body spacing is normal (`p-4`) with no title duplicated.

### 4. Verify

Run:

```bash
bunx tsc --noEmit
```

## Expected result

On iPhone/mobile preview, the page titles and back buttons will sit clearly below the status bar on:

- Chat Folders
- Privacy & Notifications
- New channel
- Contact Requests
- Nearby
- New Broadcast
- Secret Chat
- Chat Search / Security / Mini Apps / Notification Settings
- Channel pages

No more title text under the clock/battery area.