## Good news — promotions UI already exists

There's already a complete **Promotions & Discounts** manager built into the Hotel Admin at:

`/admin/stores/{storeId}?tab=lodge-promos`

It supports: percent off, fixed dollar off, free nights, upgrades, promo codes, early-bird, last-minute, length-of-stay, member-only rates, start/end dates, max redemptions, on/off toggle, and one-click presets.

The only problem: it's buried inside a 20-tab admin and the Hotel Admin launch page (`/hotel-admin`) doesn't surface it.

## Plan — make it 1-click discoverable

Tiny edit to `src/pages/admin/HotelAdminLaunchPage.tsx`:

1. Import `Tag` icon from lucide.
2. Add `["Promotions & Discounts", "lodge-promos", Tag]` to the `quickLinks` array (slot it after "Rate Plans").

Result: a **"Promotions & Discounts"** button appears on the Hotel Admin launch page. Owner clicks it → lands directly on the promotions manager → creates a discount → it shows up on `/hotels` cards (with strike-through original + green discounted price + red `-X%` badge — which we already wired in last turn).

No DB migration. No new components. Just one line added to the quick-links grid.

## After this lands

To actually verify the discount UI on `/hotels`, you (or any hotel owner) just:

1. Go to `/hotel-admin`.
2. Click the new **Promotions & Discounts** button.
3. Click any preset (e.g. "Spring Sale 20%") or "New custom promo".
4. Save.
5. Open `/hotels` — your property card now shows the discounted price.

Want me to apply this one-line addition?