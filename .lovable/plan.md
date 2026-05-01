# Replace mock data on the Live page with real data

`src/pages/LiveStreamPage.tsx` (3,453 lines) currently shows ~40 hard-coded sections (Maya Chen, DiamondKing88, etc.). The only section already wired to real data is the main `live_streams` grid. Everything else under the **Community / Discover / Daily / Battles / Categories** tabs is mock.

This plan converts the page in two layers: (1) wire sections that already have backing tables to real queries, and (2) hide sections with no real data until those features ship.

## Layer 1 — Sections to wire to real data (tables already exist)

| Section (line) | Source table / query |
|---|---|
| Recently Watched (1804) | `live_viewers` joined to `profiles` for the current user — last 5 distinct hosts watched, ordered by `joined_at desc`. Live flag from `live_streams.status='live'`. |
| Top Gifters — This week (1848) | `live_gifts` aggregated by `sender_id` over last 7 days, sum of `coin_value`, top 5. Join `profiles` for name/avatar. |
| Top Gifters — All-time leaderboard (referenced by "See all" → `/leaderboard`) | Same query without time window. |
| Featured / Trending hosts grids (1280, 2049, 2092, 2275, 2325, 2422, 2698, 3233, 3309) | All driven by `live_streams` filtered by `status`, ordered by `viewer_count`, `started_at`, etc. Reuse the existing `useLive` displayItems, just sort/slice for each section. |
| Floating hearts / chat preview (already real, lines 199–211, 740) | No change. |

## Layer 2 — Sections to hide until backed by real features

These have **no DB tables** today. Hide their UI behind a `FEATURE_FLAGS` check (default `false`) so the page stays clean and we can re-enable them per feature when the backend ships:

- Karaoke Rooms (1898)
- Birthday Celebrations (1941)
- PK Battles (1434)
- Voice Rooms (1500, 1534)
- Spotlight / Awards / Highlights blocks (1619, 1664, 1705, 2152, 2193, 2369, 2421, 2484, 2522, 2563, 2610, 2656, 2747)
- Coming Soon "Daily" section with hardcoded "2 days / 3 days / 1 week" chips visible in the screenshot

Each block gets wrapped:

```tsx
{FEATURE_FLAGS.liveKaraoke && ( /* existing markup */ )}
```

Centralised flags file: `src/config/liveFeatureFlags.ts`.

## Layer 3 — Empty states

For the wired sections (Recently Watched, Top Gifters), if the real query returns 0 rows, render a small empty state ("No watch history yet" / "Be the first to send a gift") instead of hiding the section, so the page doesn't collapse for new accounts.

## Files touched

- **New:** `src/config/liveFeatureFlags.ts` — single source of truth for which mock-only blocks are visible.
- **New:** `src/hooks/useRecentlyWatchedLive.ts` — query last 5 hosts the current user watched.
- **New:** `src/hooks/useTopLiveGifters.ts` — top 5 gifters this week.
- **Edited:** `src/pages/LiveStreamPage.tsx` —
  - Replace inline arrays in Recently Watched (1815–1820) and Top Gifters (1860–1865) with the new hooks.
  - Wrap the 13+ feature-flagged blocks with `FEATURE_FLAGS.*` checks.
  - Remove the hardcoded "2 days / 3 days / 1 week" Daily chips (lines around 540–560 in the Daily tab) — they're not data, just placeholder labels.

## Out of scope

- Building Karaoke / Birthdays / PK Battles backend tables — separate feature work.
- Migrating the in-stream overlay (gifts/comments) — already real.
- The `/leaderboard` destination page — reuse existing if present.

## Result

Live page will only show real, working sections: live stream grid, Recently Watched (real history), Top Gifters (real coin totals). Aspirational sections stay in code behind a flag, ready to flip on once their backend lands.
