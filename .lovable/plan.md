
# Damage & Dispute Handling Workflow - Implementation Plan

## Overview
Implement a comprehensive damage and dispute handling system for the ZIVO P2P Car Rental Marketplace. This system will enable renters and owners to report damage, allow admins to review and resolve disputes, integrate with insurance claims, and safely control payouts during dispute resolution.

---

## Current System Analysis

### Existing Components (Already Implemented)
| Component | File | Status |
|-----------|------|--------|
| Basic Dispute Filing | `DisputeForm.tsx` | Exists but limited |
| Dispute Types | DB enum | damage, late_return, cancellation, refund, cleanliness, other |
| Dispute Status | DB enum | open, investigating, resolved, closed |
| Admin Disputes Module | `AdminP2PDisputesModule.tsx` | Basic review only |
| Payout Dispute Check | `execute-p2p-payout/index.ts` | Blocks on active disputes |

### Gaps to Fill
1. **No dedicated damage report form with photo uploads**
2. **No before/after photo comparison for owners**
3. **No insurance claim tracking fields**
4. **No explicit payout hold/release workflow tied to disputes**
5. **No damage report status states (reported, under review, claim submitted, etc.)**
6. **No renter-facing or owner-facing damage report pages**
7. **No repair cost tracking or resolution amount recording**

---

## Database Schema Changes

### 1. New Table: `p2p_damage_reports`
Dedicated damage report tracking separate from general disputes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `booking_id` | uuid | FK to p2p_bookings |
| `reported_by` | uuid | FK to auth.users |
| `reporter_role` | text | 'renter' or 'owner' |
| `description` | text | Damage description |
| `date_noticed` | timestamp | When damage was noticed |
| `estimated_repair_cost` | numeric | Owner's estimated cost |
| `status` | enum | See below |
| `priority` | text | low, medium, high, urgent |
| `admin_notes` | text | Internal notes |
| `created_at` | timestamp | Record created |
| `updated_at` | timestamp | Last updated |

### 2. New Enum: `p2p_damage_status`
```sql
CREATE TYPE p2p_damage_status AS ENUM (
  'reported',
  'under_review', 
  'info_requested',
  'insurance_claim_submitted',
  'resolved_owner_paid',
  'resolved_renter_charged',
  'closed_no_action'
);
```

### 3. New Table: `p2p_damage_evidence`
Photo evidence for damage reports.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `damage_report_id` | uuid | FK to p2p_damage_reports |
| `image_url` | text | Storage URL |
| `image_type` | text | 'damage', 'before', 'after' |
| `uploaded_by` | uuid | FK to auth.users |
| `caption` | text | Description of photo |
| `created_at` | timestamp | Record created |

### 4. New Table: `p2p_insurance_claims`
Insurance claim tracking (Phase 1 - Manual).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `damage_report_id` | uuid | FK to p2p_damage_reports |
| `insurance_provider` | text | Provider name |
| `claim_reference` | text | Claim reference number |
| `coverage_decision` | text | approved, denied, partial |
| `coverage_amount` | numeric | Amount covered |
| `notes` | text | Decision notes |
| `submitted_at` | timestamp | When claim submitted |
| `resolved_at` | timestamp | When claim resolved |
| `created_by` | uuid | Admin who created |

### 5. New Table: `p2p_dispute_resolutions`
Resolution tracking with payout adjustments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `damage_report_id` | uuid | FK to p2p_damage_reports |
| `decision` | text | owner_paid, renter_charged, no_action, partial |
| `owner_payout_adjustment` | numeric | Amount to add/subtract from payout |
| `renter_charge_amount` | numeric | Amount to charge renter |
| `admin_notes` | text | Resolution notes |
| `resolved_at` | timestamp | When resolved |
| `resolved_by` | uuid | Admin who resolved |

### 6. Modify `p2p_bookings` Table
Add field to link damage reports and track payout hold status.

```sql
ALTER TABLE p2p_bookings 
  ADD COLUMN damage_report_id UUID REFERENCES p2p_damage_reports(id),
  ADD COLUMN payout_hold_reason TEXT,
  ADD COLUMN payout_held_at TIMESTAMPTZ;
```

---

## New Dispute/Damage Status Flow

```text
Damage Reported
      │
      ▼
Under Review (Admin investigating)
      │
      ├─── Info Requested (Need more photos/details)
      │         │
      │         ▼
      │    (User provides info)
      │         │
      └─────────┘
      │
      ▼
┌─────────────────────────────────────┐
│      Admin Decision Point           │
├─────────────────────────────────────┤
│ A) Submit Insurance Claim           │
│ B) Approve Owner Compensation       │
│ C) Charge Renter                    │
│ D) Deny Claim / No Action           │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│     Resolution States               │
├─────────────────────────────────────┤
│ • Insurance Claim Submitted         │
│ • Resolved – Owner Paid             │
│ • Resolved – Renter Charged         │
│ • Closed – No Action                │
└─────────────────────────────────────┘
```

---

## File Structure

### New Files to Create

```text
src/pages/damage/
├── ReportDamage.tsx              - Unified damage report page (renter/owner)
├── DamageReportStatus.tsx        - View damage report status

src/components/damage/
├── DamageReportForm.tsx          - Multi-step damage report form
├── DamageEvidenceUpload.tsx      - Photo upload for damage evidence
├── DamageStatusBadge.tsx         - Status badge component
├── DamageTimeline.tsx            - Timeline of events

src/hooks/
├── useDamageReport.ts            - Hooks for damage reports

src/types/
├── damage.ts                     - TypeScript types for damage system

src/pages/admin/modules/
├── AdminDamageReportsModule.tsx  - Enhanced admin panel for damage
```

### Files to Modify

```text
src/pages/p2p/RenterTrips.tsx          - Add "Report Damage" button
src/pages/owner/OwnerBookings.tsx      - Add "Report Damage" button
src/components/p2p/DisputeForm.tsx     - Link to damage report for damage type
src/hooks/useP2PDispute.ts             - Add damage-specific queries
src/pages/admin/AdminPanel.tsx         - Add "Damage Reports" nav item
supabase/functions/execute-p2p-payout/ - Enhanced dispute/damage checks
```

---

## Implementation Details

### 1. Renter Damage Report Flow

**Route**: `/booking/:id/report-damage`

**Steps**:
1. Damage description (required, textarea)
2. Date/time noticed (date picker)
3. Photo uploads (min 1 required, max 10)
4. Optional notes
5. Submit and confirm

**On Submit**:
- Create `p2p_damage_reports` record with `status = 'reported'`
- Create `p2p_damage_evidence` records for photos
- Update `p2p_bookings.damage_report_id`
- Set `p2p_bookings.payout_hold_reason = 'damage_report_pending'`
- Set `p2p_bookings.payout_held_at = now()`
- Notify owner and admin (future: email)

### 2. Owner Damage Report Flow

**Route**: `/owner/booking/:id/report-damage`

**Steps**:
1. Damage description (required)
2. Before photos (from vehicle listing)
3. After photos (damage evidence, required)
4. Estimated repair cost (optional, currency input)
5. Submit

**On Submit**:
- Same as renter flow with `reporter_role = 'owner'`
- Owner-reported damages typically have higher priority

### 3. Damage Report Status Page

**Route**: `/damage/:id/status`

**Shows**:
- Current status with badge
- Timeline of events
- Photos gallery
- Resolution details (if resolved)
- Next steps guidance

### 4. Admin Damage Reports Module

**Route**: In Admin Panel → "Damage Reports" tab

**Features**:

**Dashboard Cards**:
- Total Reports
- Under Review
- Pending Insurance
- Resolved This Month

**Table Columns**:
| Column | Data |
|--------|------|
| ID | Short ID |
| Booking | Vehicle + Dates |
| Reporter | Name + Role badge |
| Description | Truncated |
| Status | Status badge |
| Cost | Estimated repair cost |
| Created | Date |
| Actions | View button |

**Detail Modal/Page**:

1. **Report Overview**
   - Full description
   - Date noticed
   - Reporter info
   - Estimated repair cost

2. **Booking Details**
   - Vehicle info
   - Renter profile
   - Owner profile
   - Trip dates

3. **Evidence Gallery**
   - Before photos (from listing)
   - Damage photos
   - After photos
   - Zoom/expand view

4. **Timeline**
   - Report submitted
   - Status changes
   - Comments/notes

5. **Insurance Claim Section** (if applicable)
   - Provider name field
   - Claim reference field
   - Coverage decision notes
   - Coverage amount

6. **Resolution Section**
   - Decision dropdown (owner_paid, renter_charged, no_action)
   - Payout adjustment amount
   - Renter charge amount
   - Resolution notes

**Admin Actions**:
- Mark as "Under Review"
- Request More Information
- Submit Insurance Claim
- Approve Owner Compensation
- Charge Renter
- Deny Claim
- Release/Adjust Payout
- Close Report

### 5. useDamageReport.ts Hooks

```typescript
// Create damage report
useCreateDamageReport()

// Upload damage evidence
useUploadDamageEvidence()

// Get damage report by ID
useDamageReport(reportId: string)

// Get damage reports for a booking
useBookingDamageReports(bookingId: string)

// Get user's damage reports
useUserDamageReports()

// Admin: Get all damage reports with filters
useAdminDamageReports(status?: DamageStatus)

// Admin: Update damage report status
useUpdateDamageStatus()

// Admin: Create insurance claim
useCreateInsuranceClaim()

// Admin: Resolve damage report
useResolveDamageReport()

// Admin: Stats
useDamageReportStats()
```

### 6. Payout Logic Enhancement

Modify `execute-p2p-payout/index.ts`:

```typescript
// Enhanced check for damage reports
if (!force) {
  // Check for active disputes
  const { data: disputes } = await supabase
    .from("p2p_disputes")
    .select("id, status")
    .in("booking_id", bookingIds)
    .in("status", ["open", "investigating"]);

  if (disputes && disputes.length > 0) {
    throw new Error(`Cannot process: ${disputes.length} active dispute(s)`);
  }

  // Check for pending damage reports
  const { data: damageReports } = await supabase
    .from("p2p_damage_reports")
    .select("id, status")
    .in("booking_id", bookingIds)
    .not("status", "in", "(resolved_owner_paid,resolved_renter_charged,closed_no_action)");

  if (damageReports && damageReports.length > 0) {
    throw new Error(`Cannot process: ${damageReports.length} pending damage report(s)`);
  }
}

// Apply payout adjustments from resolved damage reports
const { data: resolutions } = await supabase
  .from("p2p_dispute_resolutions")
  .select("owner_payout_adjustment")
  .in("damage_report_id", damageReportIds)
  .eq("decision", "owner_paid");

// Calculate adjusted amount
let adjustedAmount = payout.amount;
for (const resolution of resolutions || []) {
  adjustedAmount += resolution.owner_payout_adjustment || 0;
}
```

### 7. RenterTrips.tsx Integration

Add "Report Damage" button for completed trips:

```typescript
// In booking card for completed trips
{booking.status === "completed" && !booking.damage_report_id && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => navigate(`/booking/${booking.id}/report-damage`)}
  >
    <AlertTriangle className="w-4 h-4 mr-2" />
    Report Damage
  </Button>
)}

{booking.damage_report_id && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => navigate(`/damage/${booking.damage_report_id}/status`)}
  >
    <Eye className="w-4 h-4 mr-2" />
    View Damage Report
  </Button>
)}
```

### 8. OwnerBookings.tsx Integration

Similar pattern for owner's completed bookings:

```typescript
// In completed booking card
<Button
  variant="outline"
  size="sm"
  className="text-amber-600"
  onClick={() => navigate(`/owner/booking/${booking.id}/report-damage`)}
>
  <Camera className="w-4 h-4 mr-2" />
  Report Damage
</Button>
```

---

## Checkout Integration

Add damage policy acknowledgment:

```typescript
// In P2PBookingConfirmation.tsx or checkout flow
<div className="p-4 rounded-lg border bg-muted/50">
  <p className="text-sm text-muted-foreground">
    By booking, you agree to the{" "}
    <Link to="/damage-policy" className="text-primary underline">
      Damage & Incident Policy
    </Link>
    . You may be charged for any damage that occurs during your rental period.
  </p>
</div>
```

---

## RLS Policies

### p2p_damage_reports

```sql
-- Users can view reports they filed or are named in
CREATE POLICY "Users can view own damage reports"
  ON p2p_damage_reports FOR SELECT
  USING (
    auth.uid() = reported_by
    OR EXISTS (
      SELECT 1 FROM p2p_bookings b
      WHERE b.id = p2p_damage_reports.booking_id
      AND (b.renter_id = auth.uid() OR b.owner_id IN (
        SELECT id FROM car_owner_profiles WHERE user_id = auth.uid()
      ))
    )
  );

-- Users can create reports for their bookings
CREATE POLICY "Users can create damage reports"
  ON p2p_damage_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reported_by
    AND EXISTS (
      SELECT 1 FROM p2p_bookings b
      WHERE b.id = booking_id
      AND (b.renter_id = auth.uid() OR b.owner_id IN (
        SELECT id FROM car_owner_profiles WHERE user_id = auth.uid()
      ))
    )
  );

-- Admin full access
CREATE POLICY "Admin full access to damage reports"
  ON p2p_damage_reports FOR ALL
  USING (public.is_admin(auth.uid()));
```

### p2p_damage_evidence

```sql
-- Users can view evidence for reports they have access to
CREATE POLICY "Users can view damage evidence"
  ON p2p_damage_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM p2p_damage_reports dr
      WHERE dr.id = p2p_damage_evidence.damage_report_id
      AND (
        dr.reported_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM p2p_bookings b
          WHERE b.id = dr.booking_id
          AND (b.renter_id = auth.uid() OR b.owner_id IN (
            SELECT id FROM car_owner_profiles WHERE user_id = auth.uid()
          ))
        )
      )
    )
  );

-- Users can upload evidence to their own reports
CREATE POLICY "Users can upload damage evidence"
  ON p2p_damage_evidence FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM p2p_damage_reports dr
      WHERE dr.id = damage_report_id
      AND dr.reported_by = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "Admin full access to damage evidence"
  ON p2p_damage_evidence FOR ALL
  USING (public.is_admin(auth.uid()));
```

### p2p_insurance_claims & p2p_dispute_resolutions

```sql
-- Admin only for insurance claims
CREATE POLICY "Admin only insurance claims"
  ON p2p_insurance_claims FOR ALL
  USING (public.is_admin(auth.uid()));

-- Admin only for resolutions
CREATE POLICY "Admin only dispute resolutions"
  ON p2p_dispute_resolutions FOR ALL
  USING (public.is_admin(auth.uid()));
```

---

## Storage

Use existing `p2p-documents` bucket:
- Path: `damage/{damage_report_id}/{type}_{timestamp}.{ext}`
- Types: `damage`, `before`, `after`
- Access: Private, admin can view all, users can view own

---

## Routes to Add (App.tsx)

```typescript
// Damage report pages
const ReportDamage = lazy(() => import("./pages/damage/ReportDamage"));
const DamageReportStatus = lazy(() => import("./pages/damage/DamageReportStatus"));

// Routes:
<Route path="/booking/:bookingId/report-damage" element={<ProtectedRoute><ReportDamage role="renter" /></ProtectedRoute>} />
<Route path="/owner/booking/:bookingId/report-damage" element={<ProtectedRoute><ReportDamage role="owner" /></ProtectedRoute>} />
<Route path="/damage/:reportId/status" element={<ProtectedRoute><DamageReportStatus /></ProtectedRoute>} />
```

---

## AdminPanel.tsx Updates

Add new nav item:

```typescript
{ id: "damage-reports", label: "Damage Reports", icon: AlertTriangle }
```

Add to switch statement:

```typescript
case "damage-reports":
  return <AdminDamageReportsModule />;
```

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/types/damage.ts` | TypeScript types for damage system |
| Create | `src/hooks/useDamageReport.ts` | Data hooks for damage reports |
| Create | `src/components/damage/DamageReportForm.tsx` | Multi-step damage form |
| Create | `src/components/damage/DamageEvidenceUpload.tsx` | Photo upload component |
| Create | `src/components/damage/DamageStatusBadge.tsx` | Status badge component |
| Create | `src/components/damage/DamageTimeline.tsx` | Event timeline component |
| Create | `src/pages/damage/ReportDamage.tsx` | Damage report page |
| Create | `src/pages/damage/DamageReportStatus.tsx` | Status view page |
| Create | `src/pages/admin/modules/AdminDamageReportsModule.tsx` | Admin damage panel |
| Modify | `src/App.tsx` | Add damage routes |
| Modify | `src/pages/admin/AdminPanel.tsx` | Add Damage Reports nav item |
| Modify | `src/pages/p2p/RenterTrips.tsx` | Add Report Damage button |
| Modify | `src/pages/owner/OwnerBookings.tsx` | Add Report Damage button |
| Modify | `supabase/functions/execute-p2p-payout/` | Enhanced damage checks |
| Database | Migration | Create tables, enums, RLS policies |

---

## Database Migration Summary

```sql
-- Create damage status enum
CREATE TYPE p2p_damage_status AS ENUM (
  'reported',
  'under_review',
  'info_requested',
  'insurance_claim_submitted',
  'resolved_owner_paid',
  'resolved_renter_charged',
  'closed_no_action'
);

-- Create damage reports table
CREATE TABLE p2p_damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES p2p_bookings(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id),
  reporter_role TEXT NOT NULL CHECK (reporter_role IN ('renter', 'owner')),
  description TEXT NOT NULL,
  date_noticed TIMESTAMPTZ NOT NULL,
  estimated_repair_cost NUMERIC(10,2),
  status p2p_damage_status DEFAULT 'reported',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create damage evidence table
CREATE TABLE p2p_damage_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_report_id UUID NOT NULL REFERENCES p2p_damage_reports(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('damage', 'before', 'after')),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create insurance claims table
CREATE TABLE p2p_insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_report_id UUID NOT NULL REFERENCES p2p_damage_reports(id) ON DELETE CASCADE,
  insurance_provider TEXT NOT NULL,
  claim_reference TEXT,
  coverage_decision TEXT CHECK (coverage_decision IN ('pending', 'approved', 'denied', 'partial')),
  coverage_amount NUMERIC(10,2),
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Create dispute resolutions table
CREATE TABLE p2p_dispute_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_report_id UUID NOT NULL REFERENCES p2p_damage_reports(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('owner_paid', 'renter_charged', 'no_action', 'partial')),
  owner_payout_adjustment NUMERIC(10,2) DEFAULT 0,
  renter_charge_amount NUMERIC(10,2) DEFAULT 0,
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ DEFAULT now(),
  resolved_by UUID REFERENCES auth.users(id)
);

-- Add damage tracking to bookings
ALTER TABLE p2p_bookings 
  ADD COLUMN damage_report_id UUID REFERENCES p2p_damage_reports(id),
  ADD COLUMN payout_hold_reason TEXT,
  ADD COLUMN payout_held_at TIMESTAMPTZ;

-- Create indexes
CREATE INDEX idx_damage_reports_booking_id ON p2p_damage_reports(booking_id);
CREATE INDEX idx_damage_reports_status ON p2p_damage_reports(status);
CREATE INDEX idx_damage_evidence_report_id ON p2p_damage_evidence(damage_report_id);

-- Enable RLS
ALTER TABLE p2p_damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE p2p_damage_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE p2p_insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE p2p_dispute_resolutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (as detailed above)
```

---

## Security Considerations

1. **Photo Storage**: Damage photos stored in private bucket
2. **RLS**: Users can only view/create reports for their own bookings
3. **Admin-Only Resolution**: Only admins can update status and resolve reports
4. **Payout Protection**: Payouts automatically blocked when damage reports exist
5. **Audit Trail**: All status changes tracked with timestamps

---

## Notifications (Future Enhancement)

When implementing email notifications, trigger on:
- Damage reported → Notify other party + admin
- Status changed → Notify reporter
- Info requested → Notify reporter
- Resolved → Notify both parties
