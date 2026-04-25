## Goal

Make the cover photo controls on `/profile` behave like the floating chat button: a small pill/circle pinned at the **bottom-right of the cover photo**, completely outside the top safe-area / status bar zone, and reliably tappable on iOS Capacitor.

This matches the Facebook mobile pattern (camera icon sits on the bottom-right corner of the cover, just above the avatar) and matches the placement style used by `TripChatFab` in this codebase.

## What changes (visually)

```text
┌────────────────────────── cover photo ──────────────────────────┐
│  (full-bleed, extends behind status bar)                         │
│                                                                  │
│                                                                  │
│                                                  [📷 Add cover]  │  ← new spot
└──────────────────────────────────────────────────────────────────┘
   ⬤ avatar
```

- Buttons no longer live near the top of the cover.
- They sit ~12px from the bottom edge of the cover and ~12px from the right edge.
- They never overlap the sticky header (back / name / bell / more) because they are at the opposite end of the cover.
- They never overlap the iOS status bar / Dynamic Island because they are below the safe-area zone entirely.

## What changes (technical)

File: `src/pages/Profile.tsx` (cover action block around lines 977–1013).

1. Replace the absolute-positioned `<div>` that uses
   `top: calc(var(--zivo-safe-top-sticky) + 3.25rem)` with a bottom-anchored container:
   - `className="absolute bottom-3 right-3 z-40 flex items-center gap-2 pointer-events-auto"`
   - Remove the inline `style={{ top: ... }}`.
2. Keep both controls (Reposition + Add/Change cover) but shrink to the FAB sizing used elsewhere in the app (`h-9 w-9`, icon-only when a cover already exists, pill with “Add cover” label only when there is no cover). This matches `TripChatFab`’s look.
3. Keep the `<input id="profile-cover-input">` mounted **outside** the motion/transformed cover wrapper (already done) so iOS Capacitor opens the picker reliably from `<label htmlFor>`.
4. Ensure the avatar (which sits at `-mt-11`) does not collide with the new bottom-right buttons: the avatar is left-aligned (`justify-start`), buttons are right-aligned, so there is no overlap on any viewport ≥320px. No avatar layout change needed.
5. Keep `data-disable-pull-to-refresh="true"` on the cover wrapper so taps on the buttons are never swallowed by `PullToRefresh`.
6. Keep the status-bar legibility scrim at the top of the cover unchanged (decorative, `pointer-events-none`).

No other files change. No CSS token changes. No header changes.

## Acceptance criteria

- On `/profile` at 390×607 (current preview): the “Add cover” pill is visible at the bottom-right of the cover photo, fully inside the visible cover area, and tapping it opens the native file picker.
- The button is never covered by the sticky header, status bar, Dynamic Island, or notification bell.
- After a cover is uploaded, the bottom-right shows two small circular buttons: reposition (↕) and change cover (📷).
- Pull-to-refresh still works when pulling on empty cover area but does not fire when tapping the buttons.
