
# Incident Response, Rollback Controls & Customer Protection for ZIVO Flights

## Summary

This plan implements OTA-grade incident management for ZIVO Flights, enabling rapid response to live incidents (Duffel outages, airline issues, payment failures) while protecting customers and maintaining trust. Key additions include structured incident reasons, auto-rollback on failure spikes, customer communication, and an incident log system.

---

## Current State Analysis

| Requirement | Status | Details |
|-------------|--------|---------|
| **Emergency pause control** | ✅ Exists | `flights_launch_settings.emergency_pause` field with admin UI |
| **Pause reason** | ⚠️ Basic | Free-text field only - no structured categories |
| **Price verification** | ✅ Exists | `create-flight-checkout` verifies offer validity/price in LIVE mode |
| **Customer incident email** | ❌ Missing | No automated "Under Review" notification |
| **Incident logs table** | ❌ Missing | Only `flight_admin_alerts` exists |
| **Auto-pause on failures** | ❌ Missing | No automatic rollback trigger |
| **Post-incident resolution flow** | ❌ Missing | No structured resolution process |
| **Affected bookings tracking** | ❌ Missing | Can't link incidents to bookings |

---

## Implementation Plan

### Phase 1: Structured Incident Reasons

**Goal:** Replace free-text pause reason with required category selection.

**File:** `src/types/flightsLaunch.ts` (MODIFY)

Add incident reason types:
```typescript
export type IncidentReasonCode = 
  | 'airline_outage'      // Airline system outage
  | 'pricing_issue'       // Pricing inconsistency
  | 'payment_issue'       // Payment provider issue
  | 'maintenance'         // Scheduled maintenance
  | 'duffel_outage'       // Duffel API down
  | 'other';              // Other

export const INCIDENT_REASONS: { code: IncidentReasonCode; label: string; description: string }[] = [
  { code: 'airline_outage', label: 'Airline System Outage', description: 'Airline GDS or booking system is down' },
  { code: 'pricing_issue', label: 'Pricing Inconsistency', description: 'Fare discrepancies or incorrect prices' },
  { code: 'payment_issue', label: 'Payment Provider Issue', description: 'Stripe or payment processing problem' },
  { code: 'duffel_outage', label: 'Duffel API Outage', description: 'Duffel ticketing API not responding' },
  { code: 'maintenance', label: 'Scheduled Maintenance', description: 'Planned system maintenance' },
  { code: 'other', label: 'Other', description: 'Other issue requiring pause' },
];
```

**Database:** Add `incident_reason_code` column to `flights_launch_settings`:
```sql
ALTER TABLE flights_launch_settings 
ADD COLUMN incident_reason_code TEXT,
ADD COLUMN incident_started_at TIMESTAMPTZ,
ADD COLUMN incident_notes TEXT;
```

**File:** `src/pages/admin/FlightsLaunchControl.tsx` (MODIFY)

Replace textarea with radio group for incident reason selection:
- Show radio buttons for each INCIDENT_REASONS option
- Make selection required before confirming pause
- Add optional notes field for additional context

---

### Phase 2: Create Incident Logs Table

**Goal:** Track all incidents with affected bookings and resolution timeline.

**Database:** Create `flight_incident_logs` table:
```sql
CREATE TABLE public.flight_incident_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL, -- 'pause' | 'auto_pause' | 'failure_spike' | 'api_outage'
  reason_code TEXT NOT NULL,
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Metrics at time of incident
  affected_bookings_count INTEGER DEFAULT 0,
  affected_booking_ids JSONB DEFAULT '[]',
  failure_count_trigger INTEGER, -- For auto-pause incidents
  
  -- Notifications sent
  customers_notified INTEGER DEFAULT 0,
  customers_resolved INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Admin only
ALTER TABLE flight_incident_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage incident logs"
ON flight_incident_logs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

**File:** `src/hooks/useIncidentLogs.ts` (NEW)

Create hooks for incident management:
- `useActiveIncident()` - Get current open incident
- `useIncidentHistory()` - Get past incidents
- `useCreateIncident()` - Create new incident log
- `useResolveIncident()` - Mark incident as resolved

---

### Phase 3: Auto-Pause on Failure Spike (Rollback Rule)

**Goal:** Automatically pause flights if too many failures occur in a short window.

**Configuration:**
- Threshold: 3+ booking failures within 15 minutes triggers auto-pause
- Creates automatic `flight_incident_logs` entry
- Sends critical alert to admin

**File:** `supabase/functions/check-flight-health/index.ts` (NEW)

Create health check function that runs on a schedule:
```typescript
// Called every 5 minutes via cron or after each booking failure
// Checks failure count in last 15 minutes
// If >= 3 failures, triggers auto-pause

const { data: recentFailures } = await supabase
  .from('flight_bookings')
  .select('id')
  .eq('ticketing_status', 'failed')
  .gte('created_at', fifteenMinutesAgo);

if (recentFailures.length >= FAILURE_THRESHOLD) {
  // Auto-pause flights
  await supabase.from('flights_launch_settings').update({
    emergency_pause: true,
    emergency_pause_reason: 'Auto-paused: Multiple booking failures detected',
    incident_reason_code: 'other',
    incident_started_at: new Date().toISOString(),
  });

  // Create incident log
  await supabase.from('flight_incident_logs').insert({
    incident_type: 'auto_pause',
    reason_code: 'failure_spike',
    description: `Auto-paused after ${recentFailures.length} failures in 15 minutes`,
    failure_count_trigger: recentFailures.length,
    affected_booking_ids: recentFailures.map(f => f.id),
    affected_bookings_count: recentFailures.length,
  });

  // Create critical alert
  await supabase.from('flight_admin_alerts').insert({
    alert_type: 'auto_pause_triggered',
    severity: 'critical',
    message: `⚠️ Flights auto-paused: ${recentFailures.length} failures in 15 minutes`,
  });
}
```

**File:** `supabase/functions/issue-flight-ticket/index.ts` (MODIFY)

After ticketing failure, call health check:
```typescript
// After creating failure alert, check for auto-pause threshold
await fetch(`${supabaseUrl}/functions/v1/check-flight-health`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${supabaseServiceKey}` },
});
```

---

### Phase 4: Customer Communication on Incident

**Goal:** Automatically notify affected customers when an incident occurs.

**File:** `supabase/functions/send-incident-notification/index.ts` (NEW)

Create function to email affected customers:
```typescript
// Called when incident is created with affected bookings
// Sends "Under Review" email to each affected customer

const emailContent = {
  subject: "Update on Your ZIVO Flight Booking",
  html: `
    <p>We're reviewing an issue with your booking reference: ${bookingRef}</p>
    <p>Our support team is on it and will update you shortly.</p>
    <p>You don't need to take any action at this time.</p>
    <p>Contact: support@hizivo.com</p>
  `
};
```

**File:** `src/pages/admin/FlightsLaunchControl.tsx` (MODIFY)

Add option in pause modal:
```tsx
<Checkbox id="notify-customers" checked={notifyCustomers} onChange={...} />
<Label>Notify affected customers about this incident</Label>
```

---

### Phase 5: Booking Status "Under Review"

**Goal:** Show "Under Review" status for bookings affected by incidents.

**File:** `src/pages/FlightConfirmation.tsx` (MODIFY)

Check if booking is linked to active incident:
```typescript
// If booking status is 'processing' or 'pending' AND incident is active
if (booking.ticketing_status === 'processing' && activeIncident) {
  return (
    <Badge variant="outline" className="bg-amber-500/10">
      Under Review
    </Badge>
  );
}
```

**File:** `src/pages/AccountFlightBookings.tsx` (MODIFY)

Same "Under Review" display in customer's booking list.

---

### Phase 6: Post-Incident Resolution Flow

**Goal:** Structured flow to resume bookings and notify customers.

**File:** `src/pages/admin/FlightsLaunchControl.tsx` (MODIFY)

Add resolution section when incident is active:
```tsx
{isPaused && activeIncident && (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Resolve Incident</CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea 
        placeholder="Resolution notes (e.g., root cause, fix applied)" 
        value={resolutionNotes}
      />
      <Checkbox>Notify affected customers of resolution</Checkbox>
      <Button onClick={handleResolveIncident}>
        Resolve & Resume Bookings
      </Button>
    </CardContent>
  </Card>
)}
```

**File:** `supabase/functions/resolve-flight-incident/index.ts` (NEW)

Handles incident resolution:
1. Mark incident as resolved in `flight_incident_logs`
2. Resume bookings (clear `emergency_pause`)
3. Send resolution emails to affected customers
4. Update booking statuses if needed

---

### Phase 7: Admin Incident Dashboard

**Goal:** Dedicated view for incident history and management.

**File:** `src/pages/admin/FlightIncidentLog.tsx` (NEW)

Create incident log page showing:
- Current incident status (if active)
- Incident history with timeline
- Affected bookings per incident
- Resolution metrics

Add route: `/admin/flights/incidents`

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/flightsLaunch.ts` | MODIFY | Add incident reason types |
| `src/hooks/useIncidentLogs.ts` | CREATE | Hooks for incident CRUD |
| `src/hooks/useFlightsLaunchStatus.ts` | MODIFY | Add incident reason handling |
| `src/pages/admin/FlightsLaunchControl.tsx` | MODIFY | Structured pause reasons, resolution flow |
| `src/pages/admin/FlightIncidentLog.tsx` | CREATE | Incident history dashboard |
| `src/pages/FlightConfirmation.tsx` | MODIFY | Show "Under Review" status |
| `supabase/functions/check-flight-health/index.ts` | CREATE | Auto-pause health check |
| `supabase/functions/send-incident-notification/index.ts` | CREATE | Customer incident emails |
| `supabase/functions/resolve-flight-incident/index.ts` | CREATE | Resolution flow |
| `supabase/functions/issue-flight-ticket/index.ts` | MODIFY | Trigger health check on failure |
| `src/App.tsx` | MODIFY | Add incident log route |

---

## Database Changes

### Modify `flights_launch_settings`:
```sql
ALTER TABLE flights_launch_settings 
ADD COLUMN incident_reason_code TEXT,
ADD COLUMN incident_started_at TIMESTAMPTZ,
ADD COLUMN incident_notes TEXT;
```

### Create `flight_incident_logs`:
```sql
CREATE TABLE public.flight_incident_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  affected_bookings_count INTEGER DEFAULT 0,
  affected_booking_ids JSONB DEFAULT '[]',
  failure_count_trigger INTEGER,
  customers_notified INTEGER DEFAULT 0,
  customers_resolved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Incident Reason Categories

| Code | Label | When to Use |
|------|-------|-------------|
| `airline_outage` | Airline System Outage | GDS or airline booking system is down |
| `pricing_issue` | Pricing Inconsistency | Fare discrepancies detected |
| `payment_issue` | Payment Provider Issue | Stripe failures |
| `duffel_outage` | Duffel API Outage | Duffel not responding |
| `maintenance` | Scheduled Maintenance | Planned downtime |
| `other` | Other | Any other issue |

---

## Auto-Pause Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Booking failures | 3+ in 15 minutes | Auto-pause + critical alert |
| Duffel error rate | >50% in 15 minutes | Degraded status + warning alert |
| Payment failures | 3+ in 15 minutes | Alert but no auto-pause |

---

## Customer-Facing Messages

| Scenario | Message |
|----------|---------|
| **Pause active (search page)** | "Flight bookings are temporarily unavailable. Please check back shortly." |
| **Checkout blocked** | "Flight bookings are temporarily paused. Please try again later." |
| **Booking "Under Review"** | Status badge + "Our team is reviewing your booking." |
| **Incident email** | "We're reviewing an issue with your booking. Our support team is on it." |
| **Resolution email** | "The issue with your booking has been resolved. Thank you for your patience." |

---

## Testing Checklist

1. **Structured Pause Flow**
   - [ ] Radio buttons shown for incident reasons
   - [ ] Reason required before confirming pause
   - [ ] Incident log created on pause

2. **Auto-Pause**
   - [ ] Simulate 3 ticketing failures
   - [ ] Verify auto-pause triggers
   - [ ] Verify critical alert created

3. **Customer Communication**
   - [ ] "Under Review" status shown on booking
   - [ ] Incident email sent to affected customers
   - [ ] Resolution email sent on resolve

4. **Resolution Flow**
   - [ ] Resolution notes saved
   - [ ] Customers notified option works
   - [ ] Bookings resume properly

5. **Incident Log**
   - [ ] History shows all past incidents
   - [ ] Affected booking count accurate
   - [ ] Timeline displays correctly
