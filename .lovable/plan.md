## Engagement tracking polish + in-app analytics view

### 1. Client-side dedupe in `track()`

In `src/lib/analytics.ts`, add a small in-memory dedupe map keyed by `event_name + post_id` (when present) with a configurable TTL window (default **1500 ms**, override via `dedupeMs` in props). Repeated taps within the window are dropped before insert. The map is cleaned lazily.

```text
track("post_liked", { post_id, dedupeMs: 1500 })  // first tap inserts
track("post_liked", { post_id })                  // dropped (within window)
```

This is purely client-side — server queries stay clean even if the network retries.

### 2. Share funnel events

Replace the single `post_share_opened` with four events so you can measure drop-off:

| Event | Where |
|---|---|
| `share_button_tapped` | `onShare` in ProfileContentTabs / ProfileFeedCard |
| `share_sheet_opened` | `UnifiedShareSheet` mount effect |
| `share_completed` | success callbacks: copy-link, native share, channel click |
| `share_failed` | catch blocks in those same handlers, with `reason` |

All carry `{ post_id, author_id, surface, channel? }`.

### 3. Local-timezone date filter for analytics queries

Add a small helper `src/lib/analytics/dateBuckets.ts` that returns `{ since, until, tzOffsetMinutes }` for "today", "this week", "this month" anchored to the **device's local timezone** (uses `Intl.DateTimeFormat().resolvedOptions().timeZone` and `getTimezoneOffset()`). The query then filters `created_at >= since && < until`, and the SQL groups by `date_trunc('day', created_at AT TIME ZONE $tz)` so the daily buckets line up with what the user sees on their phone.

### 4. In-app "Top posts" analytics view

Extend `src/pages/account/AccountAnalyticsPage.tsx` with a new **"Top Posts"** section below the existing metric cards:

- Tabs: **Today / This week** (defaults to Today, uses helper from step 3).
- Sub-tabs: **Likes / Comments / Shares / Saves**.
- Pulls aggregated counts from `analytics_events` filtered to the four engagement events for posts authored by the current user, grouped by `post_id`, ordered desc, top 10.
- Each row: thumbnail (`user_posts.media_url`), short caption, count, sparkline-free (kept lightweight).
- Uses TanStack Query with 60s stale time.
- Empty state: "No engagement yet today — share a post to get started."

No DB schema changes — `analytics_events.meta->>'post_id'` is already populated by step 2 of the prior turn. We'll add a covering index recommendation as a comment but no migration needed (Supabase auto-indexes JSONB GIN by default isn't on, but volume is low enough for now).

### 5. Automated tracking-payload tests

Add `src/lib/analytics/__tests__/track.test.ts` (Vitest, already in repo):

- Mocks the supabase client `.from("analytics_events").insert()` and asserts the payload for each call.
- For each user-visible action (like, unlike, comment open, comment add, share tap, share open, share complete, bookmark, unbookmark) it imports the actual handler, fires it with a fixture post, and verifies the captured insert has:
  - correct `event_name`
  - `meta.post_id` present and equals fixture id
  - `meta.surface === "profile_feed"`
  - `meta.event_id` is a UUID
- A second describe-block covers dedupe: two rapid `track()` calls with same key insert once.

These run in CI on every push and cover both iOS and Android because they exercise the platform-agnostic `track()` core (the UI shells just call the same handler).

## Files

- `src/lib/analytics.ts` — add dedupe map + `dedupeMs` prop.
- `src/lib/analytics/dateBuckets.ts` (new) — local-tz "today" / "this week" range helpers.
- `src/components/profile/ProfileContentTabs.tsx` — split share into `share_button_tapped`; pass `surface` consistently.
- `src/components/shared/ShareSheet.tsx` (UnifiedShareSheet) — emit `share_sheet_opened`, `share_completed`, `share_failed`.
- `src/pages/account/AccountAnalyticsPage.tsx` — add Top Posts panel with Today/Week + Likes/Comments/Shares/Saves tabs.
- `src/lib/analytics/__tests__/track.test.ts` (new) — payload + dedupe tests.

## Out of scope

- No DB migrations.
- No native (Capacitor) plugin work — tracking remains pure JS, so iOS/Android share the same code path.
- No new charts/sparkline libs; keep bundle size flat.
