

## Plan: Style the interstitial logo as an app icon

The screenshot shows the logo currently displays without a container. The user wants it styled like an actual app icon — dark background, rounded corners, like their iOS app icon.

### Changes

**File: `src/components/shared/InAppBrowserInterstitial.tsx`**

Wrap the logo image in a container styled as an app icon:
- Add a dark background (`bg-[#1a1a1a]` or `bg-black`)
- Rounded corners with `rounded-[22%]` (iOS app icon radius)
- Add subtle shadow and padding
- Size ~28x28 (w-28 h-28) with the logo image inside with padding

This single change will make the logo presentation match the native app icon look shown in the screenshot.

