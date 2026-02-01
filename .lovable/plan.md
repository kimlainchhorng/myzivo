
# Plan: Consolidate Travel Extras Hub (/extras)

## Overview
Rebuild `/extras` as the exclusive, centralized hub for all travel add-on partner links. Remove scattered partner links from Flights, Hotels, and Cars pages while maintaining cross-sell navigation to the hub.

---

## Phase 1: Rebuild /extras Page (TravelExtras.tsx)

### New Page Structure

**A) Premium Hero Section**
- Title: "ZIVO Extras"
- Subtitle: "Tours, transfers, eSIM, luggage storage, and travel services — book on trusted partner sites."
- Use existing `hero-extras.jpg` with gradient overlay

**B) Optional City Input**
- Add destination input field: "Traveling to (city)"
- Store city for analytics tracking (pass as `utm_content` parameter)

**C) Flat Partner Grid - All 13 Partners**

| Partner | Icon | Description |
|---------|------|-------------|
| Activities & Tours (Klook) | Ticket | Book tours and attractions worldwide |
| Museums & Attractions (Tiqets) | Ticket | Skip-the-line museum tickets |
| Airport Transfers (KiwiTaxi) | Car | Fixed-price airport pickups |
| Transfers Marketplace (GetTransfer) | Car | Compare local transfer drivers |
| eSIM (Airalo) | Wifi | Instant eSIM for 190+ countries |
| eSIM (Yesim) | Wifi | Budget-friendly travel eSIM |
| SIM (Drimsim) | Globe | Global SIM card with data |
| Luggage Storage (Radical Storage) | Luggage | Store bags from $5.90/day |
| Audio Tours (WeGoTrip) | Headphones | Self-guided audio experiences |
| Flight Compensation (AirHelp) | Scale | Claim up to €600 for delays |
| Flight Compensation (Compensair) | Plane | Free flight compensation check |
| Travel Radar (Searadar) | Search | Compare all travel options |
| Tickets Marketplace (TicketNetwork) | Ticket | Concerts, sports, live events |

Each card will include:
- Clean icon and partner name
- 1-line description
- "Explore →" CTA button
- Opens in NEW TAB via `/out` redirect
- Hover tooltip: "You will be redirected to a partner site."

---

## Phase 2: Add Partner Links Configuration

### Partner URLs to Add to affiliateLinks.ts

These new partners need to be added to support the full list:

```text
klook: https://klook.tpo.li/ToVcOax7
yesim: (already exists) https://yesim.tpo.li/OpjeHJgH
searadar: (already exists) https://searadar.tpo.li/iAbLlX9i
ticketnetwork: (already exists) https://ticketnetwork.tpo.li/utk3u8Vr
compensair: (already exists) https://compensair.tpo.li/npsp8pm0
```

### Create EXTRAS_PARTNERS Registry

A new flat array specifically for the /extras page with all 13 partners:

```typescript
const EXTRAS_PARTNERS = [
  { id: 'klook', name: 'Klook', category: 'Activities & Tours', url: '...', icon: 'Ticket' },
  { id: 'tiqets', name: 'Tiqets', category: 'Museums & Attractions', url: '...', icon: 'Ticket' },
  // ... all 13 partners
];
```

---

## Phase 3: Tracking Implementation

All CTAs will use the existing `openPartnerLink()` function which:
1. Opens `/out?partner=X&name=X&product=extras&page=extras&url=X`
2. The `/out` page logs to `affiliate_click_logs` table
3. Opens partner in new tab with proper rel attributes

### Click Logging Format
- `product`: "extras"
- `page_source`: "extras"
- `partner_id`: e.g., "klook", "tiqets"
- SubID format: `extras.extras.klook.{utm_source}.{utm_campaign}.{creator}.{date}`

---

## Phase 4: Replace Scattered Links on Travel Pages

### Modify EnhanceYourTrip.tsx

**Current behavior:**
- Shows partner cards with direct "Book Transfer", "Rent a Car" CTAs
- Each card opens `/out` to the partner site

**New behavior:**
- Show category preview cards (Transfers, Activities, eSIM, etc.)
- All cards navigate internally to `/extras` page
- Remove direct partner links from component
- Add prominent "View All Extras →" CTA

### Files to Update

| File | Change |
|------|--------|
| `EnhanceYourTrip.tsx` | Convert to internal navigation only - link to `/extras` |
| `AirportTransfersSection.tsx` | Replace direct links with link to `/extras` (or deprecate) |
| `LuggageStorageSection.tsx` | Replace direct links with link to `/extras` (or deprecate) |
| `TravelEsimSection.tsx` | Replace direct links with link to `/extras` (or deprecate) |
| `FlightCompensationSection.tsx` | Replace direct links with link to `/extras` (or deprecate) |
| `ActivitiesSection.tsx` | Replace direct links with link to `/extras` (or deprecate) |
| `CrossSellBanner.tsx` (seo) | Update "Things To Do" to link to `/extras` |

---

## Phase 5: Affiliate Disclosure

### Footer Disclosure (Exact Text)
```
"ZIVO may earn a commission when users book through partner links.
Bookings are completed on partner websites."
```

### Per-Card Hover Notice
Tooltip on each card: "You will be redirected to a partner site."

---

## Technical Summary

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/TravelExtras.tsx` | **Major rewrite** - new hero, city input, flat 13-partner grid |
| `src/config/affiliateLinks.ts` | Add Klook to registry; create EXTRAS_PARTNERS array |
| `src/components/travel-extras/EnhanceYourTrip.tsx` | Replace partner links with internal `/extras` navigation |
| `src/components/seo/CrossSellBanner.tsx` | Update "Things To Do" href to `/extras` |

### Partner URL Registry (Final - 13 Partners)

```text
1. klook: https://klook.tpo.li/ToVcOax7
2. tiqets: https://tiqets.tpo.li/5fqrcQWZ
3. kiwitaxi: https://kiwitaxi.tpo.li/Bj6zghJH
4. gettransfer: https://gettransfer.tpo.li/FbrIguyh
5. airalo: https://airalo.tpo.li/zVRtp8Zt
6. yesim: https://yesim.tpo.li/OpjeHJgH
7. drimsim: https://drimsim.tpo.li/A9yKO5oA
8. radicalstorage: https://radicalstorage.tpo.li/4W0KR99h
9. wegotrip: https://wegotrip.tpo.li/QSrOpIdV
10. airhelp: https://airhelp.tpo.li/7Z5saPi2
11. compensair: https://compensair.tpo.li/npsp8pm0
12. searadar: https://searadar.tpo.li/iAbLlX9i
13. ticketnetwork: https://ticketnetwork.tpo.li/utk3u8Vr
```

---

## Verification Checklist

After implementation, we should verify:
- [ ] Navigate to `/extras` - all 13 partner cards visible
- [ ] Click each partner CTA - verify opens `/out?...` in new tab
- [ ] Check `/admin/clicks` - verify clicks logged with product=extras, proper subid
- [ ] Navigate to `/flights` results - verify no direct partner links (only "View Extras" link)
- [ ] Test UTM flow: `/lp/flights?utm_source=google` → `/flights` → `/extras` → partner - verify tracking persists
- [ ] City input stores value for analytics when partner clicked
