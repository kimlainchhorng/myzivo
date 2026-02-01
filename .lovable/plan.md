
# Plan: Consolidate Travel Extras Hub (/extras)

## Overview
Rebuild `/extras` as the exclusive, centralized hub for all travel add-on partner links. Remove scattered partner links from Flights, Hotels, and Cars pages while maintaining cross-sell navigation to the hub.

---

## Phase 1: Update Partner Configuration

### 1.1 Add Missing Partners to `affiliateLinks.ts`
Add Klook to `ACTIVITY_PARTNERS` registry with the correct tracking URL from the user's list:
- Klook: `https://klook.tpo.li/ToVcOax7`

Verify all partners from user's list are properly configured:
| Partner | Category | URL |
|---------|----------|-----|
| Klook | Activities | klook.tpo.li/ToVcOax7 |
| Tiqets | Activities | tiqets.tpo.li/5fqrcQWZ |
| Yesim | eSIM | yesim.tpo.li/OpjeHJgH |
| Searadar | Travel Radar | searadar.tpo.li/iAbLlX9i |
| TicketNetwork | Tickets | ticketnetwork.tpo.li/utk3u8Vr |
| Compensair | Compensation | compensair.tpo.li/npsp8pm0 |

---

## Phase 2: Rebuild /extras Page

### 2.1 Update `TravelExtras.tsx` Structure

**A) Hero Section**
- Title: "ZIVO Extras"
- Subtitle: "Tours, transfers, eSIM, luggage storage, and travel services — book on trusted partner sites."
- Use existing `hero-extras.jpg` asset

**B) Optional City Input**
Add a destination input at the top:
```
"Traveling to" [City input field]
```
Store city for analytics tracking (append as `utm_content` or store locally)

**C) Category Grid - All 13 Partners**
Build a flat grid of partner cards (no grouped categories):

| Partner | Icon | Description |
|---------|------|-------------|
| Activities & Tours (Klook) | 🎟️ | Book tours and attractions worldwide |
| Museums & Attractions (Tiqets) | 🎫 | Skip-the-line museum tickets |
| Airport Transfers (KiwiTaxi) | 🚕 | Fixed-price airport pickups |
| Transfers Marketplace (GetTransfer) | 🚙 | Compare local transfer drivers |
| eSIM (Airalo) | 📱 | Instant eSIM for 190+ countries |
| eSIM (Yesim) | 📶 | Budget-friendly travel eSIM |
| SIM (Drimsim) | 🌐 | Global SIM card with data |
| Luggage Storage (Radical Storage) | 🧳 | Store bags from $5.90/day |
| Audio Tours (WeGoTrip) | 🎧 | Self-guided audio experiences |
| Flight Compensation (AirHelp) | ⚖️ | Claim up to €600 for delays |
| Flight Compensation (Compensair) | ✈️ | Free flight compensation check |
| Travel Radar (Searadar) | 🔍 | Compare all travel options |
| Tickets Marketplace (TicketNetwork) | 🎭 | Concerts, sports, live events |

Each card includes:
- Premium icon + partner logo/emoji
- 1-line description
- "Explore" CTA button
- Opens in NEW TAB via `/out` redirect
- Shows redirect notice on hover/before click

### 2.2 Card Component Design
```text
┌─────────────────────────────────────┐
│  🎟️  Activities & Tours             │
│       Klook                          │
│       Book tours and attractions     │
│                                      │
│  [Explore →]  Opens in new tab       │
└─────────────────────────────────────┘
```

### 2.3 Tracking Implementation
All CTAs use:
```typescript
openPartnerLink(partner.trackingUrl, {
  partnerId: partner.id,
  partnerName: partner.name,
  product: 'extras',
  pageSource: 'extras',
});
```
- Opens `/out?partner=X&name=X&product=extras&page=extras&url=X`
- Logs to `affiliate_click_logs` with proper subid
- Opens partner in new tab with `rel="nofollow sponsored noopener noreferrer"`

---

## Phase 3: Replace Scattered Links on Travel Pages

### 3.1 Modify `EnhanceYourTrip.tsx`
Change from showing partner cards with direct CTAs to:
- Show category preview cards (no direct partner links)
- All cards link to `/extras` page
- Add "View All Extras →" prominent CTA

**Before:**
```
[Partner Card with Explore CTA] → /out → partner
```

**After:**
```
[Category Preview Card] → /extras (internal link)
```

### 3.2 Files to Update
| File | Change |
|------|--------|
| `FlightResults.tsx` | Keep `EnhanceYourTrip` but link to `/extras` |
| `HotelBooking.tsx` | Keep `EnhanceYourTrip` but link to `/extras` |
| `CarRentalBooking.tsx` | Keep `EnhanceYourTrip` but link to `/extras` |
| `CrossSellBanner.tsx` | Update "Things To Do" to link to `/extras` |

### 3.3 Remove Unused Components
Mark as deprecated (or remove if unused elsewhere):
- `AirportTransfersSection.tsx` - partner links move to /extras
- `LuggageStorageSection.tsx` - partner links move to /extras  
- `TravelEsimSection.tsx` - partner links move to /extras
- `FlightCompensationSection.tsx` - partner links move to /extras
- `ActivitiesSection.tsx` - partner links move to /extras

---

## Phase 4: Affiliate Disclosure Footer

### 4.1 Exact Disclosure Text
At bottom of `/extras` page:
```
"ZIVO may earn a commission when users book through partner links.
Bookings are completed on partner websites."
```

### 4.2 Per-Card Notice
Add tooltip or small text on hover:
```
"You will be redirected to a partner site."
```

---

## Technical Summary

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/TravelExtras.tsx` | **Major rewrite** - new structure with all 13 partners |
| `src/config/affiliateLinks.ts` | Add Klook to ACTIVITY_PARTNERS |
| `src/components/travel-extras/EnhanceYourTrip.tsx` | Replace partner links with `/extras` navigation |
| `src/components/seo/CrossSellBanner.tsx` | Update "Things To Do" link to `/extras` |

### Partner URL Registry (Final)
```typescript
const EXTRAS_PARTNERS = {
  klook: 'https://klook.tpo.li/ToVcOax7',
  tiqets: 'https://tiqets.tpo.li/5fqrcQWZ',
  kiwitaxi: 'https://kiwitaxi.tpo.li/Bj6zghJH',
  gettransfer: 'https://gettransfer.tpo.li/FbrIguyh',
  airalo: 'https://airalo.tpo.li/zVRtp8Zt',
  yesim: 'https://yesim.tpo.li/OpjeHJgH',
  drimsim: 'https://drimsim.tpo.li/A9yKO5oA',
  radicalstorage: 'https://radicalstorage.tpo.li/4W0KR99h',
  wegotrip: 'https://wegotrip.tpo.li/QSrOpIdV',
  airhelp: 'https://airhelp.tpo.li/7Z5saPi2',
  compensair: 'https://compensair.tpo.li/npsp8pm0',
  searadar: 'https://searadar.tpo.li/iAbLlX9i',
  ticketnetwork: 'https://ticketnetwork.tpo.li/utk3u8Vr',
};
```

---

## Verification Checklist

After implementation:
- [ ] Navigate to `/extras` - verify all 13 partner cards visible
- [ ] Click each partner CTA - verify opens `/out?...` in new tab
- [ ] Check `/admin/clicks` - verify clicks logged with proper subid
- [ ] Navigate to `/flights` results - verify no direct partner links (only "View Extras" link)
- [ ] Test UTM flow: `/lp/flights?utm_source=google` → `/flights` → `/extras` → partner - verify tracking persists
