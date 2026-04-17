

## Goal
Show the paired store's profile photo + name in the GoLivePage **LIVE** screen header — both on the desktop embedded preview ("Go Live Studio") and on the phone — so once confirmed and broadcasting, the streamer (and the desktop viewer) sees which shop is going live.

## Where to change

`src/pages/GoLivePage.tsx` only — the LIVE-phase top bar (around lines 538–561).

The component already computes `hostDisplayName` and `hostAvatarUrl` (lines 110–115) from the paired identity, but these values are not rendered in the LIVE header. They're only used when inserting the `live_streams` row.

## Plan

1. **Add a host identity chip** to the LIVE top bar, placed right after the LIVE pill and before the viewer/heart/coin chips:
   - Small `Avatar` (h-6 w-6) using `optimizeAvatar(hostAvatarUrl, 48)` with fallback initial
   - `hostDisplayName` truncated (max ~14 chars) in white text, semibold, 11px
   - Wrapped in a `bg-black/40 backdrop-blur-sm rounded-full px-2 py-1` chip to match existing style
   - Add a subtle `Paired` micro-badge (emerald dot) when `isPaired`, so the user can tell the device is acting via QR pairing

2. **Tighten the right-side cluster** so the new chip fits at narrow widths (the embedded preview in StoreLiveStreamSection is only ~400px wide):
   - Hide the heart/coin counters at `< 360px` container width using `hidden xs:flex` style logic (Tailwind `@container` not in stack — fall back to conditional class based on chip presence: keep eye + identity always visible, drop heart+coin if needed). Simplest: keep all chips, reduce gaps from `gap-2` to `gap-1.5` and stat chip padding from `px-2` to `px-1.5`.

3. **Title row enhancement** (line 564–566): below the top bar, show the host name a second time only if the avatar didn't fit (skip — covered by chip).

4. **Setup-phase preview**: also surface the avatar + name in the `setup` phase header so the streamer sees identity *before* tapping "Go Live as …". A small `Avatar + name + "Paired device"` row above the title input.

## Technical details

- Reuse existing `Avatar`, `AvatarImage`, `AvatarFallback` from `@/components/ui/avatar`
- Reuse existing `optimizeAvatar` util (already imported)
- Use Lucide `Store` icon as fallback when avatar URL is null
- No new state, no new queries — `paired` + `hostDisplayName` + `hostAvatarUrl` already exist
- No backend / migration changes needed

## Out of scope (mention only)

- Realtime sync of avatar changes from desktop to phone after pairing — already handled by the on-mount re-validation effect (lines 85–108) which refreshes `paired.store_avatar_url` from `getPairedSessionByToken`.

