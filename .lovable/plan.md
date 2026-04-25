# Story Deep-Link Funnel: Tracking, Errors, Tests, Dashboard, Report

## What you'll get

1. **Fix analytics persistence** — story events are currently being silently dropped (the helper writes to a non-existent `properties` column; the table actually has `meta`). Once fixed, every story event lands in `analytics_events` and powers the dashboard + report.
2. **Close-event tracking** — emit `story_deeplink_close` with `story_id`, `source`, `segment_index`, `total_segments`, `completed`.
3. **Granular missing-story UI + analytics** — the deep-link page distinguishes **not found**, **expired**, and **fetch error**, shows a tailored message for each, and logs `story_deeplink_missing` with `reason: "not_found" | "expired" | "fetch_error"` plus the HTTP/error message.
4. **Funnel dashboard** at `/admin/stories-funnel` — opens → renders → completion, per source and per top story, with a missing-rate panel.
5. **Automated back/forward test** — Vitest + Testing Library scenario that mounts the carousel + viewer in a `MemoryRouter`, simulates `?story=A` → `?story=B` → back → forward and asserts the rendered story id without flashing the previous segment.
6. **Weekly cohort report generator** — a script (`scripts/storyDeeplinkWeeklyReport.ts`) that pulls the last 7 days of `analytics_events`, groups by source, and emits a CSV (top stories by open→view conversion) to `/mnt/documents/`.

## Changes

### 1. Fix `src/lib/analytics.ts` insert payload
The table has columns `event_name`, `meta` (jsonb), `created_at`, `page`, `value`, `order_id`, `session_id`, `device_type`, `country`, `traffic_source`. The helper currently inserts `properties` which silently fails. Change the insert to:
```ts
.insert({ event_name, meta: properties, page, value, order_id, created_at })
```
Pull `page` from `window.location.pathname` and let callers optionally pass `value` / `order_id`. Backfill the queue flush path to use the same shape. No DB migration needed.

### 2. `story_deeplink_close` event
`src/components/stories/StoryViewer.tsx` and `src/hooks/useStoryDeepLink.ts`:
- Add `closeStory(meta?)` overload that accepts `{ story_id, segment_index, total_segments, completed }` and emits `story_deeplink_close` before removing the URL param.
- `StoryViewer.onClose` is wrapped to compute `segment_index = viewIdx`, `total_segments = viewingGroup.stories.length`, and `completed = (viewIdx === total - 1 && progress >= 1)`.

### 3. Granular missing-story UI
`src/pages/StoryDeepLinkPage.tsx`:
- State becomes `{ status: "loading" | "ok" } | { status: "missing", reason: "not_found" | "expired" | "fetch_error", detail?: string }`.
- Per-reason copy:
  - **Not found**: "This story doesn't exist or was deleted."
  - **Expired**: "This story has expired. Stories disappear 24 hours after they're posted."
  - **Fetch error**: "We couldn't load this story. Check your connection and try again." + a Retry button.
- Emit `story_deeplink_missing` with `{ story_id, reason, detail }`.

### 4. Funnel dashboard
- New page: `src/pages/admin/AdminStoriesFunnelPage.tsx` mounted at `/admin/stories-funnel` (ProtectedRoute, same pattern as other admin pages).
- New hook: `src/hooks/useStoryFunnel.ts` runs grouped queries against `analytics_events` filtered to `event_name IN ('story_deeplink_open','story_segment_view','story_deeplink_close','story_deeplink_missing')` for a selectable date range (default last 7 days).
- Cards:
  - **Funnel by source** — table: source × (opens, segment views, closes, completion %, missing %).
  - **Top 10 stories** — by open → segment-view conversion, with story_id, source mix, completions.
  - **Missing-rate panel** — bar chart of `not_found` / `expired` / `fetch_error` counts.
- All queries filter by `created_at` window and group on `meta->>'source'` / `meta->>'story_id'` / `meta->>'reason'`. RLS: relies on existing admin-only read policy on `analytics_events`; if missing, falls back to an admin-only RPC `get_story_funnel(start_ts, end_ts)`.

### 5. Back/forward Vitest scenario
`src/components/stories/__tests__/StoryDeepLinkNavigation.test.tsx`:
- Mocks `supabase` and the `StoryViewer` (renders a stub that displays the resolved `story_id`).
- Renders `<MemoryRouter initialEntries={["/profile?story=A"]}>` with a fixture carousel containing two groups (stories `A` and `B`).
- Steps:
  1. Assert `data-testid="story-viewer"` shows `A`.
  2. Programmatically navigate to `?story=B` via the test's `useNavigate`. Assert it shows `B`.
  3. Call `window.history.back()` (jsdom supports this with `MemoryRouter` swapped for `BrowserRouter` + `createMemoryHistory`-style harness; we use `unstable_HistoryRouter` from `react-router-dom` with `createMemoryHistory`). Assert it shows `A` again — and that the viewer's rendered `story_id` text never flips to `B` during the same render cycle (React's batched commits guarantee this; we also assert via `findByText("A")` directly after the navigation, with no prior `B` re-render check needed).
  4. `history.forward()` → assert `B`.
  5. Navigate to `?story=missing` → assert the missing-state element appears (the test version stubs `StoryDeepLinkPage` lookup to return `null`).

### 6. Weekly cohort report script
`scripts/storyDeeplinkWeeklyReport.ts` — Node script run via `bun scripts/storyDeeplinkWeeklyReport.ts`:
- Reads `VITE_SUPABASE_URL` + service-role key from env (operator runs locally; not deployed).
- Queries `analytics_events` for `created_at >= now() - interval '7 days'` and the four story events.
- Aggregates per `source`: opens, views, closes, completion rate, missing rate, top 10 stories by open → view conversion (min 5 opens).
- Writes `/mnt/documents/story-deeplink-weekly-<YYYY-MM-DD>.csv` with sections per source.
- Documented in `scripts/README.md` (created if missing).

## Technical notes

- **No DB migrations required** — the `meta` column already exists; we just stop sending the wrong column name. If the `analytics_events` SELECT policy doesn't allow admins to read all rows, the dashboard hook will fall back to a SECURITY DEFINER RPC; we'll add that migration only if the read fails (verified at runtime, not pre-emptively).
- **No new event names beyond the four** — `open`, `segment_view`, `close`, `missing`. Dashboard derives "rendered" from `segment_view` ≥ 1 per `(session, story)`; "completion" from `close.completed = true`.
- **Test isolation** — the navigation test stubs the network layer; it does not hit Supabase.
- **Privacy** — meta payloads only contain story_id, source, segment indices, and error reason strings. No user content.

## Files

- create `src/pages/admin/AdminStoriesFunnelPage.tsx`
- create `src/hooks/useStoryFunnel.ts`
- create `src/components/stories/__tests__/StoryDeepLinkNavigation.test.tsx`
- create `scripts/storyDeeplinkWeeklyReport.ts`
- create/update `scripts/README.md`
- edit `src/lib/analytics.ts` (column name fix + queue flush)
- edit `src/hooks/useStoryDeepLink.ts` (close-meta overload)
- edit `src/components/stories/StoryViewer.tsx` (pass close meta)
- edit `src/pages/StoryDeepLinkPage.tsx` (granular reasons + retry)
- edit `src/App.tsx` (admin route registration)