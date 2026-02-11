

## Phase 12B (Continued): Sponsored Cards, Newsletter CTA, and Remaining Emoji Cleanup

This phase completes the remaining items from the Phase 12B plan: inserting sponsored cards into search results, adding the newsletter CTA to the desktop homepage, and cleaning up the last emoji-using files.

---

### Part 1: Sponsored Cards in Flight and Hotel Results

**Flight Results (`src/pages/FlightResults.tsx`):**
- Import `SponsoredResultCard` from `src/components/sponsored/SponsoredResultCard.tsx`
- In the results mapping loop (line ~573), insert a `SponsoredResultCard` after every 5th flight result
- Card promotes airport transfers or hotel deals at the destination
- Uses FTC-compliant "Sponsored" label (built into the component)

**Hotel Results (`src/pages/HotelResultsPage.tsx`):**
- Same pattern: import `SponsoredResultCard` and insert after every 5th hotel result (line ~377)
- Card promotes car rentals or travel insurance at the destination

---

### Part 2: Newsletter CTA on Desktop Homepage

**Desktop Homepage (`src/pages/Index.tsx`):**
- Import the existing `NewsletterSignup` component from `src/components/shared/NewsletterSignup.tsx`
- Add it between `SocialProofSection` and `AirlineTrustSection` (between lines 134 and 137)
- Wrapped in existing `FadeInSection` for consistent scroll animation

---

### Part 3: Remaining Emoji Cleanup

**`src/pages/app/AppTravel.tsx`** -- Still has raw emojis in demo data:
- `flightResults[].logo`: airplane emoji -> Lucide `Plane` icon in sky gradient
- `hotelResults[].image`: hotel/beach/house emojis -> Lucide `Building2`, `Umbrella`, `Home` in amber gradient
- `carResults[].image`: car emojis -> Lucide `Car`, `Truck`, `Crown` in emerald gradient
- Star rating emojis (line 244) -> Lucide `Star` icons with fill

**`src/components/shared/AppFeatures.tsx`** -- Line 127:
- Star emoji in rating text -> Lucide `Star` icon inline

**`src/components/restaurant/RestaurantOverview.tsx`** -- Verify no emojis remain (initial scan shows Lucide icons already used)

---

### Technical Details

**Sponsored card insertion pattern (FlightResults.tsx):**
```text
{flightCards.map((flight, index) => (
  <React.Fragment key={flight.id}>
    <FlightResultCard flight={flight} onViewDeal={handleViewDeal} />
    {(index + 1) % 5 === 0 && index < flightCards.length - 1 && (
      <SponsoredResultCard
        type="flight"
        title="Airport Transfer Deal"
        description="Pre-book your ride from the airport"
        price={29}
        currency="USD"
        ctaText="View Transfer"
        ctaHref="/rides"
      />
    )}
  </React.Fragment>
))}
```

**AppTravel.tsx emoji replacement pattern:**
```text
Before: { logo: "airplane_emoji", ... }
After:  { icon: Plane, iconColor: "text-sky-400", iconBg: "from-sky-500/20 to-blue-500/20", ... }
```

Rendering changes from `<span>{item.logo}</span>` to a gradient icon container.

### Summary

| Part | Scope | Files Modified |
|------|-------|---------------|
| 1 | Sponsored cards in results | 2 (`FlightResults.tsx`, `HotelResultsPage.tsx`) |
| 2 | Newsletter CTA on homepage | 1 (`Index.tsx`) |
| 3 | Remaining emoji cleanup | 2 (`AppTravel.tsx`, `AppFeatures.tsx`) |
| **Total** | | **5 files** |

No new files. No database changes. No edge function changes.

