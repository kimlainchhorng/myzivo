

## What's happening

Your screenshot shows the **Rooms & Rates** section in its empty state — "No rooms yet" with an "Add First Room" button. This is **not a bug**. It simply means this property (`store_id: 7322b460…65fab`) has **zero rows in the `lodge_rooms` table**.

The Hotels & Resort upgrade we just shipped (bed builder, fees, child policy, property profile, multi-step booking) added new fields and a new admin tab — but it does **not** auto-create any rooms. You still need to add rooms manually for each property.

## How to fix (no code change needed)

1. Tap the green **+ Add Room** button (or "Add First Room").
2. Fill in at least: **Name** (e.g. "Deluxe Sea View"), **Base rate**, **Max guests**, **Units total**.
3. Use the new **Bed configuration builder** to add beds (drives "Sleeps X" automatically).
4. Optionally fill: View / Floor / Wing, Child policy, Tax & fee breakdown, Add-ons (30+ presets ready).
5. Save → the room appears in the list and becomes bookable on the public store page.

## If you expected rooms to already exist

Possible reasons the list is empty:

- **New property** — never had rooms added.
- **Wrong store** — rooms may exist under a different `store_id`. The current URL is `/admin/stores/7322b460-2c23-4d3d-bdc5-55a31cc65fab`.
- **RLS blocking read** — only the store owner / admin can see rows; if you're viewing as a different account, the query returns empty silently.
- **Save failed earlier** — if a previous "Add Room" attempt errored (e.g. missing required field), nothing was inserted.

## Optional next step (if you want me to investigate)

If you believe rooms *should* exist for this store, approve and I will:

1. Query `lodge_rooms` for `store_id = 7322b460-2c23-4d3d-bdc5-55a31cc65fab` to confirm row count.
2. Check the `stores` table to confirm ownership and `category = 'lodging'`.
3. Review the `upsert` mutation in `useLodgeRooms.ts` for any silent-failure paths after the recent schema migration (new jsonb columns).
4. Add a toast on save success/failure inside `LodgingRoomsSection.tsx` so future Add Room attempts surface errors instead of failing silently.

Otherwise, just tap **+ Add Room** and the empty state will clear as soon as the first room is saved.

