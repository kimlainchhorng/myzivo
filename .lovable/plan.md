
# Renter Verification (Driver License Flow) - Implementation Plan

## Overview
Create a complete renter verification system for the ZIVO P2P Car Rental Marketplace that ensures only verified drivers can book cars. This includes a multi-step verification wizard for renters, document upload and review, admin verification panel, and checkout integration.

---

## Database Schema

### New Tables Required

#### 1. `renter_profiles`
Stores renter verification information and status.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Reference to auth.users |
| `full_name` | text | Full legal name |
| `date_of_birth` | date | Date of birth (21+) |
| `license_number` | text | Driver license number |
| `license_state` | text | License issuing state (2-letter) |
| `license_expiration` | date | License expiration date |
| `verification_status` | enum | pending / approved / rejected / suspended |
| `rejection_reason` | text | Reason for rejection (if applicable) |
| `reviewed_at` | timestamp | When admin reviewed |
| `reviewed_by` | uuid | Admin who reviewed |
| `created_at` | timestamp | Record created |
| `updated_at` | timestamp | Last updated |

#### 2. `renter_documents`
Stores document uploads for renter verification.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `renter_id` | uuid | FK to renter_profiles |
| `document_type` | enum | license_front / license_back / selfie |
| `file_name` | text | Original file name |
| `file_url` | text | Storage URL |
| `file_size` | integer | File size in bytes |
| `mime_type` | text | MIME type |
| `status` | enum | pending / approved / rejected |
| `reviewed_at` | timestamp | When admin reviewed |
| `reviewed_by` | uuid | Admin who reviewed |
| `notes` | text | Review notes |
| `created_at` | timestamp | Record created |

#### 3. New Enums

```sql
CREATE TYPE renter_verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE renter_document_type AS ENUM ('license_front', 'license_back', 'selfie');
```

---

## File Structure

### New Files to Create

```text
src/pages/verify/
├── RenterVerification.tsx       - Multi-step verification wizard
├── VerificationStatus.tsx       - Status page (pending/approved/rejected)

src/hooks/
├── useRenterVerification.ts     - Hooks for renter verification

src/components/verify/
├── RenterDocumentUpload.tsx     - Document upload component for renters
├── VerificationPromptModal.tsx  - Modal prompting unverified users

src/pages/admin/modules/
├── AdminRentersModule.tsx       - Admin panel for renter verification

src/types/
├── renter.ts                    - TypeScript types for renter verification
```

### Files to Modify

```text
src/App.tsx                      - Add new routes for /verify/*
src/pages/admin/AdminPanel.tsx   - Add "P2P Renters" nav item
src/pages/p2p/P2PVehicleDetail.tsx - Add verification check before booking
src/hooks/useP2PBooking.ts       - Add renter verification check in useCreateBooking
```

---

## Implementation Details

### 1. Renter Verification Flow (RenterVerification.tsx)

Multi-step wizard with 4 steps:

**Step 1: Driver Information**
- Full legal name (auto-populated from auth if available)
- Date of birth (must be 21+)
- Driver license number
- License issuing state (dropdown)
- License expiration date (must be in future)

Validation:
```typescript
const driverInfoSchema = z.object({
  full_name: z.string().min(2).max(100),
  date_of_birth: z.string().refine(val => calculateAge(val) >= 21, "Must be 21+"),
  license_number: z.string().min(4).max(20),
  license_state: z.string().length(2),
  license_expiration: z.string().refine(val => new Date(val) > new Date(), "License must not be expired"),
});
```

**Step 2: License Upload**
- Upload license front image (required)
- Upload license back image (required)
- Clear image guidelines displayed

**Step 3: Selfie Verification**
- Upload selfie photo
- Guidelines: "Make sure your face is clearly visible and matches your license"
- Placeholder for future automated KYC integration

**Step 4: Submission Complete**
- Confirmation message
- "Your verification is being reviewed"
- Link to check verification status

---

### 2. Verification Status Page (VerificationStatus.tsx)

Shows current verification status:

| State | Display |
|-------|---------|
| No profile | Redirect to /verify/driver |
| Pending | "Verification in progress" with progress indicator |
| Approved | Success message with checkmark, link to browse cars |
| Rejected | Rejection reason displayed, option to resubmit documents |
| Suspended | Contact support message |

---

### 3. Verification Prompt Modal (VerificationPromptModal.tsx)

Triggered when unverified user attempts to book:

```text
+------------------------------------------+
|  🔒 Verification Required                |
+------------------------------------------+
|  To keep our community safe, we need     |
|  to verify your driver's license before  |
|  you can book a car.                     |
|                                          |
|  This helps protect both renters and     |
|  vehicle owners on our platform.         |
|                                          |
|  [Cancel]          [Start Verification]  |
+------------------------------------------+
```

---

### 4. useRenterVerification.ts Hooks

```typescript
// Fetch current user's renter profile
useRenterProfile()

// Create renter profile with initial info
useCreateRenterProfile()

// Update renter profile
useUpdateRenterProfile()

// Fetch renter's documents
useRenterDocuments(renterId?: string)

// Upload document
useUploadRenterDocument()

// Check if renter is verified (for booking flow)
useIsRenterVerified()

// Admin: Fetch all renters with filters
useAdminRenters(status?: RenterVerificationStatus)

// Admin: Update renter status
useUpdateRenterStatus()

// Admin: Update document status
useUpdateRenterDocumentStatus()

// Admin: Stats
useAdminRenterStats()
```

---

### 5. Admin Renters Module (AdminRentersModule.tsx)

Similar structure to AdminP2POwnersModule.tsx:

**Header**
- Title: "P2P Renters"
- Description: "Manage renter verification and document review"

**Stats Cards**
- Total Renters
- Pending Review
- Verified
- Suspended

**Filters**
- Search by name/email
- Status filter dropdown

**Renters Table**
| Column | Data |
|--------|------|
| Renter | Name, city/state |
| Contact | Email, phone |
| License | Number, state, expiration |
| Status | Verification status badge |
| Documents | Count with approval indicators |
| Submitted | Date |
| Actions | View button |

**Renter Detail Modal**
- Personal information display
- License details with expiration warning if < 30 days
- Document gallery with approve/reject buttons
- Notes field for rejection reason
- Action buttons: Approve, Reject, Suspend

---

### 6. P2PVehicleDetail.tsx Integration

Modify booking flow to check verification:

```typescript
// Before handleBook function
const { data: renterProfile } = useRenterProfile();
const [showVerificationModal, setShowVerificationModal] = useState(false);

const handleBook = async () => {
  if (!user) {
    // ... existing login redirect
  }
  
  // Check renter verification
  if (!renterProfile || renterProfile.verification_status !== 'approved') {
    setShowVerificationModal(true);
    return;
  }
  
  // Check license expiration
  if (renterProfile.license_expiration && new Date(renterProfile.license_expiration) < new Date()) {
    toast.error("Your license has expired. Please update your verification.");
    navigate("/verify/status");
    return;
  }
  
  // ... existing booking logic
};

// Add modal at bottom of component
<VerificationPromptModal 
  open={showVerificationModal}
  onClose={() => setShowVerificationModal(false)}
  onStartVerification={() => navigate("/verify/driver")}
/>
```

---

### 7. useP2PBooking.ts Integration

Add server-side verification check in `useCreateBooking`:

```typescript
mutationFn: async ({ vehicleId, ... }) => {
  if (!user) throw new Error("Must be logged in");
  
  // Check renter verification
  const { data: renterProfile } = await supabase
    .from("renter_profiles")
    .select("verification_status, license_expiration")
    .eq("user_id", user.id)
    .single();
  
  if (!renterProfile || renterProfile.verification_status !== "approved") {
    throw new Error("Please complete driver verification before booking");
  }
  
  if (new Date(renterProfile.license_expiration) < new Date()) {
    throw new Error("Your driver's license has expired. Please update your verification.");
  }
  
  // ... existing booking logic
};
```

---

## Storage Bucket

Use existing `p2p-documents` bucket for renter documents:
- Files stored at: `{user_id}/renter/{document_type}_{timestamp}.{ext}`
- Bucket is private (not public) - admin-only access

---

## RLS Policies

### renter_profiles

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own renter profile"
  ON renter_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can create own renter profile"
  ON renter_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own renter profile"
  ON renter_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "Admin full access to renter profiles"
  ON renter_profiles FOR ALL
  USING (public.is_admin(auth.uid()));
```

### renter_documents

```sql
-- Users can view their own documents
CREATE POLICY "Users can view own renter documents"
  ON renter_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM renter_profiles rp 
    WHERE rp.id = renter_documents.renter_id 
    AND rp.user_id = auth.uid()
  ));

-- Users can insert their own documents
CREATE POLICY "Users can upload own renter documents"
  ON renter_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM renter_profiles rp 
    WHERE rp.id = renter_documents.renter_id 
    AND rp.user_id = auth.uid()
  ));

-- Admin full access
CREATE POLICY "Admin full access to renter documents"
  ON renter_documents FOR ALL
  USING (public.is_admin(auth.uid()));
```

---

## Routes to Add (App.tsx)

```typescript
// Renter Verification pages
const RenterVerification = lazy(() => import("./pages/verify/RenterVerification"));
const VerificationStatus = lazy(() => import("./pages/verify/VerificationStatus"));

// In Routes:
<Route path="/verify/driver" element={<ProtectedRoute><RenterVerification /></ProtectedRoute>} />
<Route path="/verify/status" element={<ProtectedRoute><VerificationStatus /></ProtectedRoute>} />
```

---

## AdminPanel.tsx Updates

Add new nav item:
```typescript
{ id: "p2p-renters", label: "P2P Renters", icon: UserCheck }
```

Add to switch statement:
```typescript
case "p2p-renters":
  return <AdminRentersModule />;
```

---

## Security Considerations

1. **Document Storage**: Files stored in private `p2p-documents` bucket
2. **RLS Policies**: Users can only access their own verification data
3. **Admin-Only Review**: Only admins can view all documents and change verification status
4. **Server-Side Validation**: Booking hook validates verification status server-side
5. **License Expiration**: System checks expiration and blocks booking if expired
6. **PII Protection**: License numbers and personal data protected by RLS

---

## Helper Functions

Add database function for checking renter verification:

```sql
CREATE OR REPLACE FUNCTION is_verified_renter(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM renter_profiles 
    WHERE user_id = user_uuid 
    AND verification_status = 'approved'
    AND license_expiration > CURRENT_DATE
  );
END;
$$;
```

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/types/renter.ts` | TypeScript types for renter verification |
| Create | `src/hooks/useRenterVerification.ts` | Data hooks for renter verification |
| Create | `src/components/verify/RenterDocumentUpload.tsx` | Document upload component |
| Create | `src/components/verify/VerificationPromptModal.tsx` | Verification prompt modal |
| Create | `src/pages/verify/RenterVerification.tsx` | Multi-step verification wizard |
| Create | `src/pages/verify/VerificationStatus.tsx` | Verification status page |
| Create | `src/pages/admin/modules/AdminRentersModule.tsx` | Admin verification panel |
| Modify | `src/App.tsx` | Add verification routes |
| Modify | `src/pages/admin/AdminPanel.tsx` | Add P2P Renters nav item |
| Modify | `src/pages/p2p/P2PVehicleDetail.tsx` | Add verification check before booking |
| Modify | `src/hooks/useP2PBooking.ts` | Add server-side verification check |
| Database | Migration | Create tables, enums, RLS policies, functions |

---

## UI/UX Flow Diagram

```text
User clicks "Book Now" on vehicle
           │
           ▼
    ┌─────────────────┐
    │ Check if logged │
    │      in?        │
    └────────┬────────┘
             │
    No ──────┼────── Yes
             │         │
    ┌────────┘         ▼
    │         ┌─────────────────┐
    ▼         │ Check renter    │
 Login Page   │ verification    │
              └────────┬────────┘
                       │
         Not Verified ─┼─ Verified
                       │       │
              ┌────────┘       │
              ▼                ▼
    ┌─────────────────┐   ┌─────────────────┐
    │ Show Modal:     │   │ Continue to     │
    │ "Start          │   │ Booking Flow    │
    │  Verification"  │   │                 │
    └────────┬────────┘   └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │ /verify/driver  │
    │ Step 1: Info    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Step 2: Upload  │
    │ License Images  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Step 3: Selfie  │
    │                 │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Step 4: Done    │
    │ Status: Pending │
    └────────┬────────┘
             │
             ▼
    Admin reviews in /admin → P2P Renters
             │
    Approved─┼─Rejected
             │      │
             ▼      ▼
    User can    User notified,
    now book    can resubmit
```
