## Hotel & Resort Admin — Phase 3

Phase 2 shipped Revenue Pulse, Quick-Jump nav, and Promotions overhaul. Phase 3 fixes a real bug, makes Gallery actually work, deepens cross-section flow, and adds verification.

---

### 1. Fix Gallery — currently reads non-existent fields (real bug)

`LodgingGallerySection` reads `profile.photos`, `profile.cover_photo_url`, `profile.hero_photo_url` — **none of these exist** on `lodge_property_profile`. Result: empty placeholder forever.

The real photo sources in the database are:
- `store_profiles.gallery_images` (jsonb) + `store_profiles.gallery_positions` — property-level gallery
- `lodge_rooms.photos` (jsonb) + `lodge_rooms.cover_photo_index` — per-room

**Rebuild Gallery as a real manager:**
- Pull from both sources via existing `useOwnerStoreProfile` and `useLodgeRooms` hooks
- 4 stat tiles: Total photos · Property gallery · Room photos · Cover set?
- Tabbed grid: "All", "Property", "Per-room" (groups by room name)
- Each tile shows source badge (Property / Room name) + "Open in Profile" / "Open in Room" deep-link
- Empty state with concrete uploader CTAs (deep-link to property/room editors)
- No new tables — pure UI fix

### 2. Front Desk — make today's board actionable

The Front Desk currently shows static stat tiles. Add a **Today's Board** with three columns (Arrivals · In-house · Departures) listing real reservations from `useLodgeReservations`:
- Each row: guest name, room, time, status badge
- One-tap status change: Check in · Check out · Mark no-show
- Click row → opens reservation detail
- Empty columns explain "No arrivals scheduled today"

### 3. Inbox → Concierge bridge (workflow connectivity)

In `LodgingInboxSection`, add a **"Create concierge task"** button on each guest message. Pre-fills:
- guest_name from reservation
- room_number from reservation
- title = first 60 chars of message
- description = full message body

Uses existing `lodging_concierge_tasks` insert. Closes the loop between guest request → tracked action.

### 4. Lost & Found — photo upload (proper)

Replace the bare URL input with a real uploader using the existing `user-stories` bucket pattern (per memory). Adds preview + auto-fills `photo_url` after upload. RLS already permits owner uploads.

### 5. Sidebar polish — live badge counts

Add small numeric badges to sidebar items so staff see what needs attention without clicking:
- Guest Inbox → unread guest message count
- Concierge Tasks → open task count
- Lost & Found → items with status `found` (unclaimed)
- Front Desk → arrivals + departures today

Counts pulled in `StoreOwnerLayout` via a single shared `useLodgingSidebarBadges(storeId)` hook (5-min stale time, lightweight head counts).

### 6. Verification (you asked: "verify too make sure is right")

After implementation:
- Run `tsc --noEmit` to confirm no type errors
- Run the existing **Lodging QA Checklist** (`/admin/lodging/qa-checklist`) and report results
- Quick smoke check on the live preview at the current store: confirm Quick-Jump renders, Revenue Pulse loads, Gallery shows real photos (or correct empty state), Promotions presets work
- Fix any issues uncovered before declaring Phase 3 done

---

### Technical notes

**No new tables.** All photo fields, message fields, and badge counts already exist.

**Files to create**
- `src/hooks/lodging/useLodgingSidebarBadges.ts` — single batched count query

**Files to modify**
- `src/components/admin/store/lodging/LodgingGallerySection.tsx` — real data sources
- `src/components/admin/store/lodging/LodgingFrontDeskSection.tsx` — add Today's Board
- `src/components/admin/store/lodging/LodgingInboxSection.tsx` — "Create concierge task" CTA
- `src/components/admin/store/lodging/LodgingLostFoundSection.tsx` — photo uploader
- `src/components/admin/StoreOwnerLayout.tsx` — render badge counts on lodging items
- `src/pages/admin/AdminStoreEditPage.tsx` — pass `storeId` so layout can fetch badges

All real data, no mocks. RLS unchanged (existing `is_store_owner()` already covers everything).

Approve to implement in order: (1) Gallery fix → (2) Front Desk board → (3) Inbox→Concierge bridge → (4) L&F upload → (5) Sidebar badges → (6) Verify.
