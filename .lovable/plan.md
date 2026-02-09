
# Customer Reliability Messaging — Implementation Plan

## Overview
Add a customer-facing reliability banner that displays when any system service is experiencing an incident. The banner shows the message: **"Some services may be temporarily slower than usual."** This keeps customers informed without alarming them during minor degradations.

## Current State Analysis

### Existing Infrastructure
| Component | Status | Location |
|-----------|--------|----------|
| `service_health_status` table | Exists | Supabase DB with status, is_paused fields |
| `useServiceHealthStatus()` hook | Exists (admin-only) | `src/hooks/useDisasterRecovery.ts` |
| `AnnouncementBanner` component | Exists | `src/components/shared/AnnouncementBanner.tsx` |
| Layout components | Exists | `AppLayout`, `HizovoAppLayout`, `ZivoSuperAppLayout` |

### Database Schema (service_health_status)
| Column | Type | Description |
|--------|------|-------------|
| `service_name` | text | flights, hotels, cars, rides, eats, auth, payments, storage |
| `status` | text | operational, degraded, outage, maintenance |
| `is_paused` | boolean | Manual service pause |
| `paused_reason` | text | Reason for pause |

### RLS Policy
```sql
CREATE POLICY "Anyone can read service health" 
  ON public.service_health_status 
  FOR SELECT TO authenticated 
  USING (true);
```
Customers can already read service health data.

---

## Implementation Plan

### 1) Create Customer System Status Hook

**File to Create:** `src/hooks/useSystemStatus.ts`

**Purpose:** Lightweight hook for customers to check if any system incident is active.

**Implementation:**
```text
Query service_health_status table
Check for any service where:
  - status = 'degraded' OR status = 'outage' OR status = 'maintenance'
  - OR is_paused = true

Return:
  - hasActiveIncident: boolean
  - incidentMessage: string (standardized message)
  - isLoading: boolean
```

**Caching Strategy:**
- `staleTime: 60000` (1 minute)
- `refetchInterval: 60000` (poll every minute)
- Lightweight query with minimal fields

---

### 2) Create Customer Reliability Banner Component

**File to Create:** `src/components/shared/SystemStatusBanner.tsx`

**Purpose:** Non-intrusive banner informing customers of service issues.

**Design:**
```text
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Some services may be temporarily slower than usual.    [×]  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Amber/warning color scheme (not alarming)
- Dismissible with X button
- Uses localStorage to remember dismissal (per session)
- Only shows when `hasActiveIncident = true`
- Non-sticky (doesn't follow scroll)

**Styling:**
```text
Background: bg-amber-50 dark:bg-amber-950/30
Border: border-amber-200 dark:border-amber-800
Icon: AlertTriangle (Lucide)
Text: "Some services may be temporarily slower than usual."
```

---

### 3) Integrate Banner into Layout Components

**Files to Modify:**
- `src/components/app/AppLayout.tsx`
- `src/components/app/HizovoAppLayout.tsx`
- `src/components/app/ZivoSuperAppLayout.tsx`

**Placement:** Below header, above main content.

**Integration Pattern:**
```text
<div className="min-h-screen bg-background flex flex-col">
  {!hideHeader && <Header ... />}
  
  {/* NEW: System Status Banner (customer-facing) */}
  <SystemStatusBanner />
  
  <main className={...}>
    {children}
  </main>
  
  {!hideNav && <BottomNav />}
</div>
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useSystemStatus.ts` | Check for active incidents |
| `src/components/shared/SystemStatusBanner.tsx` | Customer reliability banner |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/components/app/AppLayout.tsx` | Add SystemStatusBanner |
| `src/components/app/HizovoAppLayout.tsx` | Add SystemStatusBanner |
| `src/components/app/ZivoSuperAppLayout.tsx` | Add SystemStatusBanner |

---

## Hook Implementation Details

### useSystemStatus Hook
```text
export function useSystemStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["system-status-customer"],
    queryFn: async () => {
      const { data: services } = await supabase
        .from("service_health_status")
        .select("status, is_paused")
        .or("status.neq.operational,is_paused.eq.true");
      
      return {
        hasActiveIncident: services && services.length > 0,
      };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });

  return {
    hasActiveIncident: data?.hasActiveIncident ?? false,
    incidentMessage: "Some services may be temporarily slower than usual.",
    isLoading,
  };
}
```

---

## Banner Dismissal Logic

| Scenario | Behavior |
|----------|----------|
| User dismisses banner | Store dismissal timestamp in localStorage |
| Same session, incident still active | Banner stays hidden |
| New session (page refresh) | Banner reappears if incident still active |
| Incident resolves | Banner auto-hides (query returns false) |

**Storage Key:** `zivo-system-status-dismissed`

---

## Visual Design

### Banner States

**Active Incident:**
```text
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Some services may be temporarily slower than usual.    [×]  │
└─────────────────────────────────────────────────────────────────┘
```

**No Incident:**
```text
(Banner not rendered)
```

### Color Scheme
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `bg-amber-50` | `bg-amber-950/30` |
| Border | `border-amber-200` | `border-amber-800` |
| Icon | `text-amber-600` | `text-amber-400` |
| Text | `text-amber-700` | `text-amber-300` |

---

## Incident Triggers

The banner will appear when ANY of the following are true in `service_health_status`:

| Condition | Example |
|-----------|---------|
| `status = 'degraded'` | Flights API slow |
| `status = 'outage'` | Payments down |
| `status = 'maintenance'` | Hotels scheduled maintenance |
| `is_paused = true` | Rides manually paused |

---

## Performance Considerations

1. **Minimal Query:** Only fetches `status` and `is_paused` columns
2. **Polling Interval:** 60 seconds (not aggressive)
3. **Stale Time:** 60 seconds (reduces redundant fetches)
4. **Conditional Render:** Banner component returns `null` when no incident

---

## Admin Control

Admins control incident status via:
- **Recovery Dashboard** → Service Health tab
- **Disaster Recovery Dashboard** → Pause/unpause services
- **Direct DB updates** to `service_health_status` table

No new admin UI needed — existing tools control the data.

---

## Summary

This implementation provides:

1. **Customer Hook** — `useSystemStatus()` for lightweight incident detection
2. **Reliability Banner** — Amber warning banner with dismissal capability
3. **Layout Integration** — Banner appears in all customer-facing layouts
4. **Non-Alarming UX** — Soft messaging that informs without scaring
5. **Session Dismissal** — Users can dismiss; reappears on new session
6. **Real-time Data** — Reads from existing `service_health_status` table
7. **Admin-Controlled** — Incidents triggered by existing admin tools

The feature ensures customers are informed when services are impacted while maintaining a calm, professional user experience.
