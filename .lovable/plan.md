## Problem

The Channels Directory page (`/channels`) shown in the screenshot has no back button in its sticky header — users on mobile have no way to return without using the bottom nav. The Channel detail page (`/c/:handle`) has the same issue, while sibling pages (NewChannel, ManageChannel) already use a `ChevronLeft` back button pattern.

## Changes

### 1. `src/pages/channels/ChannelsDirectoryPage.tsx`
Add a `ChevronLeft` back button at the start of the sticky header, calling `navigate(-1)` (with a fallback to `/feed` if there is no history). Match the styling used in `NewChannelPage.tsx` / `ManageChannelPage.tsx` (rounded ghost button, `w-5 h-5` icon) so the design stays consistent.

### 2. `src/pages/channels/ChannelPage.tsx`
Add the same back button into its top header so users can leave a channel detail view on mobile without relying on the browser back gesture.

### Pattern used (consistent with existing channel pages)

```tsx
<button
  onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/feed"))}
  className="p-2 -ml-2 rounded-full hover:bg-muted"
  aria-label="Back"
>
  <ChevronLeft className="w-5 h-5" />
</button>
```

No other behavior changes; layout, search, and "+ New" button remain in place.