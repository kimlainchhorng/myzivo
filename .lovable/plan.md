# Fix: Status bar still overlapping titles on more pages

## What's wrong

The screenshots show the iOS status bar (9:55, 9:56) overlapping titles on three pages:

1. **Chat Folders** — header has `pt-safe` but the floor I set last pass (44px) is just shy of what's needed for iPhones with Dynamic Island (47–59px), so the title still touches the time.
2. **Privacy & Notifications** — same `pt-safe` issue.
3. **New channel** — has **no header at all**, no back button, no safe-area handling. The bare `<h1>New channel</h1>` sits at the very top of the page.

In addition, the entire `/channels/*` route family shares the same problem:
- `ChannelsDirectoryPage` — bare `<h1>Channels</h1>` at top, no safe-area.
- `ManageChannelPage` — bare `<h1>` and a custom "Back" link, no safe-area, inconsistent with the rest of the app.
- `ChannelPage` — relies on `<ChannelHeader>` which also has no safe-area padding.

## Fix

### 1. Increase `pt-safe` floor to 47px

In `src/index.css`, bump the `pt-safe` floor from 44px to 47px (Apple's official Dynamic Island/notch reserve). This removes the last sliver of overlap on Chat Folders, Privacy & Notifications, and the 16+ other pages that already use `pt-safe`.

```css
.pt-safe {
  padding-top: max(env(safe-area-inset-top, 0px), 47px);
}
```

### 2. Add a proper safe-area header to all four channel pages

Apply the standard chat-page header pattern (sticky, blurred, back button, `pt-safe`) to:

- **`NewChannelPage.tsx`** — replace the bare `<h1>` with a sticky header containing a back button (using `useSmartBack("/channels")`) and the title "New channel".
- **`ChannelsDirectoryPage.tsx`** — convert the title row into a sticky `pt-safe` header with the title "Channels" and a `+` icon button (replacing the existing "New" button) for parity with Chat Folders.
- **`ManageChannelPage.tsx`** — replace the inline "Back" link with the standard sticky header (back button + "Manage @handle" title).
- **`ChannelPage.tsx`** — wrap `<ChannelHeader>` so the channel hero respects safe-area, OR add a thin top spacer of `pt-safe` above it.

Each header follows the proven pattern already used by `CustomFoldersPage`:

```tsx
<header className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border/40 pt-safe px-3 py-3 flex items-center gap-2">
  <button onClick={goBack} className="p-1.5 rounded-full hover:bg-muted/60">
    <ChevronLeft className="w-5 h-5" />
  </button>
  <h1 className="text-base font-semibold flex-1">…</h1>
</header>
```

### 3. Verify

- Run `bunx tsc --noEmit` to confirm no type regressions.
- Visually re-check the three screenshots' pages — title should sit ~3–6px below the status bar, never under it.

## Out of scope

- No backend, routing, or data changes.
- No restyling beyond adding the standard header pattern.
- No changes to pages already verified in the previous pass.
