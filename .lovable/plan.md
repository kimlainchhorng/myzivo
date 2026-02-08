
# Restaurant Ads and Sponsored Listings System Implementation Plan

## Overview
Build a comprehensive restaurant advertising system that allows restaurants to pay for boosted visibility in search results and the homepage. The system includes merchant self-service ad management, customer-facing sponsored listings, admin oversight, impression/click tracking, and CPC-based billing.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `restaurant_ads` table | Available | id, restaurant_id, daily_budget, cost_per_click, start_date, end_date, status |
| `ad_impressions` table | Available | ad_id, restaurant_id, user_id, created_at |
| `ad_clicks` table | Available | ad_id, restaurant_id, user_id, created_at |
| `merchant_balances` table | Available | restaurant_id, pending, paid_out, currency |
| `restaurants` table | Complete | Full restaurant data with owner_id |
| Sponsored components | Complete | SponsoredBadge, SponsoredResultCard, SponsoredBanner |
| `sponsoredAds.ts` config | Complete | FTC-compliant rules, pricing models, disclosure text |
| `useMerchantRole` hook | Complete | Checks if user is merchant, returns restaurantId |
| `useRestaurants` hook | Complete | Fetches restaurants for customer app |
| `MobileEatsPremium` | Complete | Mobile Eats page with restaurant grid |
| `EatsRestaurants` | Complete | Desktop restaurant listing page |

### Missing
| Feature | Status |
|---------|--------|
| Merchant ads page `/merchant/ads` | Need to create |
| Admin ads page `/admin/ads` | Need to create |
| Restaurant ads data library `src/lib/restaurantAds.ts` | Need to create |
| Restaurant ads hooks `src/hooks/useRestaurantAds.ts` | Need to create |
| Sponsored restaurant display in customer app | Need to integrate |
| Impression/click tracking edge function | Need to create |
| Ad spend deduction from merchant balance | Need to create |
| Ad campaign builder UI | Need to create |
| Fraud monitoring for ads | Need to create |

---

## Database Schema Enhancement

### Extend `restaurant_ads` table
Add additional fields for enhanced campaign management:

```sql
ALTER TABLE restaurant_ads ADD COLUMN IF NOT EXISTS
  name TEXT,
  placement TEXT DEFAULT 'search', -- 'search', 'homepage', 'carousel', 'all'
  total_budget NUMERIC(10,2),
  spent NUMERIC(10,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  orders_from_ads INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true, -- Admin approval flag
  paused_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id);

CREATE INDEX idx_restaurant_ads_status ON restaurant_ads(status) WHERE status = 'active';
CREATE INDEX idx_restaurant_ads_restaurant ON restaurant_ads(restaurant_id);
```

### New Table: `ad_conversions`
Track orders that originated from ad clicks:

```sql
CREATE TABLE ad_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES restaurant_ads(id),
  click_id UUID NOT NULL REFERENCES ad_clicks(id),
  order_id UUID NOT NULL REFERENCES food_orders(id),
  revenue_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ad_conversions_ad ON ad_conversions(ad_id);
```

### New Table: `ad_billing_events`
Track billing events (charges against merchant balance):

```sql
CREATE TABLE ad_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES restaurant_ads(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  event_type TEXT NOT NULL, -- 'click_charge', 'budget_depleted', 'refund'
  amount_cents INTEGER NOT NULL,
  balance_after_cents INTEGER NOT NULL,
  click_id UUID REFERENCES ad_clicks(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Implementation Plan

### A) Restaurant Ads Data Library

**File to Create:** `src/lib/restaurantAds.ts`

```typescript
// Interfaces
export interface RestaurantAd {
  id: string;
  restaurantId: string;
  name: string;
  placement: 'search' | 'homepage' | 'carousel' | 'all';
  dailyBudget: number;
  totalBudget: number | null;
  spent: number;
  costPerClick: number;
  impressions: number;
  clicks: number;
  ordersFromAds: number;
  startDate: string | null;
  endDate: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'exhausted';
  isApproved: boolean;
  createdAt: string;
}

export interface AdStats {
  totalImpressions: number;
  totalClicks: number;
  totalSpent: number;
  totalOrders: number;
  totalRevenue: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  roas: number; // Return on ad spend
}

export interface SponsoredRestaurant {
  restaurant: Restaurant;
  adId: string;
  position: number;
}

// Functions
export async function getRestaurantAds(restaurantId: string): Promise<RestaurantAd[]>
export async function getAdById(adId: string): Promise<RestaurantAd | null>
export async function createAd(ad: Partial<RestaurantAd>): Promise<RestaurantAd>
export async function updateAd(id: string, updates: Partial<RestaurantAd>): Promise<void>
export async function pauseAd(id: string): Promise<void>
export async function resumeAd(id: string): Promise<void>
export async function deleteAd(id: string): Promise<void>
export async function getAdStats(adId: string, dateRange?: DateRange): Promise<AdStats>
export async function getMerchantAdStats(restaurantId: string): Promise<AdStats>
export async function getActiveAdsForPlacement(placement: string): Promise<SponsoredRestaurant[]>
export async function recordImpression(adId: string, userId: string | null): Promise<void>
export async function recordClick(adId: string, userId: string | null): Promise<string> // Returns click_id
export async function getMerchantBalance(restaurantId: string): Promise<number>
// Admin functions
export async function getAllAds(filters?: AdFilters): Promise<RestaurantAd[]>
export async function approveAd(id: string): Promise<void>
export async function rejectAd(id: string, reason: string): Promise<void>
export async function getAdsRevenue(dateRange?: DateRange): Promise<{ total: number; byDay: DailyRevenue[] }>
export async function getFraudSignals(): Promise<FraudSignal[]>
```

### B) Restaurant Ads Hooks

**File to Create:** `src/hooks/useRestaurantAds.ts`

```typescript
export function useRestaurantAds(restaurantId: string | undefined)
export function useAdById(adId: string | undefined)
export function useCreateAd()
export function useUpdateAd()
export function usePauseAd()
export function useResumeAd()
export function useDeleteAd()
export function useAdStats(adId: string | undefined)
export function useMerchantAdStats(restaurantId: string | undefined)
export function useSponsoredRestaurants(placement: string)
export function useMerchantBalance(restaurantId: string | undefined)
// Admin hooks
export function useAllAds(filters?: AdFilters)
export function useApproveAd()
export function useRejectAd()
export function useAdsRevenue(dateRange?: DateRange)
export function useAdFraudSignals()
```

### C) Merchant Ads Dashboard

**File to Create:** `src/pages/merchant/MerchantAdsPage.tsx`

**Route:** `/merchant/ads`

**Layout:**
```text
+----------------------------------------------------------+
|  Boost Your Restaurant                 [+ Create Campaign] |
+----------------------------------------------------------+
|                                                           |
|  +------------------+  +------------------+               |
|  | AD BALANCE       |  | ACTIVE CAMPAIGNS |               |
|  | $245.50          |  | 2                |               |
|  | [Add Funds]      |  |                  |               |
|  +------------------+  +------------------+               |
|                                                           |
|  +------------------+  +------------------+               |
|  | IMPRESSIONS      |  | CLICKS           |               |
|  | 12,450           |  | 856 (6.9% CTR)   |               |
|  +------------------+  +------------------+               |
|                                                           |
|  Active Campaigns                                         |
|  +------------------------------------------------------+|
|  | Weekend Special   | Active | $5/day | 1,234 imp      ||
|  | [Pause] [Edit] [Stats]                               ||
|  +------------------------------------------------------+|
|  | Lunch Rush        | Paused | $10/day | 2,456 imp     ||
|  | [Resume] [Edit] [Stats]                              ||
|  +------------------------------------------------------+|
|                                                           |
|  Performance Chart (7-day impressions/clicks)             |
|  [Line chart visualization]                               |
|                                                           |
+----------------------------------------------------------+
```

**Features:**
- Ad balance from `merchant_balances`
- Active campaign count
- Aggregate impressions/clicks with CTR
- Campaign list with status badges
- Pause/Resume/Edit actions
- Performance chart
- Create campaign button

### D) Merchant Ad Campaign Builder

**File to Create:** `src/components/merchant/AdCampaignBuilder.tsx`

**Features:**
- Step 1: Campaign Name & Placement
  - Name input
  - Placement selection (Search Results, Homepage Carousel, All)
  
- Step 2: Budget Configuration
  - Daily budget slider ($5 - $100)
  - Total budget (optional cap)
  - Cost per click display (fixed by platform, e.g., $0.25)
  
- Step 3: Schedule
  - Start immediately or schedule
  - End date (optional)
  
- Step 4: Preview & Launch
  - Campaign summary
  - Estimated impressions based on budget
  - Launch button

### E) Admin Ads Dashboard

**File to Create:** `src/pages/admin/AdminAdsPage.tsx`

**Route:** `/admin/ads`

**Layout:**
```text
+----------------------------------------------------------+
|  Restaurant Ads                        [Settings]          |
+----------------------------------------------------------+
|                                                           |
|  +------------------+  +------------------+               |
|  | TOTAL AD REVENUE |  | ACTIVE CAMPAIGNS |               |
|  | $12,450          |  | 24               |               |
|  +------------------+  +------------------+               |
|                                                           |
|  +------------------+  +------------------+               |
|  | PENDING APPROVAL |  | FRAUD SIGNALS    |               |
|  | 3                |  | 2 alerts         |               |
|  +------------------+  +------------------+               |
|                                                           |
|  [All Campaigns] [Pending] [Fraud Monitor] [Revenue]      |
|                                                           |
|  All Campaigns                                            |
|  +------------------------------------------------------+|
|  | Restaurant Name | Campaign | Status | Spent | CTR    ||
|  | Mario's Pizza   | Weekend  | Active | $45   | 5.2%   ||
|  | [View] [Pause] [Approve/Reject]                      ||
|  +------------------------------------------------------+|
|                                                           |
|  Revenue Over Time                                        |
|  [Area chart showing daily ad revenue]                    |
|                                                           |
+----------------------------------------------------------+
```

**Features:**
- Total revenue from ads
- Active campaigns count
- Pending approval queue
- Fraud signal alerts
- Campaign table with filters
- Approve/Reject actions
- Revenue trend chart
- Fraud monitoring panel

### F) Sponsored Restaurant Integration

**File to Modify:** `src/hooks/useEatsOrders.ts`

Enhance `useRestaurants` to include sponsored restaurants:

```typescript
export function useRestaurantsWithSponsored(onlyOpen: boolean = false) {
  return useQuery({
    queryKey: ["restaurants-with-sponsored", onlyOpen],
    queryFn: async () => {
      // Fetch regular restaurants
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("*")
        .eq("status", "active")
        .order("rating", { ascending: false });
      
      // Fetch active sponsored restaurants
      const { data: sponsoredAds } = await supabase
        .from("restaurant_ads")
        .select("id, restaurant_id, restaurants(*)")
        .eq("status", "active")
        .eq("is_approved", true)
        .lte("start_date", new Date().toISOString())
        .or("end_date.is.null,end_date.gte." + new Date().toISOString());
      
      // Merge: sponsored first, then organic
      const sponsoredIds = new Set(sponsoredAds?.map(a => a.restaurant_id));
      const organicRestaurants = restaurants?.filter(r => !sponsoredIds.has(r.id)) || [];
      
      return {
        sponsored: sponsoredAds?.map(a => ({
          ...a.restaurants,
          isSponsored: true,
          adId: a.id,
        })) || [],
        organic: organicRestaurants,
      };
    },
  });
}
```

### G) Sponsored Restaurant Card Component

**File to Create:** `src/components/eats/SponsoredRestaurantCard.tsx`

- Display restaurant with "Sponsored" badge
- Track impression on mount
- Track click on card click
- Same visual design as regular card with subtle highlight
- FTC-compliant disclosure tooltip

### H) Customer App Integration

**File to Modify:** `src/components/eats/MobileEatsPremium.tsx`

Add sponsored carousel at top:

```typescript
// Add sponsored section before main restaurant grid
{sponsoredRestaurants.length > 0 && (
  <section className="mb-8">
    <div className="flex items-center gap-2 mb-4 px-6">
      <SponsoredBadge size="md" />
      <span className="text-white/60 text-sm">Featured restaurants</span>
    </div>
    <div className="flex gap-4 px-6 overflow-x-auto hide-scrollbar">
      {sponsoredRestaurants.map(restaurant => (
        <SponsoredRestaurantCard 
          key={restaurant.id}
          restaurant={restaurant}
          adId={restaurant.adId}
          onImpression={() => recordImpression(restaurant.adId)}
          onClick={() => handleSponsoredClick(restaurant)}
        />
      ))}
    </div>
  </section>
)}
```

**File to Modify:** `src/pages/EatsRestaurants.tsx`

Add sponsored restaurants at top of grid with clear labeling.

### I) Impression/Click Tracking Edge Function

**File to Create:** `supabase/functions/track-ad-event/index.ts`

**Handles:**
1. Record impression (debounced, 1 per user per ad per hour)
2. Record click and generate click_id
3. Charge merchant on click (deduct from balance)
4. Update ad stats (impressions, clicks, spent)
5. Check daily budget exhaustion
6. Pause ad if budget depleted

```typescript
// POST /track-ad-event
// Body: { adId, eventType: 'impression' | 'click', userId? }

if (eventType === 'click') {
  // 1. Get ad details
  const { data: ad } = await supabase
    .from("restaurant_ads")
    .select("*, restaurants(id)")
    .eq("id", adId)
    .single();
  
  // 2. Record click
  const { data: click } = await supabase
    .from("ad_clicks")
    .insert({ ad_id: adId, restaurant_id: ad.restaurant_id, user_id: userId })
    .select()
    .single();
  
  // 3. Deduct from merchant balance (CPC charge)
  const chargeAmount = Math.round(ad.cost_per_click * 100); // Convert to cents
  await supabase.rpc("deduct_merchant_balance", {
    p_restaurant_id: ad.restaurant_id,
    p_amount_cents: chargeAmount,
  });
  
  // 4. Update ad spent amount
  await supabase
    .from("restaurant_ads")
    .update({ 
      spent: ad.spent + ad.cost_per_click,
      clicks: ad.clicks + 1,
    })
    .eq("id", adId);
  
  // 5. Check if daily budget exhausted
  const todaySpent = await getTodaySpent(adId);
  if (todaySpent >= ad.daily_budget) {
    await supabase
      .from("restaurant_ads")
      .update({ status: 'exhausted' })
      .eq("id", adId);
  }
  
  return { clickId: click.id };
}
```

### J) Ad Conversion Tracking

**File to Modify:** `src/hooks/useEatsOrders.ts`

In `useCreateFoodOrder`, check for recent ad click:

```typescript
// Check if user clicked an ad for this restaurant recently
const recentClick = localStorage.getItem(`ad_click_${restaurantId}`);
if (recentClick) {
  const { clickId, timestamp } = JSON.parse(recentClick);
  const hourAgo = Date.now() - 3600000;
  if (timestamp > hourAgo) {
    // Record conversion
    await supabase.from("ad_conversions").insert({
      ad_id: adId,
      click_id: clickId,
      order_id: order.id,
      revenue_cents: Math.round(input.total * 100),
    });
  }
  localStorage.removeItem(`ad_click_${restaurantId}`);
}
```

### K) Fraud Monitoring

**File to Create:** `src/components/admin/ads/AdFraudMonitor.tsx`

**Rules to detect:**
- Same user clicking same ad many times (click fraud)
- High click rate but zero conversions
- Clicks from suspicious IPs (future)
- Unusual click patterns (bursts)

```typescript
// Fraud detection query
const { data: suspiciousAds } = await supabase
  .from("restaurant_ads")
  .select("*")
  .gt("clicks", 100)
  .lt("orders_from_ads", 1) // High clicks, no orders
  .eq("status", "active");

// Detect click bombing
const { data: clickBombs } = await supabase
  .from("ad_clicks")
  .select("ad_id, user_id, count")
  .group("ad_id, user_id")
  .having("count", "gt", 10); // Same user > 10 clicks
```

### L) Routes Configuration

**File to Modify:** `src/App.tsx`

```typescript
// Lazy imports
const MerchantAdsPage = lazy(() => import("./pages/merchant/MerchantAdsPage"));
const AdminAdsPage = lazy(() => import("./pages/admin/AdminAdsPage"));

// Routes
<Route path="/merchant/ads" element={<ProtectedRoute><MerchantAdsPage /></ProtectedRoute>} />
<Route path="/admin/ads" element={<ProtectedRoute requireAdmin><AdminAdsPage /></ProtectedRoute>} />
```

---

## File Summary

### Database Migration
| Change | Purpose |
|--------|---------|
| Extend `restaurant_ads` table | Add placement, budgets, stats, approval |
| Create `ad_conversions` table | Track order conversions |
| Create `ad_billing_events` table | Billing audit trail |
| Create RPC `deduct_merchant_balance` | Atomic balance deduction |

### New Files (12)
| File | Purpose |
|------|---------|
| `src/lib/restaurantAds.ts` | Ad data functions |
| `src/hooks/useRestaurantAds.ts` | React Query hooks |
| `src/pages/merchant/MerchantAdsPage.tsx` | Merchant ad dashboard |
| `src/components/merchant/AdCampaignBuilder.tsx` | Campaign creator |
| `src/components/merchant/AdPerformanceChart.tsx` | Performance visualization |
| `src/pages/admin/AdminAdsPage.tsx` | Admin ad management |
| `src/components/admin/ads/AdApprovalQueue.tsx` | Pending approvals |
| `src/components/admin/ads/AdFraudMonitor.tsx` | Fraud detection |
| `src/components/admin/ads/AdRevenueChart.tsx` | Revenue trends |
| `src/components/eats/SponsoredRestaurantCard.tsx` | Sponsored card with badge |
| `supabase/functions/track-ad-event/index.ts` | Impression/click tracking |
| Migration SQL file | Schema changes |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add merchant/admin ads routes |
| `src/hooks/useEatsOrders.ts` | Add sponsored restaurant fetching, conversion tracking |
| `src/components/eats/MobileEatsPremium.tsx` | Add sponsored carousel |
| `src/pages/EatsRestaurants.tsx` | Add sponsored restaurants at top |

---

## Data Flow

```text
Merchant Creates Ad Campaign
        ↓
    [Draft → Active]
        ↓
Ad appears in customer app
        ↓
track-ad-event (impression)
  └── Insert ad_impressions
  └── Update ad.impressions count
        ↓
User clicks restaurant
        ↓
track-ad-event (click)
  └── Insert ad_clicks
  └── Deduct CPC from merchant_balance
  └── Insert ad_billing_events
  └── Update ad.clicks, ad.spent
  └── Check daily_budget → pause if exhausted
  └── Store click_id in localStorage
        ↓
User places order
        ↓
Check localStorage for recent click
        ↓
Record ad_conversion
        ↓
Update ad.orders_from_ads
```

---

## Ranking Logic (MVP)

```typescript
function sortRestaurantsWithSponsored(
  sponsored: SponsoredRestaurant[],
  organic: Restaurant[]
): Restaurant[] {
  // Sponsored always first (max 3 per SPONSORED_RULES.maxPerPage)
  const topSponsored = sponsored.slice(0, 3);
  
  // Organic sorted by rating (existing logic)
  const sortedOrganic = organic.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  
  return [
    ...topSponsored.map(s => ({ ...s.restaurant, isSponsored: true, adId: s.adId })),
    ...sortedOrganic,
  ];
}
```

---

## Billing Flow (MVP)

For MVP, we use merchant balance (already exists):

1. **Merchant adds funds** → Credits go to `merchant_balances.pending`
2. **Ad click occurs** → Deduct CPC from balance
3. **Balance runs low** → Show warning, pause ads when $0
4. **Later: Stripe integration** → Auto-recharge when balance low

```sql
-- RPC: deduct_merchant_balance
CREATE OR REPLACE FUNCTION deduct_merchant_balance(
  p_restaurant_id UUID,
  p_amount_cents INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  SELECT pending INTO current_balance
  FROM merchant_balances
  WHERE restaurant_id = p_restaurant_id
  FOR UPDATE;
  
  IF current_balance >= (p_amount_cents / 100.0) THEN
    UPDATE merchant_balances
    SET pending = pending - (p_amount_cents / 100.0)
    WHERE restaurant_id = p_restaurant_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE; -- Insufficient balance
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## FTC Compliance

All sponsored content follows existing `sponsoredAds.ts` rules:

1. **Clear "Sponsored" badge** on all promoted restaurants
2. **Disclosure tooltip** explaining sponsored content
3. **No deceptive pricing** - prices shown are real
4. **Organic results preserved** - sponsored doesn't hide cheaper options
5. **Maximum 3 sponsored** per page (configurable)

---

## Summary

This implementation creates a complete restaurant advertising system:

1. **Merchant Dashboard** (`/merchant/ads`) with campaign creation, budget management, and performance tracking
2. **Admin Dashboard** (`/admin/ads`) with campaign oversight, approval queue, revenue tracking, and fraud monitoring
3. **Customer Integration** with sponsored restaurant carousel and search result placement
4. **Tracking System** for impressions, clicks, and conversions via edge function
5. **CPC Billing** deducting from merchant balance on each click
6. **Fraud Detection** identifying suspicious click patterns
7. **FTC Compliance** using existing sponsored badge and disclosure infrastructure

All integrated with existing `restaurant_ads`, `ad_impressions`, `ad_clicks`, and `merchant_balances` tables.
