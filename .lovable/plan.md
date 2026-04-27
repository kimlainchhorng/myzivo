# Make the new Booking.com-style fields visible from the Dashboard

## Why you can't see anything

You're on the **Overview / Dashboard** tab (`?tab=lodge-overview`), but the new fields I added live on:
- **Property Profile tab** (`?tab=lodge-property`) → "Storefront content" accordion
- **Rooms tab** (`?tab=lodge-rooms`) → per-room editor

So everything is wired correctly — it's just on a different tab. The only Dashboard-visible addition was the small "Guest reviews" card, which currently shows "No reviews yet."

## Fix: surface a Storefront preview on the Dashboard

Add a **Storefront preview card** to the Overview tab so you can see at a glance what guests will see, with a one-click "Edit" button that jumps to the Property Profile editor.

### What it shows
- **About this property** — first 2 description sections (titles + 2-line excerpt) + "+N more"
- **Property highlights mini-card** — Perfect for, Top location score (badge), Breakfast info, Rooms with
- **Most popular amenities** — icon row of your top 8
- **Empty state** — if nothing is filled in yet, a clear "Open Storefront content →" CTA

### Files
- New: `src/components/admin/store/lodging/StorefrontPreviewCard.tsx`
- Edit: `src/components/admin/store/lodging/LodgingOverviewSection.tsx` — mount the card in the right-side column next to Reviews

### Quick note on the console warning
The `forwardRef` warning in `LodgingOperationsShared.tsx > NextActions` is **pre-existing**, not caused by these changes. Out of scope here — happy to fix it next pass if you want.

## After approval
1. Create the preview card (above)
2. Mount it on Overview alongside Revenue Pulse + Reviews
3. You'll see a clear "Edit" button to jump straight into filling in your About / Highlights / Popular amenities for the Bamboo Cottage / Koh Sdach Resort listing
