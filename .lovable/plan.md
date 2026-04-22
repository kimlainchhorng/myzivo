

# Maintenance filters + Out-of-Service ticket prompt + 24h hours polish

Three focused improvements to the lodging stack.

---

## 1. Maintenance board — search & filters

`src/components/admin/store/lodging/LodgingMaintenanceSection.tsx`

Add a sticky filter bar above the ticket list:

- **Search input** (left, flex-1) — matches `title`, `notes`, `room_number`, `assignee_name` (case-insensitive substring).
- **Room** select — populated from `useLodgeRooms(storeId)` + an "All rooms" option.
- **Assignee** select — distinct `assignee_name` values from current tickets + "All" + "Unassigned".
- **Category** select — `general / plumbing / electrical / hvac / furniture / appliance / other` + "All".
- **Priority** select — `urgent / high / normal / low` + "All".
- **Date range** — two compact date inputs (`from`, `to`) filtering on `reported_at`.
- **Sort** select — Newest / Oldest / Priority (urgent→low) / Status (open→done).
- **Reset** ghost button — clears all filters.

State: one `filters` object held in `useState`. Filtering is fully client-side over the existing query result (small dataset, no extra fetches). Result count badge: "Showing X of Y".

Existing status chip strip (Open / In Progress / Blocked / Done) stays — it AND-combines with the new filters.

Persist filters in `sessionStorage` keyed by `lodge-maint-filters:${storeId}` so navigating away and back keeps context.

---

## 2. "Open ticket?" prompt from Housekeeping

`src/components/admin/store/lodging/LodgingHousekeepingSection.tsx`

When `change(id, "out_of_service")` succeeds:

1. Fire the existing `toast.success` as today.
2. Immediately open a new lightweight `<AlertDialog>` (shadcn) titled **"Open a maintenance ticket?"** with body: *"Room {room_number} was marked Out of Service. Create a maintenance ticket so the issue is tracked and assigned."*
3. Buttons: **"Not now"** (cancel) and **"Create ticket"** (primary).
4. On confirm, call `useLodgeMaintenance(storeId).upsert.mutateAsync({ store_id, room_id, room_number, title: \`Room ${room_number} — Out of service\`, category: "general", priority: "high", status: "open", notes: "Auto-created from housekeeping" })`.
5. On success, toast "Ticket created" with an action button **"View"** that calls `navigate(\`?tab=lodge-maintenance\`)` (uses existing `useSearchParams`-driven tab routing in `AdminStoreEditPage`).

State: `const [pendingOOS, setPendingOOS] = useState<{ id: string; roomId: string|null; roomNumber: string|null } | null>(null)` set inside the `change` handler before opening the dialog.

No DB schema changes — uses existing `lodge_maintenance` table and `useLodgeMaintenance` hook.

---

## 3. Operating Hours — disable close inputs + consistent 24h rendering

**Admin form** (`src/pages/admin/AdminStoresPage.tsx` — Operating Hours grid)

For each day row:
- When `day.is24h === true`:
  - Add `disabled` to both Open and Close `<select>` / time inputs.
  - Add `opacity-50 cursor-not-allowed` classes.
  - Replace the time inputs visually with a single muted label **"Open 24 hours"** (keep the underlying values stored as `12:00 AM` → `11:30 PM` so legacy renderers still work).
- When `day.closed === true`: keep existing disabled/closed treatment AND force the 24h toggle off (mutually exclusive — toggling Closed clears `is24h`, toggling 24h clears `closed`).
- Add a small helper text under the grid: *"Toggle 24h for always-open days. Toggle Closed to mark a day off."*

**Public profile** (`src/pages/StoreProfilePage.tsx` — hours renderer)

- Centralize the per-day label in one helper `formatDayHours(day)`:
  - `day.closed` → "Closed"
  - `day.is24h` → **"Open 24 hours"**
  - else → `${open} – ${close}`
- Use the helper in both the collapsed "today" pill and the expanded weekly list so wording is identical everywhere.
- When **all 7 days** are `is24h`, the collapsed pill shows just **"Open 24 hours"** (no day name) for a cleaner header.

---

## Files

**Edited only — no new files, no migration**

- `src/components/admin/store/lodging/LodgingMaintenanceSection.tsx` — filter bar, sort, sessionStorage persistence.
- `src/components/admin/store/lodging/LodgingHousekeepingSection.tsx` — AlertDialog + auto-create ticket flow.
- `src/pages/admin/AdminStoresPage.tsx` — disable inputs when `is24h`, mutual exclusion with `closed`, helper text.
- `src/pages/StoreProfilePage.tsx` — `formatDayHours` helper + all-24h collapsed pill.

## Build order

1. Maintenance filter bar + sort + sessionStorage.
2. Housekeeping → Maintenance auto-prompt (AlertDialog + upsert + toast action).
3. Operating Hours admin: disable inputs + mutual exclusion with Closed.
4. Public profile `formatDayHours` helper + all-24h pill polish.

## Out of scope

- Saved filter presets ("My open urgent tickets") — single ad-hoc filter set only.
- Server-side filtering / pagination — dataset is small per store.
- Per-day custom 24h close time other than `11:30 PM` placeholder.

