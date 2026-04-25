## Goal
Replace the 4 quick-action buttons on the mobile Profile page (currently **Edit / Share / Insights / Settings**) with a more business-focused set:

1. **Shop** — opens the user's shop dashboard (only shown if they have one)
2. **Employees** — opens the existing employees management page
3. **Mode** — switch mode control (placeholder, designed for future expansion)
4. **Monetization** — opens the monetization page

## Where
File: `src/pages/Profile.tsx` — lines 1166–1183 (the `lg:hidden mt-3 grid grid-cols-4 gap-2` block).

## New button set

| Button | Icon (lucide) | Action | Route |
|---|---|---|---|
| Shop | `Store` | navigate (shown only if user has a shop) | `/shop-dashboard` |
| Employees | `Users` | navigate | `/app/shop/employees` (existing `ShopEmployeesPage`) |
| Mode | `Repeat` (or `ArrowLeftRight`) | open a bottom sheet ("Switch Mode") with future-ready list (Personal, Business, Driver, Shop, etc.) | sheet |
| Monetization | `DollarSign` (or `Coins`) | navigate | `/monetization` |

Visual treatment stays identical to the current 4-button row (rounded-2xl, border, muted bg, primary icon, 11px label) so the look matches the screenshot.

## Mode Switch sheet (lightweight, future-ready)
A simple `Sheet` opened from the Mode button, showing a vertical list of mode rows. Initial entries:
- Personal (active by default)
- Business
- Driver
- Shop Partner

Each row is a button styled like the existing share-sheet rows. Selecting one persists to `localStorage` (`zivo:active_mode`) and closes the sheet — actual routing per mode can be wired up later. This keeps the surface ready for "add on more in there" without locking design now.

## Shop visibility
Use the same condition already used elsewhere (presence of a shop record / role). If unknown at this layout, render the Shop button always but route to `/shop-dashboard` which already handles the "no shop" empty state — simplest and consistent. (Confirmed `/shop-dashboard` exists in `MorePage.tsx`.)

## What we are removing
- Edit, Share, Insights, Settings buttons from this 4-grid only. Their entry points remain available elsewhere (Settings via `/more`, Share via existing share entry points, Edit via profile edit, Insights via `/account/analytics`) so no functionality is lost.

## Out of scope
- No DB or schema changes
- No new routes created (all targets already exist)
- No changes to desktop layout (this row is `lg:hidden` only)
