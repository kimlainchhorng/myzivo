
# ZIVO AI Personalization, Retention & Optimization Engine

## Overview

This plan implements a comprehensive AI-powered personalization system to increase conversion rates, drive repeat bookings, and maximize customer lifetime value (LTV). The system builds on ZIVO's existing AI infrastructure (user behavior signals, CLV scores, recommendations) while adding new personalization, retention, and optimization capabilities.

## Existing Infrastructure (Reused)

The platform already has foundational AI components we'll extend:
- `user_behavior_signals` table for tracking user actions
- `ai_recommendations` table for cross-sell suggestions
- `user_clv_scores` table for customer value tiers
- `useAIOptimization.ts` hooks for behavior tracking and recommendations
- `useEventTracking.ts` for analytics events
- `abandoned_searches` table with email recovery flow
- `zivo_credits` and loyalty infrastructure via `useCredits.ts` and `useGrowthIncentives.ts`
- Existing `SavedSearches.tsx` and `RecentlyViewed.tsx` UI components (currently static)

---

## Technical Scope

### 1. Database Schema (Migration)

New tables and extensions:

```text
user_personalization_settings
- id, user_id (unique)
- personalization_enabled (default true)
- show_price_badges, show_urgency_indicators
- preferred_currency, preferred_language
- created_at, updated_at

user_saved_searches (dynamic, replacing static)
- id, user_id
- service_type (flights | hotels | cars)
- search_params (JSONB)
- title, created_at
- price_alert_enabled, target_price
- current_price, last_price_check_at
- notifications (email, push)

user_favorites
- id, user_id
- item_type (hotel | activity | flight_route)
- item_id, item_data (JSONB for cache)
- created_at

user_recently_viewed
- id, user_id
- item_type, item_id
- item_data (JSONB snapshot)
- viewed_at

smart_sort_rules
- id, service_type
- rule_name, rule_key
- scoring_weights (JSONB)
- is_default, is_active
- created_at, updated_at

price_intelligence_cache
- id, service_type
- item_id, current_price, historical_avg
- historical_low, demand_level
- availability_level, updated_at

optimization_metrics
- id, segment_type, segment_value
- metric_name (conversion_rate, repeat_rate, abandonment_rate, revenue_per_user)
- metric_value, period_start, period_end
- created_at

loyalty_points (Phase 1)
- id, user_id
- points_balance, lifetime_points
- tier (standard | bronze | silver | gold)
- created_at, updated_at

loyalty_transactions
- id, user_id
- points_amount, transaction_type (earn | redeem)
- reference_type, reference_id
- description, created_at
```

### 2. Personalization Engine

#### A. Smart Search Results Hook

New hook: `src/hooks/usePersonalizedResults.ts`

```text
Features:
- Fetches user location (useGeoLocation)
- Loads past searches and bookings
- Calculates personalization scores per result
- Applies smart sorting based on user profile
- Prioritizes refundable for new users, premium for repeat

Scoring factors:
- Distance from user location
- Price sensitivity (derived from past bookings)
- Recency of similar searches
- Device type adjustments (mobile = speed priority)
- Travel date proximity (urgent = flexible options)
```

#### B. Smart Sorting System

New hook: `src/hooks/useSmartSorting.ts`

```text
Sort options per service:
- Best Value (AI-weighted price + rating + cancellation)
- Most Booked (popularity signals)
- Closest Match (to user preferences)
- Best Flexibility (cancellation-friendly)

Admin configurable weights via smart_sort_rules table
Sorting evolves based on A/B test conversion data
```

### 3. Price & Deal Intelligence

#### A. Deal Badge Component

New component: `src/components/shared/DealBadge.tsx`

```text
Badge types:
- "Good Deal" - Price below historical average
- "Great Deal" - Price near historical low
- "High Demand" - Booking velocity high
- "Limited Availability" - Supplier inventory low

All badges based on real data only (no fake urgency)
Configurable thresholds in admin
```

#### B. Price Intelligence Hook

New hook: `src/hooks/usePriceIntelligence.ts`

```text
- Fetches price history from cache
- Calculates deal score (0-100)
- Determines badge eligibility
- Caches results with TTL
```

### 4. Abandonment Recovery (Enhanced)

Extends existing `abandoned_searches` flow:

#### A. Enhanced Tracking

Update `useEventTracking.ts`:
- Track checkout step reached
- Track time spent on each step
- Track cart value at abandonment

#### B. Smart Recovery Hook

New hook: `src/hooks/useAbandonmentRecovery.ts`

```text
- Detects abandonment patterns
- Triggers intent save
- Schedules recovery notifications
- Optional: promo code for return visits
```

### 5. Retention Features

#### A. Dynamic Saved Searches

Upgrade `src/components/shared/SavedSearches.tsx`:
- Connect to `user_saved_searches` table
- Real price tracking (indicative from APIs)
- Enable/disable alerts per search
- Delete functionality

New hook: `src/hooks/useSavedSearches.ts`

#### B. Favorites System

New component: `src/components/shared/FavoriteButton.tsx`
New hook: `src/hooks/useFavorites.ts`

```text
- Heart icon toggle on hotel/flight/activity cards
- Persisted to user_favorites table
- Accessible from profile favorites page
- "Book Again" shortcut for past purchases
```

#### C. Recently Viewed (Dynamic)

Upgrade `src/components/shared/RecentlyViewed.tsx`:
- Connect to `user_recently_viewed` table
- Auto-track on item view
- Display in profile and homepage
- Clear all functionality

New hook: `src/hooks/useRecentlyViewed.ts`

### 6. Loyalty System (Phase 1)

#### A. Points Engine

New hook: `src/hooks/useLoyaltyPoints.ts`

```text
Earning rules:
- 1 point per $1 spent on bookings
- 50 bonus points on first booking per service
- 25 bonus points for referral conversion

Redemption:
- 100 points = $1 discount
- Minimum redemption: 500 points ($5)
- Apply at checkout

Tiers (simple):
- Standard: 0-999 points
- Bronze: 1,000-4,999 points (5% bonus earning)
- Silver: 5,000-14,999 points (10% bonus)
- Gold: 15,000+ points (15% bonus + priority support)
```

#### B. Loyalty Display Component

New component: `src/components/loyalty/LoyaltyStatusCard.tsx`

- Points balance and tier
- Progress to next tier
- Recent transactions
- Redemption button

### 7. Admin Optimization Dashboard

New page: `src/pages/admin/modules/optimization/OptimizationDashboard.tsx`

Route: `/admin/optimization`

Tabs:
- **Overview**: Key metrics (conversion, repeat rate, abandonment, revenue/user)
- **Segments**: Conversion by user segment (new vs returning, device, source)
- **Retention**: Repeat booking analysis, churn prediction
- **Promotions**: Promo code performance, redemption rates
- **Personalization**: A/B test results, sorting effectiveness

Metrics sourced from:
- `analytics_events` table
- `optimization_metrics` aggregated data
- Real-time calculations

### 8. Privacy Controls

#### A. Personalization Settings

Add to existing Privacy Controls page (`/account/privacy`):

```text
New toggles:
- Enable personalized recommendations
- Show deal/urgency badges
- Allow search history tracking
- Allow recently viewed tracking
```

Stored in `user_personalization_settings` table.

#### B. Transparency

- Clear messaging about what data is used
- No sensitive attribute inference
- One-click disable for all personalization

---

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/migrations/xxx_personalization_engine.sql` | Create |
| `src/types/personalization.ts` | Create |
| `src/hooks/usePersonalizedResults.ts` | Create |
| `src/hooks/useSmartSorting.ts` | Create |
| `src/hooks/usePriceIntelligence.ts` | Create |
| `src/hooks/useSavedSearches.ts` | Create |
| `src/hooks/useFavorites.ts` | Create |
| `src/hooks/useRecentlyViewed.ts` | Create |
| `src/hooks/useLoyaltyPoints.ts` | Create |
| `src/hooks/useAbandonmentRecovery.ts` | Create |
| `src/hooks/usePersonalizationSettings.ts` | Create |
| `src/hooks/useOptimizationMetrics.ts` | Create |
| `src/components/shared/DealBadge.tsx` | Create |
| `src/components/shared/FavoriteButton.tsx` | Create |
| `src/components/loyalty/LoyaltyStatusCard.tsx` | Create |
| `src/components/loyalty/PointsRedemption.tsx` | Create |
| `src/components/shared/SavedSearches.tsx` | Update (dynamic) |
| `src/components/shared/RecentlyViewed.tsx` | Update (dynamic) |
| `src/pages/admin/modules/optimization/OptimizationDashboard.tsx` | Create |
| `src/pages/account/PrivacyControls.tsx` | Update (add settings) |
| `src/App.tsx` | Update (add route) |

---

## Integration Points

1. **Search Results**: Inject personalization scoring into hotel/flight/activity result lists
2. **Card Components**: Add FavoriteButton and DealBadge to result cards
3. **Checkout**: Integrate loyalty points redemption
4. **Profile**: Add Loyalty, Favorites, Saved Searches tabs
5. **Event Tracking**: Extended abandonment tracking
6. **Email System**: Recovery emails with personalized content

---

## Technical Approach

### Personalization Algorithm

```text
For each search result:
1. Base score = normalized_price × price_weight
2. + rating × rating_weight
3. + cancellation_flexibility × flex_weight
4. + distance_relevance × location_weight
5. + past_booking_affinity × history_weight
6. → Final personalized_score
```

Weights configured per service type and A/B tested.

### Privacy-First Design

- All personalization is opt-out with clear controls
- No sensitive demographic inference
- Data minimization (only track what's needed)
- Full transparency in Privacy Controls

---

## Success Metrics

After implementation:
- Personalized search results increase CTR by 15-25%
- Deal badges improve conversion on badged items
- Saved searches drive 10%+ return visits
- Loyalty points increase repeat booking rate
- Abandonment recovery captures 5-10% of lost bookings
- Admin dashboard provides actionable optimization insights
