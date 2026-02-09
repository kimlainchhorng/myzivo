

# KYC / Verification Workflow for Drivers and Merchants

## Overview
Implement a comprehensive KYC (Know Your Customer) verification workflow for Drivers and Merchants using the existing Supabase infrastructure. The system will require document submission, admin review with approval/rejection, and block payouts and "go online" functionality until approved. A complete audit trail will track all verification events.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `profiles.kyc_status` | Complete | Values: not_started, submitted, approved, rejected (string) |
| `profiles.kyc_verified_at` | Complete | Timestamp of verification |
| `profiles.kyc_rejection_reason` | Complete | Reason text for rejections |
| `profiles.payout_hold` | Complete | Boolean to block payouts |
| `drivers` table | Complete | Has `can_go_online`, `status`, `documents_verified` |
| `drivers.can_go_online` | Complete | Boolean to control online toggle |
| `restaurants.documents_verified` | Complete | Boolean field for merchant docs |
| `restaurants.status` | Complete | Enum: pending, active, suspended, closed |
| `restaurants.owner_id` | Complete | Links to user ID |
| `driver_documents` table | Complete | driver_id, document_type, file_path, status |
| `driver-documents` storage bucket | Complete | RLS policies for user/admin access |
| `useDriverDocuments` hook | Complete | CRUD for driver documents |
| `AdminDriverOnboardingQueue` | Complete | Existing driver review UI |
| `useMerchantRole` hook | Complete | Checks user_roles for merchant |
| `user_roles` table | Complete | Secure role storage (driver, merchant, admin) |
| Notification system | Complete | Push, SMS, Email via send-notification |

### Missing
| Feature | Status |
|---------|--------|
| `kyc_submissions` table | Need to create |
| `kyc_events` audit table | Need to create |
| `kyc-documents` storage bucket | Need to create |
| `/driver/kyc` page | Need to create |
| `/merchant/kyc` page | Need to create |
| `/admin/kyc` inbox page | Need to create |
| `/admin/kyc/[user_id]` review page | Need to create |
| `useKYCSubmission` hook | Need to create |
| `useKYCAdmin` hook | Need to create |
| KYC step validation in driver online toggle | Need to add |
| KYC notifications | Need to integrate |

---

## Database Schema

### New Table: `kyc_submissions`
Central KYC submission tracking for both drivers and merchants:

```sql
CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('driver', 'merchant')),
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_info')),
  
  -- Step tracking
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  
  -- Personal/Business info (JSON for flexibility)
  personal_info JSONB DEFAULT '{}',
  -- Driver: { legal_name, dob, ssn_last4, address }
  -- Merchant: { legal_business_name, ein, business_type, owner_name, owner_dob }
  
  -- Document URLs (stored as JSON array)
  documents JSONB DEFAULT '[]',
  -- [{ type: 'license_front', url: '...', status: 'pending' }, ...]
  
  -- Review tracking
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Request for more info
  info_requested_at TIMESTAMPTZ,
  info_request_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, role)
);

CREATE INDEX idx_kyc_submissions_status ON kyc_submissions(status);
CREATE INDEX idx_kyc_submissions_role ON kyc_submissions(role);
CREATE INDEX idx_kyc_submissions_user ON kyc_submissions(user_id);
```

### New Table: `kyc_events`
Audit trail for all KYC-related actions:

```sql
CREATE TABLE kyc_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES kyc_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  -- 'created', 'submitted', 'approved', 'rejected', 'info_requested', 
  -- 'info_provided', 'document_uploaded', 'document_removed', 'resubmitted'
  actor_id UUID REFERENCES auth.users(id),
  actor_role TEXT, -- 'user', 'admin', 'system'
  metadata JSONB DEFAULT '{}',
  -- { document_type: 'license', reason: '...', previous_status: '...', new_status: '...' }
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kyc_events_submission ON kyc_events(submission_id);
CREATE INDEX idx_kyc_events_user ON kyc_events(user_id);
CREATE INDEX idx_kyc_events_type ON kyc_events(event_type);
```

### Storage Bucket: `kyc-documents`
Private bucket for KYC documents with signed URL access:

```sql
-- Create bucket via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload to their own folder
CREATE POLICY "Users can upload own kyc docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can view their own docs
CREATE POLICY "Users can view own kyc docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Admins can view all docs
CREATE POLICY "Admins can view all kyc docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- RLS: Users can delete their own docs
CREATE POLICY "Users can delete own kyc docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### RLS Policies for KYC Tables

```sql
-- kyc_submissions
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submission"
ON kyc_submissions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own submission"
ON kyc_submissions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own draft/needs_info submission"
ON kyc_submissions FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND status IN ('draft', 'needs_info'));

CREATE POLICY "Admins can view all submissions"
ON kyc_submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any submission"
ON kyc_submissions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- kyc_events
ALTER TABLE kyc_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
ON kyc_events FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all events"
ON kyc_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert events"
ON kyc_events FOR INSERT TO authenticated
WITH CHECK (true);
```

---

## Implementation Plan

### A) KYC Data Layer

**File to Create:** `src/lib/kyc.ts`

```typescript
export type KYCRole = 'driver' | 'merchant';
export type KYCStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_info';

export interface KYCDocument {
  type: string; // 'license_front', 'license_back', 'insurance', 'selfie', 'business_license', 'owner_id'
  url: string;
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DriverPersonalInfo {
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  ssnLast4?: string;
}

export interface MerchantBusinessInfo {
  legalBusinessName: string;
  businessType: string; // 'sole_proprietor', 'llc', 'corporation'
  ein?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerDateOfBirth: string;
  businessAddressLine1: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
}

export interface KYCSubmission {
  id: string;
  userId: string;
  role: KYCRole;
  status: KYCStatus;
  currentStep: number;
  completedSteps: number[];
  personalInfo: DriverPersonalInfo | MerchantBusinessInfo;
  documents: KYCDocument[];
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  infoRequestedAt: string | null;
  infoRequestMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// Helper functions
export function getDocumentSignedUrl(filePath: string): Promise<string | null>
export function getKYCSteps(role: KYCRole): KYCStep[]
export function validateStep(role: KYCRole, step: number, data: any): ValidationResult
export function getStatusBadgeConfig(status: KYCStatus): StatusConfig
```

### B) KYC Hooks

**File to Create:** `src/hooks/useKYC.ts`

```typescript
// For driver/merchant users
export function useKYCSubmission(role: KYCRole)
export function useUpdateKYCSubmission()
export function useSubmitKYC()
export function useUploadKYCDocument()
export function useRemoveKYCDocument()

// For admin
export function useKYCQueue(filters?: { status?: KYCStatus; role?: KYCRole })
export function useKYCSubmissionDetail(submissionId: string)
export function useApproveKYC()
export function useRejectKYC()
export function useRequestMoreInfo()
export function useKYCEvents(submissionId: string)
```

### C) Driver KYC Page

**File to Create:** `src/pages/driver/DriverKYCPage.tsx`

**Route:** `/driver/kyc`

**Steps:**

| Step | Title | Fields |
|------|-------|--------|
| 1 | Personal Information | Legal name, DOB, Address, SSN last 4 (optional) |
| 2 | Driver's License | Front image, Back image |
| 3 | Profile Photo | Selfie/face photo (optional for MVP) |
| 4 | Vehicle & Insurance | Vehicle info (from drivers table), Insurance upload (optional) |
| 5 | Review & Submit | Summary of all info, submit button |

**UI Layout:**
```text
+----------------------------------------------------------+
|  ← Driver KYC Verification                               |
+----------------------------------------------------------+
|                                                           |
|  Step 1 of 5: Personal Information                        |
|  ━━━━━━━━━━━━ ○ ○ ○ ○                                      |
|                                                           |
|  +------------------------------------------------------+|
|  | Legal First Name                                     ||
|  | [_________________________]                          ||
|  |                                                      ||
|  | Legal Last Name                                      ||
|  | [_________________________]                          ||
|  |                                                      ||
|  | Date of Birth                                        ||
|  | [__/__/____]                                         ||
|  |                                                      ||
|  | Address                                              ||
|  | [_________________________]                          ||
|  | City            State      ZIP                       ||
|  | [________]      [__]       [_____]                   ||
|  +------------------------------------------------------+|
|                                                           |
|  [Back]                              [Continue →]         |
|                                                           |
+----------------------------------------------------------+
```

**Components to Create:**
- `KYCStepIndicator.tsx` - Progress stepper
- `KYCDocumentUpload.tsx` - Drag-drop upload with preview
- `KYCStatusBanner.tsx` - Shows current status (Pending Review, Rejected, etc.)
- `KYCInfoRequestAlert.tsx` - Shows admin's request for more info

### D) Merchant KYC Page

**File to Create:** `src/pages/merchant/MerchantKYCPage.tsx`

**Route:** `/merchant/kyc`

**Steps:**

| Step | Title | Fields |
|------|-------|--------|
| 1 | Business Information | Legal business name, Business type, EIN (optional) |
| 2 | Owner Verification | Owner name, DOB, Owner ID upload |
| 3 | Business Documents | Business license upload (optional) |
| 4 | Payout Readiness | Stripe Connect status display, link to Stripe onboarding |
| 5 | Review & Submit | Summary, submit button |

### E) Admin KYC Inbox Page

**File to Create:** `src/pages/admin/KYCInboxPage.tsx`

**Route:** `/admin/kyc`

**Features:**
- List of all pending KYC submissions
- Filter by role (driver/merchant), status
- Search by name/email
- Quick stats (pending, approved today, rejected)
- Click to open detail view

**UI Layout:**
```text
+----------------------------------------------------------+
|  KYC Verification Queue                    [Refresh]      |
+----------------------------------------------------------+
|                                                           |
|  [Pending: 12] [Approved: 8] [Rejected: 2] [Needs Info: 3]|
|                                                           |
|  Filters: [All Roles ▼] [Pending ▼] [Search...]          |
|                                                           |
|  +------------------------------------------------------+|
|  | DRIVER | John Smith          | Submitted 2h ago      ||
|  |        | john@email.com      | 4/4 docs uploaded     ||
|  |        |                     | [Review]              ||
|  +------------------------------------------------------+|
|  | MERCHANT | Pizza Palace      | Submitted 5h ago      ||
|  |          | owner@pizza.com   | 3/3 docs uploaded     ||
|  |          |                   | [Review]              ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

### F) Admin KYC Review Page

**File to Create:** `src/pages/admin/KYCReviewPage.tsx`

**Route:** `/admin/kyc/:userId`

**Features:**
- View all submitted information
- View uploaded documents (with signed URL)
- Document viewer/lightbox
- Approve / Reject / Request More Info buttons
- Rejection reason input
- More info request message input
- Audit event timeline

**UI Layout:**
```text
+----------------------------------------------------------+
|  ← Back to Queue                  Status: Pending Review  |
+----------------------------------------------------------+
|                                                           |
|  [Avatar] John Smith                                      |
|           Driver • Applied Feb 9, 2026                    |
|                                                           |
|  ┌─────────────────────────────────────────────────────┐  |
|  │ Personal Information                                │  |
|  ├─────────────────────────────────────────────────────┤  |
|  │ Name: John Michael Smith                            │  |
|  │ DOB: 1990-05-15 (35 years old)                      │  |
|  │ Address: 123 Main St, Baton Rouge, LA 70801         │  |
|  └─────────────────────────────────────────────────────┘  |
|                                                           |
|  ┌─────────────────────────────────────────────────────┐  |
|  │ Documents                                           │  |
|  ├─────────────────────────────────────────────────────┤  |
|  │ [🖼️ License Front]  [🖼️ License Back]  [🖼️ Selfie]  │  |
|  │        Pending           Pending         Pending    │  |
|  └─────────────────────────────────────────────────────┘  |
|                                                           |
|  ┌─────────────────────────────────────────────────────┐  |
|  │ Audit Trail                                         │  |
|  ├─────────────────────────────────────────────────────┤  |
|  │ • Feb 9, 2:30 PM - Submitted by user                │  |
|  │ • Feb 9, 10:15 AM - Document uploaded: license_front│  |
|  │ • Feb 9, 10:00 AM - KYC started                     │  |
|  └─────────────────────────────────────────────────────┘  |
|                                                           |
|  Admin Notes (internal):                                  |
|  [___________________________________________________]    |
|                                                           |
|  ┌─────────────────────────────────────────────────────┐  |
|  │ [Request Info]  [❌ Reject]        [✓ Approve]      │  |
|  └─────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

### G) KYC Status Badge Component

**File to Create:** `src/components/kyc/KYCStatusBadge.tsx`

Display status consistently across all pages:

| Status | Badge Color | Icon |
|--------|-------------|------|
| draft | gray | Edit |
| submitted | amber | Clock |
| under_review | blue | Eye |
| approved | green | CheckCircle |
| rejected | red | XCircle |
| needs_info | orange | AlertTriangle |

### H) Block Driver "Go Online" Until Approved

**File to Modify:** `src/pages/driver/DriverHomePage.tsx`

Add KYC check before allowing online toggle:

```typescript
// Add to DriverHomePage
const { data: kycSubmission } = useKYCSubmission('driver');
const kycApproved = kycSubmission?.status === 'approved';

// In toggle handler
const handleToggleOnline = () => {
  if (!driver) return;
  
  if (!kycApproved) {
    toast.error("Complete KYC verification first", {
      description: "You must be verified before going online.",
      action: {
        label: "Start KYC",
        onClick: () => navigate("/driver/kyc"),
      },
    });
    return;
  }
  
  updateStatus.mutate({
    driverId: driver.id,
    isOnline: !driver.is_online,
  });
};
```

Also show banner if KYC not complete:
```tsx
{!kycApproved && (
  <KYCStatusBanner 
    status={kycSubmission?.status || 'not_started'} 
    role="driver"
    onStartClick={() => navigate("/driver/kyc")}
  />
)}
```

### I) Block Merchant Payouts/Ads Until Approved

**File to Modify:** `src/pages/merchant/MerchantAdsPage.tsx`

Add KYC check:

```typescript
const { data: kycSubmission } = useKYCSubmission('merchant');
const kycApproved = kycSubmission?.status === 'approved';

if (!kycApproved) {
  return (
    <KYCRequiredBanner 
      status={kycSubmission?.status || 'not_started'}
      role="merchant"
      message="Complete verification to activate ads and receive payouts."
    />
  );
}
```

### J) Update Profile KYC Status on Approval

When admin approves/rejects, sync to `profiles.kyc_status`:

```typescript
// In useApproveKYC mutation
await supabase
  .from("profiles")
  .update({
    kyc_status: "approved",
    kyc_verified_at: new Date().toISOString(),
    kyc_rejection_reason: null,
    payout_hold: false, // Release payout hold
  })
  .eq("user_id", userId);

// Also update drivers.can_go_online if driver
if (role === 'driver') {
  await supabase
    .from("drivers")
    .update({ 
      can_go_online: true,
      documents_verified: true,
      status: 'verified',
    })
    .eq("user_id", userId);
}

// Also update restaurants.documents_verified if merchant
if (role === 'merchant') {
  await supabase
    .from("restaurants")
    .update({ 
      documents_verified: true,
      status: 'active',
    })
    .eq("owner_id", userId);
}
```

### K) KYC Notifications

**Integrate with existing `send-notification` edge function:**

| Event | Notify | Channels |
|-------|--------|----------|
| User submits KYC | Admin | Push (admin bell) |
| Admin approves | User | Push, Email |
| Admin rejects | User | Push, Email, SMS (critical) |
| Admin requests info | User | Push, Email |

```typescript
// On submission
await supabase.functions.invoke("send-notification", {
  body: {
    type: "admin_alert",
    title: "New KYC Submission",
    body: `${role} verification submitted by ${name}`,
    action_url: `/admin/kyc/${userId}`,
  },
});

// On approval
await supabase.functions.invoke("send-notification", {
  body: {
    user_id: userId,
    title: "Verification Approved",
    body: "Your account has been verified. You can now go online!",
    priority: "critical",
    event_type: "kyc_approved",
  },
});
```

### L) Routes Configuration

**File to Modify:** `src/App.tsx`

```typescript
// Lazy imports
const DriverKYCPage = lazy(() => import("./pages/driver/DriverKYCPage"));
const MerchantKYCPage = lazy(() => import("./pages/merchant/MerchantKYCPage"));
const KYCInboxPage = lazy(() => import("./pages/admin/KYCInboxPage"));
const KYCReviewPage = lazy(() => import("./pages/admin/KYCReviewPage"));

// Routes
<Route path="/driver/kyc" element={<ProtectedRoute><DriverKYCPage /></ProtectedRoute>} />
<Route path="/merchant/kyc" element={<ProtectedRoute><MerchantKYCPage /></ProtectedRoute>} />
<Route path="/admin/kyc" element={<ProtectedRoute requireAdmin><KYCInboxPage /></ProtectedRoute>} />
<Route path="/admin/kyc/:userId" element={<ProtectedRoute requireAdmin><KYCReviewPage /></ProtectedRoute>} />
```

---

## File Summary

### Database Migration (1)
| Change | Purpose |
|--------|---------|
| Create `kyc_submissions` table | Central KYC tracking |
| Create `kyc_events` table | Audit trail |
| Create `kyc-documents` bucket | Private document storage |
| RLS policies | Security for both tables and bucket |

### New Files (12)
| File | Purpose |
|------|---------|
| `src/lib/kyc.ts` | KYC types, helpers, validation |
| `src/hooks/useKYC.ts` | All KYC-related React Query hooks |
| `src/pages/driver/DriverKYCPage.tsx` | Driver verification wizard |
| `src/pages/merchant/MerchantKYCPage.tsx` | Merchant verification wizard |
| `src/pages/admin/KYCInboxPage.tsx` | Admin queue view |
| `src/pages/admin/KYCReviewPage.tsx` | Admin detail review |
| `src/components/kyc/KYCStepIndicator.tsx` | Step progress UI |
| `src/components/kyc/KYCDocumentUpload.tsx` | Document upload with preview |
| `src/components/kyc/KYCStatusBadge.tsx` | Status badge component |
| `src/components/kyc/KYCStatusBanner.tsx` | Full-width status banner |
| `src/components/kyc/KYCInfoRequestAlert.tsx` | Admin info request display |
| Migration SQL file | Schema changes |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/pages/driver/DriverHomePage.tsx` | Add KYC check before going online |
| `src/pages/merchant/MerchantAdsPage.tsx` | Add KYC requirement banner |
| `src/pages/RestaurantDashboard.tsx` | Add KYC status indicator |
| `src/App.tsx` | Add KYC routes |

---

## Data Flow

```text
Driver/Merchant Opens KYC Page
        ↓
Load existing submission (or create draft)
        ↓
Complete steps 1-4/5:
├── Save personal/business info
├── Upload documents to kyc-documents bucket
├── Log events to kyc_events
└── Update kyc_submissions.completed_steps
        ↓
Submit for Review
├── Set status = 'submitted'
├── Set submitted_at = now()
├── Log 'submitted' event
└── Notify admin (send-notification)
        ↓
Admin Reviews in /admin/kyc/:userId
├── View documents via signed URLs
├── Add internal notes
└── Take action:
    ├── Approve → Update profiles.kyc_status, unlock features
    ├── Reject → Set rejection_reason, notify user
    └── Request Info → Set info_request_message, notify user
        ↓
Log event to kyc_events
        ↓
Notify user via push/email/SMS
        ↓
If approved:
├── profiles.kyc_status = 'approved'
├── profiles.payout_hold = false
├── drivers.can_go_online = true (if driver)
└── restaurants.documents_verified = true (if merchant)
```

---

## Security Controls

### 1. Role-Based Access
- Users can only see/edit their own submissions
- Admins can view all submissions
- Status changes only by admin

### 2. Document Security
- Private bucket (not public)
- Signed URLs with 1-hour expiry for viewing
- RLS enforces user-folder isolation

### 3. Audit Trail
- Every action logged to `kyc_events`
- Actor ID and role recorded
- Immutable log (no delete/update policies)

### 4. KYC-Gated Features
- Driver cannot go online without KYC approval
- Merchant cannot run ads without KYC approval
- Payouts blocked via `profiles.payout_hold`

### 5. Status Transitions
Only valid transitions allowed:
- draft → submitted
- submitted → under_review → approved/rejected/needs_info
- needs_info → submitted (resubmission)
- rejected → submitted (resubmission)

---

## Summary

This implementation creates a complete KYC verification system:

1. **Driver KYC** - 5-step wizard for personal info, license, selfie, vehicle/insurance
2. **Merchant KYC** - 5-step wizard for business info, owner ID, business license, Stripe status
3. **Admin Review** - Queue view with filters, detail page with document viewer
4. **Audit Trail** - Every action logged with actor, timestamp, metadata
5. **Feature Gating** - Drivers blocked from going online, merchants blocked from ads/payouts
6. **Notifications** - Push/email/SMS for status changes
7. **Security** - RLS, signed URLs, role checks

Builds on existing infrastructure (profiles.kyc_status, driver_documents patterns, notification system) with minimal new tables.

