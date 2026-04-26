## Problem

On `/chat`, the sticky header (back arrow, "Chat" title, group, bell) sits at `sticky top-0` with no top padding for the iOS safe area. On native iOS the status bar / Dynamic Island overlaps these buttons — the same "stuck in the safe zone" issue we just fixed on the Profile cover.

Other pages in the app (Feed, Reels, Profile, More) already use the shared token `var(--zivo-safe-top-sticky)` for the same purpose. Chat is the outlier.

## Fix (one file)

`src/pages/ChatHubPage.tsx` — sticky header wrapper around line 628–633.

1. Add `paddingTop: 'var(--zivo-safe-top-sticky)'` to the sticky header `<div>` (only when **not** embedded — embedded mode already lives inside a parent that handles spacing, matching the existing `embedded` branch).
2. Keep everything else (back/title/bell/group buttons, search, category pills) unchanged.

```text
┌──── status bar / Dynamic Island ────┐  ← safe-area-inset-top
├─────────────────────────────────────┤
│  ←   Chat              👥+   🔔     │  ← header, now pushed below safe zone
│  🔍 Search conversations…           │
│  Personal · Shop · Support · Ride   │
└─────────────────────────────────────┘
```

## Out of scope (follow-up)

A repo-wide audit found ~40 other pages using `sticky top-0` / `fixed top-0` without the safe-area token (Bookmarks, Explore, Events, Activity, Eats*, Grocery*, Drivers*, Creator*, Communities, Dating, etc.). I'll fix Chat now since that's the one you flagged. If you want, I can do a sweep of the rest in a follow-up pass.

## Acceptance

- On `/chat` at iPhone safe-area viewports the back arrow, "Chat" title, group icon, and bell sit fully below the status bar / Dynamic Island.
- Web/desktop and embedded chat (right rail on lg+) are unchanged.
- No layout shift in the conversations list, search, or category pills.