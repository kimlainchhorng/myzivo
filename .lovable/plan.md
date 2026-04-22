

# Fix store "time open" / hours display on the storefront

The user is on `/grocery/shop/koh-sdach-resort-by-ehm` and the store status / opening hours shown there is wrong or missing. The status is computed by `src/utils/storeStatus.ts` from the store's `hours` string and `market` code.

## Likely causes

1. The store row has `hours` in a format the regex in `parseHoursString` does not recognize (e.g. `"24/7"`, `"Open 24 hours"`, `"7:00 - 22:00"` without am/pm, or empty). When parsing fails, the helper returns a hard-coded `{ isOpen: true, status: "open", label: "Open" }` regardless of real time.
2. `market` may not be passed from the storefront page, so timezone falls back to the device clock — wrong status for Cambodia stores when viewer is elsewhere.
3. Hotel/resort entries are effectively 24/7 but stored as `"24/7"` which the regex rejects.

## Plan

### 1. Make `getStoreStatus` understand more hours formats

Edit `src/utils/storeStatus.ts`:

- **24/7 support**: if `hours` matches `/24\s*\/\s*7|24\s*hours|always\s*open/i` → return `{ isOpen: true, status: "open", label: "Open 24 hours", formattedHours: "Open 24 hours" }`.
- **24-hour clock support**: extend `parseHoursString` regex to also match `"7:00 - 22:00"` / `"07:00–22:00"` (no am/pm). When am/pm is absent, treat numbers as 24h directly.
- **Closed marker**: if `hours` is empty / `"closed"` → return closed with label `Hours not set`.
- **Overnight hours** (e.g. `10pm–2am`): if `closeMinutes <= openMinutes`, treat close as next-day (`closeMinutes += 24*60`) and compare against `currentMinutes` plus a 24h wrap.
- Keep current am/pm parsing as the fallback path.

### 2. Always pass `market` from storefront

Find the grocery shop page (`src/pages/grocery/...` — likely `GroceryStorePage.tsx` or similar that renders `/grocery/shop/:slug`) and confirm `getStoreStatus(store.hours, store.market || store.country)` is called with the market code. If not, pass it.

### 3. Self-heal admin form

In `src/pages/admin/AdminStoreEditPage.tsx`, add a tiny live preview under the Hours input that runs `getStoreStatus(value, form.market)` and shows the resolved status + formatted hours. If it returns the fallback `Open` with no `formattedHours`, show an inline warning: *"Hours format not recognized — try `7am–10pm`, `07:00–22:00`, or `24/7`."* This stops bad data getting saved.

### 4. Verify on the affected store

After the parser fix, the Koh Sdach Resort page should display the correct live status driven by `Asia/Phnom_Penh` time, or `Open 24 hours` if it's a 24/7 resort.

## Files

- **Edit**: `src/utils/storeStatus.ts` — add 24/7, 24h clock, overnight, and closed handling
- **Edit**: storefront page rendering `/grocery/shop/:slug` — ensure `market` is passed to `getStoreStatus` (only if missing)
- **Edit**: `src/pages/admin/AdminStoreEditPage.tsx` — live hours preview + format hint under the Hours field

## Out of scope

- Migrating existing `hours` strings in the DB (parser now tolerates them)
- Adding per-day hours (Mon–Fri vs Sat/Sun) — current schema is a single string
- Timezone changes outside KH/US (only those two are mapped today)

