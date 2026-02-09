
# Segmented Push Notifications & Broadcast System Implementation Plan

## Overview
Build a comprehensive admin-facing push notification broadcast system that enables sending targeted push notifications to user segments (customers, drivers, merchants), individual users, or all users. The system includes segment rule building, campaign management, scheduled sends, delivery logging, and safety controls.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `push_subscriptions` table | Complete | user_id, endpoint, p256dh, auth, is_active, platform |
| `push_notification_logs` table | Complete | user_id, title, body, status, sent_at, error_message |
| `send-push-notification` edge function | Complete | VAPID web push + FCM/APNs support |
| `profiles` table | Complete | user_id, email, full_name, phone, status, city-related data |
| `user_roles` table | Complete | user_id, role (admin, driver, etc.) |
| `drivers` table | Complete | user_id, is_online, status, city data |
| `notifications` table | Complete | user_id, title, body, channel, is_read |
| Marketing campaigns system | Complete | `/admin/marketing/*` with targeting engine |
| `CampaignTargetCriteria` | Complete | last_order_days_ago, city, membership_status |
| `getTargetedUsers()` function | Complete | Resolves users from criteria |
| `execute-campaign` edge function | Complete | Sends to targeted users |
| `campaign-scheduler` edge function | Complete | Scheduled campaign execution |
| AdminProtectedRoute | Complete | Role-based admin access control |

### Missing
| Feature | Status |
|---------|--------|
| `push_segments` table | Need to create |
| `push_campaigns` table | Need to create |
| `push_delivery_log` table | Need to create |
| `/admin/push` dashboard | Need to create |
| `/admin/push/segments` management | Need to create |
| `/admin/push/campaigns` listing | Need to create |
| `/admin/push/campaigns/[id]` detail | Need to create |
| Segment rule builder UI | Need to create |
| `send-segment-push` edge function | Need to create |
| `push-campaign-scheduler` edge function | Need to create |
| Rate limiting per user | Need to add |
| Unsubscribe checking | Need to add |

---

## Database Schema

### New Table: `push_segments`
Reusable audience segments with JSON rules:

```sql
CREATE TABLE push_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rules_json JSONB NOT NULL DEFAULT '{}',
  estimated_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_push_segments_active ON push_segments(is_active) WHERE is_active = true;
```

### New Table: `push_campaigns`
Push notification campaigns with scheduling:

```sql
CREATE TABLE push_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT, -- Deep link or action URL
  icon TEXT, -- Custom icon (optional)
  segment_id UUID REFERENCES push_segments(id),
  target_type TEXT DEFAULT 'segment', -- 'segment', 'all', 'test'
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  send_at TIMESTAMPTZ, -- NULL = send now
  sent_at TIMESTAMPTZ,
  targeted_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_push_campaigns_status ON push_campaigns(status);
CREATE INDEX idx_push_campaigns_scheduled ON push_campaigns(status, send_at) 
  WHERE status = 'scheduled';
```

### New Table: `push_delivery_log`
Delivery results for each user:

```sql
CREATE TABLE push_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES push_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL, -- 'sent', 'failed', 'skipped'
  error TEXT,
  skip_reason TEXT, -- 'no_subscription', 'rate_limited', 'unsubscribed'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_push_delivery_log_campaign ON push_delivery_log(campaign_id);
CREATE INDEX idx_push_delivery_log_user ON push_delivery_log(user_id);
```

### New Table: `push_user_daily_limits`
Track daily push count per user for rate limiting:

```sql
CREATE TABLE push_user_daily_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  push_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

CREATE INDEX idx_push_daily_limits_date ON push_user_daily_limits(date);
```

---

## Segment Rules Schema

The `rules_json` field supports these MVP rules:

```typescript
interface SegmentRules {
  // Role-based targeting
  roles?: ('customer' | 'driver' | 'merchant' | 'admin')[];
  
  // Driver-specific
  driver_is_online?: boolean;
  driver_status?: 'active' | 'inactive' | 'suspended';
  
  // Customer activity
  last_order_days_ago?: number; // Inactive if > this value
  has_ordered_ever?: boolean;
  
  // Membership
  has_membership?: boolean;
  
  // Location (if available)
  city?: string;
  
  // Custom SQL filter (advanced, admin only)
  custom_filter?: string;
}
```

**Example Segments:**
| Segment Name | Rules |
|--------------|-------|
| All Drivers Online | `{ "roles": ["driver"], "driver_is_online": true }` |
| Inactive Customers (14+ days) | `{ "roles": ["customer"], "last_order_days_ago": 14 }` |
| All Merchants | `{ "roles": ["merchant"] }` |
| Baton Rouge Customers | `{ "roles": ["customer"], "city": "Baton Rouge" }` |
| ZIVO+ Members | `{ "has_membership": true }` |

---

## Implementation Plan

### A) Push Data Library

**File to Create:** `src/lib/pushBroadcast.ts`

```typescript
// Interfaces
export interface PushSegment {
  id: string;
  name: string;
  description: string | null;
  rulesJson: SegmentRules;
  estimatedCount: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
}

export interface PushCampaign {
  id: string;
  name: string;
  title: string;
  body: string;
  url: string | null;
  segmentId: string | null;
  targetType: 'segment' | 'all' | 'test';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sendAt: string | null;
  sentAt: string | null;
  targetedCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  createdAt: string;
  segment?: PushSegment;
}

export interface PushDeliveryLog {
  id: string;
  campaignId: string;
  userId: string;
  status: 'sent' | 'failed' | 'skipped';
  error: string | null;
  skipReason: string | null;
  createdAt: string;
}

// Segment CRUD
export async function getSegments(): Promise<PushSegment[]>
export async function getSegment(id: string): Promise<PushSegment | null>
export async function createSegment(segment: Partial<PushSegment>): Promise<PushSegment>
export async function updateSegment(id: string, updates: Partial<PushSegment>): Promise<void>
export async function deleteSegment(id: string): Promise<void>
export async function estimateSegmentSize(rules: SegmentRules): Promise<number>
export async function previewSegmentUsers(rules: SegmentRules, limit?: number): Promise<User[]>

// Campaign CRUD
export async function getCampaigns(): Promise<PushCampaign[]>
export async function getCampaign(id: string): Promise<PushCampaign | null>
export async function createCampaign(campaign: Partial<PushCampaign>): Promise<PushCampaign>
export async function updateCampaign(id: string, updates: Partial<PushCampaign>): Promise<void>
export async function deleteCampaign(id: string): Promise<void>
export async function sendCampaignNow(id: string): Promise<{ sent: number; failed: number }>
export async function scheduleCampaign(id: string, sendAt: Date): Promise<void>

// Delivery Logs
export async function getCampaignDeliveryLogs(campaignId: string, limit?: number): Promise<PushDeliveryLog[]>
export async function getPushStats(): Promise<PushStats>
```

### B) Push Broadcast Hooks

**File to Create:** `src/hooks/usePushBroadcast.ts`

```typescript
// Segment hooks
export function useSegments()
export function useSegment(id: string | undefined)
export function useCreateSegment()
export function useUpdateSegment()
export function useDeleteSegment()
export function useSegmentPreview(rules: SegmentRules, enabled?: boolean)

// Campaign hooks
export function usePushCampaigns()
export function usePushCampaign(id: string | undefined)
export function useCreatePushCampaign()
export function useUpdatePushCampaign()
export function useDeletePushCampaign()
export function useSendPushCampaign()
export function useSchedulePushCampaign()

// Delivery & Stats hooks
export function usePushDeliveryLogs(campaignId: string | undefined)
export function usePushStats()
```

### C) Admin Push Dashboard

**File to Create:** `src/pages/admin/push/PushDashboard.tsx`

**Route:** `/admin/push`

**Layout:**
```text
+----------------------------------------------------------+
|  Push Notifications                   [+ New Campaign]    |
+----------------------------------------------------------+
|                                                           |
|  +------------------+  +------------------+               |
|  | TOTAL SENT       |  | ACTIVE SEGMENTS  |               |
|  | 12,450           |  | 8                |               |
|  +------------------+  +------------------+               |
|                                                           |
|  +------------------+  +------------------+               |
|  | SCHEDULED        |  | DELIVERY RATE    |               |
|  | 3 campaigns      |  | 94.5%            |               |
|  +------------------+  +------------------+               |
|                                                           |
|  Quick Actions                                            |
|  +------------------------------------------------------+|
|  | [Manage Segments] [All Campaigns] [Send Test]        ||
|  +------------------------------------------------------+|
|                                                           |
|  Recent Campaigns                                         |
|  +------------------------------------------------------+|
|  | Flash Sale Alert | Sent | 2,345 delivered | 2 hrs ago||
|  | Driver Boost     | Sent | 128 delivered   | 5 hrs ago||
|  | Weekend Special  | Scheduled | Feb 10     | [Cancel] ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

### D) Segments Management Page

**File to Create:** `src/pages/admin/push/SegmentsPage.tsx`

**Route:** `/admin/push/segments`

**Features:**
- List all segments with estimated user counts
- Create new segment with rule builder
- Edit/delete segments
- Preview matching users

### E) Segment Rule Builder Component

**File to Create:** `src/components/admin/push/SegmentRuleBuilder.tsx`

**Features:**
- Visual rule builder (no JSON editing required for MVP rules)
- Role selector (Customer, Driver, Merchant checkboxes)
- Driver online toggle
- Inactive days slider
- Membership toggle
- City dropdown (from available cities)
- Real-time estimated count

**Layout:**
```text
+------------------------------------------------------+
| Segment Rules                                         |
+------------------------------------------------------+
| Target Roles:                                         |
| [x] Customers  [ ] Drivers  [ ] Merchants            |
|                                                       |
| Driver Status: (only if Driver selected)              |
| ( ) All  (•) Online Only  ( ) Offline Only           |
|                                                       |
| Customer Activity:                                    |
| [ ] Inactive for [14] days or more                   |
| [ ] Has placed at least one order                    |
|                                                       |
| Membership:                                           |
| ( ) Any  (•) ZIVO+ Members Only  ( ) Non-Members     |
|                                                       |
| Location:                                             |
| [All Cities         ▼]                                |
|                                                       |
| Estimated Reach: ~2,345 users                         |
+------------------------------------------------------+
```

### F) Campaigns Listing Page

**File to Create:** `src/pages/admin/push/CampaignsPage.tsx`

**Route:** `/admin/push/campaigns`

**Features:**
- List all push campaigns with status badges
- Filter by status (draft, scheduled, sent)
- Quick actions: Send Now, Schedule, Delete
- Link to detail page

### G) Campaign Detail/Create Page

**File to Create:** `src/pages/admin/push/CampaignDetailPage.tsx`

**Route:** `/admin/push/campaigns/:id` (or `/admin/push/campaigns/new`)

**Features:**
- Campaign name input
- Title & Body inputs with character counters
- URL input (optional deep link)
- Segment selector (dropdown of saved segments)
- Or "Send to All Users" toggle
- Schedule picker or "Send Now" button
- Test send to current user
- Preview notification appearance
- Delivery stats after sent

### H) Send to Segment Edge Function

**File to Create:** `supabase/functions/send-segment-push/index.ts`

**Logic:**
1. Accept `campaign_id` or `{ segment_id, title, body, url }`
2. Load segment rules
3. Resolve matching users via SQL query
4. For each user:
   - Check rate limit (max 5 pushes/day)
   - Check if has active subscription
   - Check if unsubscribed
   - Call `send-push-notification` or inline VAPID send
5. Log to `push_delivery_log`
6. Update campaign stats
7. Return results

```typescript
// User resolution query based on rules
async function resolveSegmentUsers(rules: SegmentRules): Promise<string[]> {
  let query = supabase.from("profiles").select("user_id");
  
  if (rules.roles?.includes("driver")) {
    // Join with drivers table
    const { data: drivers } = await supabase
      .from("drivers")
      .select("user_id")
      .eq("is_online", rules.driver_is_online ?? true);
    return drivers?.map(d => d.user_id) || [];
  }
  
  if (rules.last_order_days_ago) {
    // Find inactive customers (similar to marketing.ts logic)
    // ...
  }
  
  // More rule processing...
  
  return userIds;
}
```

### I) Push Campaign Scheduler

**File to Create:** `supabase/functions/push-campaign-scheduler/index.ts`

**Runs:** Every 5 minutes (configured via pg_cron or external scheduler)

**Logic:**
1. Find campaigns where `status = 'scheduled'` AND `send_at <= now()`
2. For each:
   - Set status = 'sending'
   - Call `send-segment-push`
   - Set status = 'sent' or 'failed'

### J) Routes Configuration

**File to Modify:** `src/App.tsx`

```typescript
// Lazy imports
const PushDashboard = lazy(() => import("./pages/admin/push/PushDashboard"));
const PushSegmentsPage = lazy(() => import("./pages/admin/push/SegmentsPage"));
const PushCampaignsPage = lazy(() => import("./pages/admin/push/CampaignsPage"));
const PushCampaignDetailPage = lazy(() => import("./pages/admin/push/CampaignDetailPage"));

// Routes
<Route path="/admin/push" element={<ProtectedRoute requireAdmin><PushDashboard /></ProtectedRoute>} />
<Route path="/admin/push/segments" element={<ProtectedRoute requireAdmin><PushSegmentsPage /></ProtectedRoute>} />
<Route path="/admin/push/campaigns" element={<ProtectedRoute requireAdmin><PushCampaignsPage /></ProtectedRoute>} />
<Route path="/admin/push/campaigns/:id" element={<ProtectedRoute requireAdmin><PushCampaignDetailPage /></ProtectedRoute>} />
```

---

## File Summary

### Database Migration
| Change | Purpose |
|--------|---------|
| Create `push_segments` table | Store reusable audience segments |
| Create `push_campaigns` table | Push campaign management |
| Create `push_delivery_log` table | Per-user delivery tracking |
| Create `push_user_daily_limits` table | Rate limiting |
| RLS policies | Admin-only access |

### New Files (12)
| File | Purpose |
|------|---------|
| `src/lib/pushBroadcast.ts` | Data layer for segments & campaigns |
| `src/hooks/usePushBroadcast.ts` | React Query hooks |
| `src/pages/admin/push/PushDashboard.tsx` | Main push admin hub |
| `src/pages/admin/push/SegmentsPage.tsx` | Segment management |
| `src/pages/admin/push/CampaignsPage.tsx` | Campaign listing |
| `src/pages/admin/push/CampaignDetailPage.tsx` | Campaign create/edit/view |
| `src/components/admin/push/SegmentRuleBuilder.tsx` | Visual rule builder |
| `src/components/admin/push/NotificationPreview.tsx` | Live preview |
| `src/components/admin/push/CampaignStats.tsx` | Delivery stats display |
| `supabase/functions/send-segment-push/index.ts` | Send to segment |
| `supabase/functions/push-campaign-scheduler/index.ts` | Scheduled sender |
| Migration SQL file | Schema changes |

### Modified Files (1)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add push admin routes |

---

## Data Flow

```text
Admin Creates Segment
  └── Define rules (roles, activity, location)
  └── Save to push_segments
        ↓
Admin Creates Campaign
  └── Select segment or "All Users"
  └── Write title, body, URL
  └── Choose: Send Now OR Schedule
        ↓
[Send Now]                    [Schedule]
    ↓                              ↓
send-segment-push         Save with status='scheduled'
    ↓                              ↓
Resolve users from rules    push-campaign-scheduler (cron)
    ↓                              ↓
For each user:              When send_at <= now()
├── Check rate limit           ↓
├── Check subscription      send-segment-push
├── Send via VAPID              ↓
└── Log to push_delivery_log    (same flow)
        ↓
Update campaign stats
        ↓
Admin sees results in dashboard
```

---

## Safety Controls

### 1. Rate Limiting (5 pushes/user/day)
```sql
-- Before sending, check:
SELECT push_count FROM push_user_daily_limits
WHERE user_id = $1 AND date = CURRENT_DATE;

-- If >= 5, skip with reason 'rate_limited'
```

### 2. Unsubscribe Checking
```sql
-- Only send to users with active subscriptions
SELECT * FROM push_subscriptions
WHERE user_id = $1 AND is_active = true;
```

### 3. Admin-Only Access
All push admin pages wrapped in `AdminProtectedRoute`:
```typescript
<Route path="/admin/push/*" element={
  <AdminProtectedRoute allowedRoles={["admin", "super_admin", "operations"]}>
    ...
  </AdminProtectedRoute>
} />
```

### 4. Test Send First
Campaign creation includes "Send Test to Me" button that sends only to the current admin's user_id.

### 5. Confirmation Dialogs
All "Send Now" actions require confirmation modal showing:
- Estimated recipients count
- Campaign title/body preview
- "Are you sure?" with Cancel/Confirm buttons

---

## Segment Resolution SQL Examples

**All Online Drivers:**
```sql
SELECT user_id FROM drivers 
WHERE is_online = true AND status = 'active';
```

**Inactive Customers (14+ days):**
```sql
SELECT DISTINCT p.user_id FROM profiles p
LEFT JOIN food_orders fo ON fo.customer_id = p.user_id 
  AND fo.created_at > NOW() - INTERVAL '14 days'
  AND fo.status = 'completed'
WHERE fo.id IS NULL
  AND EXISTS (SELECT 1 FROM food_orders WHERE customer_id = p.user_id);
```

**Customers in Baton Rouge:**
```sql
SELECT DISTINCT p.user_id FROM profiles p
JOIN saved_locations sl ON sl.user_id = p.user_id
WHERE sl.city ILIKE '%Baton Rouge%';
```

---

## UI Component Details

### NotificationPreview
Shows how the push will appear on device:
```text
+---------------------------+
| 📱 iOS / Android Preview  |
+---------------------------+
| [ZIVO icon]               |
| Weekend Flash Sale! 🔥    |
| 50% off all rides this... |
| now                       |
+---------------------------+
```

### CampaignStats
After campaign is sent:
```text
+------------------------------------------+
| Delivery Results                         |
+------------------------------------------+
| Targeted: 2,500 | Sent: 2,345 | Rate: 94%|
| Failed: 55      | Skipped: 100           |
|                                          |
| Skip Reasons:                            |
| - No subscription: 80                    |
| - Rate limited: 15                       |
| - Unsubscribed: 5                        |
+------------------------------------------+
```

---

## Summary

This implementation creates a complete push notification broadcast system with:

1. **Reusable Segments** - Define once, use across campaigns
2. **Visual Rule Builder** - No JSON editing required for common rules
3. **Campaign Management** - Draft, schedule, or send immediately
4. **Delivery Tracking** - Per-user logs with failure reasons
5. **Safety Controls** - Rate limits, unsubscribe checks, admin-only
6. **Test Mode** - Send to yourself before broadcasting
7. **Scheduling** - Set future send times with automatic execution
8. **Real-time Stats** - See delivery rates and skip reasons

All integrated with existing `send-push-notification` edge function and `push_subscriptions` table.
