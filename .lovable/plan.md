

## Finish populating Villa: pre-tick amenities in editor + add bed config

The DB update ran, but two things are still missing from your screenshot:
1. **Bed configuration is empty** ("No beds configured") — needed to power the "Sleeps X" badge.
2. You want to **see the amenities pre-ticked in the editor UI** (not just in the customer modal).

Both are quick database updates on the same Villa row.

### What I'll do

**1. Add bed configuration to Villa**
Insert a sensible default into the room's `beds` field so the "Sleeps X" badge works:
- 1× King bed
- 1× Sofa bed
(Total sleeps ~3, matches a typical villa. Adjustable later in the editor.)

**2. Re-confirm amenities are saved**
Re-query `lodge_rooms` for the Villa to verify all 60+ amenities from the previous migration are present. If the editor still shows them un-ticked, it means the editor reads from a different field (e.g., `lodge_amenities` table per-store, not `lodge_rooms.amenities` per-room) — in which case I'll also upsert into `lodge_amenities` so the ticks appear in the UI you're looking at.

**3. Verify in the editor**
After the update, refresh `/admin/stores/7322b460-2c23-4d3d-bdc5-55a31cc65fab` → Villa → Edit. You should see:
- Bed configuration filled in (King + Sofa bed chips)
- All amenity buttons in the grouped list highlighted/ticked

### Files to touch
- New migration: `supabase/migrations/<timestamp>_villa_beds_and_amenities_sync.sql`
  - `UPDATE lodge_rooms SET beds = '[{"type":"king","count":1},{"type":"sofa","count":1}]'::jsonb WHERE id = '69dfd9e2-...'`
  - If needed: `INSERT INTO lodge_amenities (store_id, amenities, ...) ON CONFLICT (store_id) DO UPDATE ...` to mirror the same amenity set at the store level.

### Not changing
- Pricing (143 base / 172 weekend stays as-is)
- Photos, taxes & fees, other rooms, code

