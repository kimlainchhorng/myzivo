
# Marketing Automation and Campaigns System Implementation Plan

## Overview
Build a comprehensive marketing automation system that enables admin to create, schedule, and manage campaigns that automatically send promo codes, push notifications, re-engage inactive users, and boost slow restaurants. This leverages existing `marketing_campaigns`, `marketing_campaign_stats`, and `notifications` tables, along with established promo and push notification infrastructure.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `marketing_campaigns` table | ✅ Available | Database with name, type, status, target_audience |
| `marketing_campaign_stats` table | ✅ Available | users_targeted, notifications_sent, orders_generated |
| `zivo_promo_campaigns` table | ✅ Available | Full promo campaign infrastructure |
| `zivo_promo_codes` table | ✅ Available | Code generation and tracking |
| `notifications` table | ✅ Available | Multi-channel notification storage |
| `send-push-notification` edge function | ✅ Complete | iOS, Android, Web push support |
| `usePromotions` hook | ✅ Complete | Campaign CRUD, code validation |
| `profiles` table | ✅ Available | User info including email, phone |
| `food_orders` table | ✅ Available | Order history for targeting |
| `AdminEmailCampaigns` component | ✅ Mock data | Email campaign UI template |

### Missing
| Feature | Status |
|---------|--------|
| Marketing dashboard pages | `/admin/marketing/*` routes |
| Campaign builder UI | Create/edit campaigns form |
| Targeting rules engine | Filter users by criteria |
| `marketing.ts` data library | Campaign CRUD functions |
| Campaign execution edge function | Auto-send notifications |
| Campaign scheduling | Cron job for scheduled campaigns |
| User wallet for saved promos | Store assigned codes per user |
| Campaign reporting | Stats visualization |

---

## Database Schema Enhancement

### New Table: `campaign_deliveries`
Track individual campaign deliveries to users:

```sql
CREATE TABLE campaign_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_id UUID REFERENCES notifications(id),
  promo_code_id UUID REFERENCES promo_codes(id),
  status TEXT DEFAULT 'pending', -- pending, sent, failed, converted
  sent_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  conversion_order_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaign_deliveries_campaign ON campaign_deliveries(campaign_id);
CREATE INDEX idx_campaign_deliveries_user ON campaign_deliveries(user_id);
```

### New Table: `user_promo_wallet`
Store assigned promo codes per user:

```sql
CREATE TABLE user_promo_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  campaign_id UUID REFERENCES marketing_campaigns(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, promo_code_id)
);
```

### Extend `marketing_campaigns`
Add new columns:

```sql
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS
  title TEXT,
  notification_title TEXT,
  notification_body TEXT,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  credits_amount INTEGER DEFAULT 0,
  target_criteria JSONB DEFAULT '{}',
  target_city TEXT,
  target_restaurant_id UUID,
  executed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id);
```

---

## Implementation Plan

### A) Marketing Data Library

**File to Create:** `src/lib/marketing.ts`

```typescript
// Interfaces
export interface MarketingCampaign {
  id: string;
  name: string;
  campaign_type: "promo" | "push" | "winback" | "restaurant_boost";
  status: "draft" | "scheduled" | "running" | "completed" | "paused";
  target_audience: "all" | "inactive" | "city" | "segment" | "restaurant_customers";
  target_criteria: {
    last_order_days_ago?: number;
    min_total_orders?: number;
    max_total_orders?: number;
    city?: string;
    membership_status?: string;
    restaurant_id?: string;
  };
  message: string | null;
  notification_title: string | null;
  notification_body: string | null;
  promo_code_id: string | null;
  credits_amount: number;
  start_date: string | null;
  end_date: string | null;
  push_enabled: boolean;
  email_enabled: boolean;
  created_at: string;
  created_by: string | null;
}

export interface CampaignStats {
  users_targeted: number;
  notifications_sent: number;
  orders_generated: number;
  revenue_generated: number;
}

// Functions
export async function getCampaigns(): Promise<MarketingCampaign[]>
export async function getCampaign(id: string): Promise<MarketingCampaign | null>
export async function createCampaign(campaign: Partial<MarketingCampaign>): Promise<MarketingCampaign>
export async function updateCampaign(id: string, updates: Partial<MarketingCampaign>): Promise<void>
export async function deleteCampaign(id: string): Promise<void>
export async function getCampaignStats(id: string): Promise<CampaignStats>
export async function getTargetedUsers(criteria: CampaignTargetCriteria): Promise<TargetedUser[]>
export async function previewCampaign(id: string): Promise<{ count: number; sample: TargetedUser[] }>
export async function executeCampaign(id: string): Promise<ExecutionResult>
```

### B) Marketing Hooks

**File to Create:** `src/hooks/useMarketing.ts`

```typescript
export function useCampaigns()
export function useCampaign(id: string | undefined)
export function useCampaignStats(id: string | undefined)
export function useCreateCampaign()
export function useUpdateCampaign()
export function useDeleteCampaign()
export function useExecuteCampaign()
export function useTargetPreview(criteria: CampaignTargetCriteria)
```

### C) Marketing Hub Page

**File to Create:** `src/pages/admin/marketing/MarketingHub.tsx`

**Route:** `/admin/marketing`

**Layout:**
```text
+----------------------------------------------------------+
|  Marketing Hub                        [+ New Campaign]    |
+----------------------------------------------------------+
|                                                           |
|  +------------------+  +------------------+               |
|  | ACTIVE CAMPAIGNS |  | USERS REACHED    |               |
|  | 3                |  | 12,450           |               |
|  +------------------+  +------------------+               |
|                                                           |
|  +------------------+  +------------------+               |
|  | ORDERS GENERATED |  | REVENUE IMPACT   |               |
|  | 856              |  | $24,320          |               |
|  +------------------+  +------------------+               |
|                                                           |
|  Quick Actions                                            |
|  [Campaigns] [Email Flows] [Promo Codes] [Analytics]     |
|                                                           |
|  Recent Campaigns                                         |
|  +------------------------------------------------------+|
|  | Win-back Inactive    | Running  | 2,340 sent         ||
|  | Weekend Flash Sale   | Scheduled| Starts Sat 10am    ||
|  | New User Welcome     | Completed| 890 conversions    ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

**Features:**
- KPI cards with aggregate stats
- Quick action navigation
- Recent campaigns list with status badges
- Create campaign button

### D) Campaigns List Page

**File to Create:** `src/pages/admin/marketing/CampaignsPage.tsx`

**Route:** `/admin/marketing/campaigns`

**Features:**
- Filterable table of all campaigns
- Status filter (All, Draft, Scheduled, Running, Completed)
- Type filter (Promo, Push, Winback, Boost)
- Bulk actions (pause, delete)
- Create new campaign button

### E) Campaign Detail Page

**File to Create:** `src/pages/admin/marketing/CampaignDetailPage.tsx`

**Route:** `/admin/marketing/campaigns/:id`

**Features:**
- Campaign info header with status badge
- Edit campaign button (if draft/scheduled)
- Pause/Resume button (if running)
- Performance stats cards
- Delivery timeline
- Targeted users preview
- Conversion tracking chart

### F) Campaign Builder

**File to Create:** `src/components/marketing/CampaignBuilder.tsx`

**Features:**
- Step 1: Campaign Type Selection
  - Promo campaign (discount or credits)
  - Push notification campaign
  - Win-back campaign (inactive users)
  - Restaurant boost campaign

- Step 2: Targeting Rules
  - All users
  - Inactive users (no order in X days)
  - Users by city
  - Users by order count
  - Restaurant customers
  - Preview targeted count

- Step 3: Message Configuration
  - Notification title
  - Notification body (with variables: {first_name}, {promo_code})
  - Promo code selection (optional)
  - Credits amount (optional)

- Step 4: Schedule
  - Send immediately
  - Schedule for specific date/time
  - Set end date

- Step 5: Review & Launch
  - Summary of all settings
  - Preview message
  - Launch/Schedule button

### G) Targeting Engine Component

**File to Create:** `src/components/marketing/TargetingRulesBuilder.tsx`

**Features:**
- Visual rule builder
- Condition types:
  - Last order date (days ago)
  - Total orders (min/max)
  - City selection
  - Membership status
  - Restaurant ID (for boost campaigns)
- Live preview of targeted user count
- Sample user list

### H) Campaign Execution Edge Function

**File to Create:** `supabase/functions/execute-campaign/index.ts`

**Functionality:**
1. Validate campaign is scheduled and ready
2. Query targeted users based on criteria
3. For each user:
   - Insert notification record
   - Send push notification via send-push-notification
   - Assign promo code if configured
   - Add credits if configured
   - Record delivery in campaign_deliveries
4. Update campaign status to "running"
5. Update campaign_stats

```typescript
// Targeting query example
const targetedUsers = await supabase
  .from("profiles")
  .select("id, email, full_name, user_id")
  .leftJoin("food_orders", (join) => 
    join.on("profiles.user_id", "=", "food_orders.customer_id")
  )
  .filter((profile) => {
    if (criteria.last_order_days_ago) {
      // Filter by last order date
    }
    if (criteria.city) {
      // Filter by city from saved_locations
    }
    // etc.
  });
```

### I) Campaign Scheduler Edge Function

**File to Create:** `supabase/functions/campaign-scheduler/index.ts`

**Runs via pg_cron every 5 minutes:**
- Query campaigns with status='scheduled' and start_date <= now()
- Call execute-campaign for each
- Query campaigns with status='running' and end_date <= now()
- Update status to 'completed'

**Cron Setup SQL:**
```sql
SELECT cron.schedule(
  'campaign-scheduler',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://slirphzzwcogdbkeicff.supabase.co/functions/v1/campaign-scheduler',
    headers:='{"Authorization": "Bearer <anon_key>"}'::jsonb
  );
  $$
);
```

### J) User Promo Wallet Component

**File to Create:** `src/components/eats/UserPromoWallet.tsx`

**Features:**
- Display saved promo codes for user
- Show expiration dates
- Quick apply to cart
- Mark as used when redeemed

### K) Merchant Notification

When a "restaurant_boost" campaign runs:
- Send notification to restaurant owner
- Show campaign banner in merchant dashboard
- Track orders from campaign

---

## Routes Configuration

**File to Modify:** `src/App.tsx`

```typescript
// Marketing Routes
const MarketingHub = lazy(() => import("./pages/admin/marketing/MarketingHub"));
const CampaignsPage = lazy(() => import("./pages/admin/marketing/CampaignsPage"));
const CampaignDetailPage = lazy(() => import("./pages/admin/marketing/CampaignDetailPage"));

// Routes
<Route path="/admin/marketing" element={<ProtectedRoute requireAdmin><MarketingHub /></ProtectedRoute>} />
<Route path="/admin/marketing/campaigns" element={<ProtectedRoute requireAdmin><CampaignsPage /></ProtectedRoute>} />
<Route path="/admin/marketing/campaigns/:id" element={<ProtectedRoute requireAdmin><CampaignDetailPage /></ProtectedRoute>} />
```

---

## File Summary

### Database Migration
| Change | Purpose |
|--------|---------|
| Create `campaign_deliveries` table | Track individual deliveries |
| Create `user_promo_wallet` table | Store assigned promos |
| Extend `marketing_campaigns` | Add notification and targeting fields |

### New Files (12)
| File | Purpose |
|------|---------|
| `src/lib/marketing.ts` | Marketing data functions |
| `src/hooks/useMarketing.ts` | React Query hooks |
| `src/pages/admin/marketing/MarketingHub.tsx` | Main marketing dashboard |
| `src/pages/admin/marketing/CampaignsPage.tsx` | Campaigns list |
| `src/pages/admin/marketing/CampaignDetailPage.tsx` | Campaign detail/stats |
| `src/components/marketing/CampaignBuilder.tsx` | Multi-step campaign creator |
| `src/components/marketing/TargetingRulesBuilder.tsx` | Audience targeting UI |
| `src/components/marketing/CampaignStatsCard.tsx` | Stats visualization |
| `src/components/eats/UserPromoWallet.tsx` | User's saved promos |
| `supabase/functions/execute-campaign/index.ts` | Campaign execution logic |
| `supabase/functions/campaign-scheduler/index.ts` | Scheduled campaign runner |
| Migration SQL | Database schema changes |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add marketing routes |
| `src/pages/mobile/MobileAccount.tsx` | Add "My Promos" link |

---

## Targeting Rules Implementation

### Query Builder for User Targeting

```typescript
async function getTargetedUsers(criteria: TargetCriteria) {
  let query = supabase.from("profiles").select(`
    id,
    user_id,
    email,
    full_name,
    phone
  `);

  // Filter by last order date
  if (criteria.last_order_days_ago) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - criteria.last_order_days_ago);
    
    // Get users with no orders after cutoff
    const { data: activeUsers } = await supabase
      .from("food_orders")
      .select("customer_id")
      .gte("created_at", cutoffDate.toISOString())
      .eq("status", "completed");
    
    const activeIds = new Set(activeUsers?.map(o => o.customer_id));
    // Filter out active users
  }

  // Filter by city
  if (criteria.city) {
    const { data: cityUsers } = await supabase
      .from("saved_locations")
      .select("user_id")
      .eq("city", criteria.city);
    // Filter to city users
  }

  // Filter by total orders
  if (criteria.min_total_orders || criteria.max_total_orders) {
    // Aggregate order counts
  }

  // Filter by membership
  if (criteria.membership_status) {
    const { data: members } = await supabase
      .from("user_memberships")
      .select("user_id")
      .eq("status", criteria.membership_status);
    // Filter by membership
  }

  return query;
}
```

### Anomaly Detection Rules (from existing system)

Integrate with existing `check-fraud-signals` to exclude:
- Users with high refund rate
- Users flagged for fraud
- Users on block list

---

## Campaign Execution Flow

```text
Admin Creates Campaign
        ↓
    [Draft Status]
        ↓
Admin Sets Schedule
        ↓
    [Scheduled Status]
        ↓
campaign-scheduler runs (every 5 min)
        ↓
Checks start_date <= now()
        ↓
Calls execute-campaign edge function
        ↓
    [Running Status]
        ↓
For each targeted user:
  ├── Insert notification
  ├── Call send-push-notification
  ├── Assign promo code (if configured)
  ├── Add credits (if configured)
  └── Record in campaign_deliveries
        ↓
Update campaign_stats
        ↓
campaign-scheduler checks end_date
        ↓
    [Completed Status]
```

---

## Campaign Reporting

### Stats to Track

| Metric | Source |
|--------|--------|
| Users Targeted | COUNT of campaign_deliveries |
| Notifications Sent | COUNT where status='sent' |
| Push Delivered | Push notification logs |
| Orders Generated | COUNT food_orders with conversion_order_id |
| Revenue Generated | SUM of order total_amount |
| Conversion Rate | Orders / Notifications Sent |
| Promo Codes Redeemed | COUNT from promo_redemptions |

### Reporting UI

- Time-series chart of deliveries
- Conversion funnel visualization
- Top performing campaigns table
- Export to CSV

---

## User Experience

### Customer Side

1. **Notification Arrives**
   - Push notification with campaign message
   - Tap opens app to relevant page

2. **Promo Auto-Applied**
   - If promo code assigned, appears in "My Promos"
   - Auto-applies at checkout if conditions met

3. **Credits Added**
   - Credits appear in wallet
   - Notification confirms credit amount

### Merchant Side (for Boost Campaigns)

1. **Notification to Owner**
   - "Your restaurant is featured in a ZIVO campaign!"
   
2. **Dashboard Banner**
   - Shows active boost campaigns
   - Expected traffic increase

3. **Order Attribution**
   - Orders from campaign marked with campaign_id
   - Revenue from campaign visible in analytics

---

## Security Considerations

1. **Admin-only access** - All marketing routes protected
2. **Rate limiting** - Max 10,000 notifications per campaign execution batch
3. **Opt-out respect** - Skip users with `marketing_opt_in = false`
4. **Fraud exclusion** - Skip users flagged in risk_events
5. **Promo abuse prevention** - Check per_user_limit before assignment

---

## Performance Optimization

1. **Batch processing** - Process 100 users per batch in edge function
2. **Async notifications** - Queue push notifications
3. **Caching** - Cache targeted user counts
4. **Pagination** - Paginate campaign list and delivery history

---

## Summary

This implementation creates a complete marketing automation system:

1. **Marketing Dashboard** at `/admin/marketing` with KPIs and quick actions
2. **Campaign Builder** with multi-step wizard for promo, push, winback, and boost campaigns
3. **Targeting Engine** filtering users by order history, city, membership, and more
4. **Automatic Delivery** via edge function with push notifications and promo assignment
5. **Scheduling System** with pg_cron for automated campaign start/end
6. **User Promo Wallet** for saved promotional codes
7. **Comprehensive Reporting** with conversion tracking and revenue attribution
8. **Merchant Notifications** for restaurant boost campaigns

All integrated with existing promo code, notification, and push infrastructure.
