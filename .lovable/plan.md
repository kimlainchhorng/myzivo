
# Global Currency Selector & Price Formatting System

## Overview

This plan implements a comprehensive currency selection system across ZIVO with proper exchange rate handling, persistent preferences, and consistent locale-aware price formatting.

---

## Current State Analysis

### Existing Components
- **`CurrencySelector.tsx`**: Basic dropdown with 8 currencies (USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY) but uses local state only
- **`PriceDisplay.tsx`**: Hardcoded `$` symbol, no currency awareness
- **Result Cards**: Hardcoded `$` symbols throughout (FlightResultCard, HotelResultCard, CarResultCard)
- **`pricing.ts`**: Rides/Eats pricing engine uses `$` hardcoded

### Key Issues to Solve
1. No global currency state management
2. No exchange rate conversion logic
3. Prices use hardcoded `$` symbols
4. No locale-aware formatting (thousands separators, decimal places)
5. No persistence across sessions

---

## Implementation Plan

### Phase 1: Currency Infrastructure

#### Step 1: Create Currency Configuration
Create `src/config/currencies.ts`:
- Define supported currencies with metadata:

| Code | Symbol | Name | Decimals | Locale | Flag |
|------|--------|------|----------|--------|------|
| USD | $ | US Dollar | 2 | en-US | 🇺🇸 |
| EUR | € | Euro | 2 | de-DE | 🇪🇺 |
| GBP | £ | British Pound | 2 | en-GB | 🇬🇧 |
| CAD | C$ | Canadian Dollar | 2 | en-CA | 🇨🇦 |
| AUD | A$ | Australian Dollar | 2 | en-AU | 🇦🇺 |
| JPY | ¥ | Japanese Yen | 0 | ja-JP | 🇯🇵 |
| KRW | ₩ | South Korean Won | 0 | ko-KR | 🇰🇷 |
| SGD | S$ | Singapore Dollar | 2 | en-SG | 🇸🇬 |
| THB | ฿ | Thai Baht | 2 | th-TH | 🇹🇭 |
| KHR | ៛ | Cambodian Riel | 0 | km-KH | 🇰🇭 |

#### Step 2: Create Currency Context
Create `src/contexts/CurrencyContext.tsx`:
- Global state for selected currency
- Exchange rates cache (24h TTL)
- Persistence to localStorage + cookie
- Conversion utilities
- React context provider

Key exports:
- `CurrencyProvider` - Wraps app
- `useCurrency()` - Hook to get current currency + format functions
- `useFormattedPrice(amount, baseCurrency)` - Hook for converted display

#### Step 3: Create Exchange Rate Hook
Create `src/hooks/useExchangeRates.ts`:
- Fetch rates from server-side edge function
- Cache in memory with 24h expiry
- Store rates relative to USD base
- Fallback to static rates if API fails

#### Step 4: Create FX Edge Function
Create `supabase/functions/exchange-rates/index.ts`:
- Fetch daily rates from free API (exchangerate-api.com or similar)
- Cache in database table `exchange_rates`
- Return cached rates if fresh (< 24h)
- Secure server-side implementation

---

### Phase 2: Price Formatting Utilities

#### Step 5: Create Unified Price Formatter
Create `src/lib/currency.ts`:

```text
Key functions:
┌────────────────────────────────────────────────────────────┐
│ formatPrice(amount, currency)                              │
│   → Locale-aware formatting with proper symbol placement   │
│   → Example: USD 1234.56 → "$1,234.56"                    │
│   → Example: EUR 1234.56 → "€1.234,56"                    │
│   → Example: JPY 12345 → "¥12,345"                        │
├────────────────────────────────────────────────────────────┤
│ convertPrice(amount, fromCurrency, toCurrency, rates)      │
│   → Convert using provided exchange rates                  │
│   → Returns raw number for internal use                    │
├────────────────────────────────────────────────────────────┤
│ formatConvertedPrice(amount, baseCurrency, targetCurrency) │
│   → Convert and format in one call                         │
│   → Returns formatted string                               │
└────────────────────────────────────────────────────────────┘
```

#### Step 6: Update PriceDisplay Component
Update `src/components/ui/price-display.tsx`:
- Accept `currency` prop (defaults to context)
- Accept `baseCurrency` prop for conversion
- Use `useCurrency()` hook for formatting
- Keep "From" prefix and "*" suffix for affiliate compliance
- Add optional "Converted from USD" note

---

### Phase 3: UI Components

#### Step 7: Upgrade CurrencySelector Component
Rewrite `src/components/shared/CurrencySelector.tsx`:
- Connect to CurrencyContext (not local state)
- Use Radix Popover for accessible dropdown
- Show flag + code + symbol
- Animate selection changes
- Mobile-optimized touch targets

Desktop Header Integration:
```text
┌────────────────────────────────────────────────────┐
│ [Logo]    Flights Hotels Cars Extras    🇺🇸 USD ▼ │
└────────────────────────────────────────────────────┘
```

Mobile Integration (in MobileNavMenu footer):
```text
┌────────────────────────────────────────────────────┐
│ Currency: [🇺🇸 USD ▼]                             │
│ [Log in]  [Sign up]                                │
└────────────────────────────────────────────────────┘
```

#### Step 8: Create Currency Change Indicator
Create `src/components/shared/CurrencyBadge.tsx`:
- Small badge showing current currency
- Clickable to open selector
- Used in result cards as subtle indicator

---

### Phase 4: Integration Across Pages

#### Step 9: Update Header
Modify `src/components/Header.tsx`:
- Add CurrencySelector to desktop actions (before user menu)
- Subtle styling to not compete with CTA buttons

#### Step 10: Update MobileNavMenu
Modify `src/components/navigation/MobileNavMenu.tsx`:
- Add currency selector above footer buttons
- Use inline variant for quick selection

#### Step 11: Update Flight Result Card
Modify `src/components/results/FlightResultCard.tsx`:
- Replace hardcoded `currencySymbol` logic
- Use `useCurrency()` hook
- Format: `formatPrice(flight.price, selectedCurrency)`
- Add small "Converted from USD" text if applicable

#### Step 12: Update Hotel Result Card
Modify `src/components/results/HotelResultCard.tsx`:
- Use `useCurrency()` hook
- Format pricePerNight and totalPrice
- Maintain "/night" suffix

#### Step 13: Update Car Result Card
Modify `src/components/results/CarResultCard.tsx`:
- Use `useCurrency()` hook
- Format pricePerDay and totalPrice
- Maintain "/day" suffix

#### Step 14: Update PriceDisplay Components
Apply currency formatting to all price display areas:
- Landing page "From" prices
- Search result summaries
- Cross-sell sections
- Trending deals

---

### Phase 5: URL & Persistence

#### Step 15: Add Currency to URL Params
Update URL handling to:
- Append `&currency=EUR` to results URLs
- Read currency from URL on page load (takes precedence)
- Preserve during Edit Search and filter changes
- Keep UTM params intact

#### Step 16: Persistence Logic
```text
Priority order for currency selection:
1. URL parameter (?currency=EUR)
2. localStorage value
3. Browser locale detection (navigator.language)
4. Default: USD
```

---

### Phase 6: App Provider Integration

#### Step 17: Wire CurrencyProvider
Modify `src/App.tsx`:
- Add `CurrencyProvider` wrapper (inside Router, before UTMProvider)
- Ensures currency available throughout app

---

## Technical Details

### Files Created
| File | Purpose |
|------|---------|
| `src/config/currencies.ts` | Currency definitions and metadata |
| `src/contexts/CurrencyContext.tsx` | Global currency state and formatting |
| `src/hooks/useExchangeRates.ts` | FX rate fetching and caching |
| `src/lib/currency.ts` | Formatting and conversion utilities |
| `supabase/functions/exchange-rates/index.ts` | Server-side FX rate fetching |
| `src/components/shared/CurrencyBadge.tsx` | Compact currency indicator |

### Files Modified
| File | Changes |
|------|---------|
| `src/App.tsx` | Add CurrencyProvider |
| `src/components/Header.tsx` | Add CurrencySelector to desktop |
| `src/components/navigation/MobileNavMenu.tsx` | Add CurrencySelector to mobile menu |
| `src/components/shared/CurrencySelector.tsx` | Rewrite to use context |
| `src/components/ui/price-display.tsx` | Add currency awareness |
| `src/components/results/FlightResultCard.tsx` | Use currency formatting |
| `src/components/results/HotelResultCard.tsx` | Use currency formatting |
| `src/components/results/CarResultCard.tsx` | Use currency formatting |

### Database Table
Create `exchange_rates` table:
```text
┌────────────────────────────────────────────────────────────┐
│ Column         │ Type        │ Description                │
├────────────────────────────────────────────────────────────┤
│ id             │ uuid        │ Primary key                │
│ base_currency  │ text        │ Always 'USD'               │
│ target_currency│ text        │ EUR, GBP, etc.             │
│ rate           │ decimal     │ Exchange rate              │
│ fetched_at     │ timestamptz │ When rate was fetched      │
└────────────────────────────────────────────────────────────┘
```

---

## Formatting Examples

| Amount (USD) | EUR | GBP | JPY |
|--------------|-----|-----|-----|
| $1,234.56 | €1.142,03 | £971.23 | ¥185,184 |
| $45.00 | €41,63 | £35.46 | ¥6,750 |
| $2,500.00 | €2.312,50 | £1.968,75 | ¥375,000 |

---

## Edge Cases Handled

1. **API/Result prices in different currencies**: If API returns EUR prices, convert to user's selected currency
2. **Zero exchange rates**: Fall back to static rates
3. **New currency added**: Graceful fallback to USD formatting
4. **SSR/Hydration**: Read from cookie for consistent initial render
5. **Partner redirects**: Currency selection does NOT change partner URLs (they have their own FX)

---

## Affiliate Compliance

- Partner booking prices are NOT modified
- Display prices are clearly marked as "indicative" / "From"
- "Converted from USD" note shown when applicable
- Sorting uses base price (USD) for consistency
- Partner redirect still goes through /out unchanged

---

## Testing Checklist

- [ ] Change currency on results page → prices update instantly
- [ ] Navigate to another product → currency persists
- [ ] Open new session → last currency remembered
- [ ] Partner redirect still works correctly
- [ ] URL with `?currency=EUR` overrides localStorage
- [ ] JPY/KRW show no decimals
- [ ] EUR uses comma as decimal separator
- [ ] Mobile selector works smoothly
- [ ] Desktop dropdown closes on outside click
