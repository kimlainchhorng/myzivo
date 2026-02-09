
# Optional Identity Verification

## Overview

Add an optional identity verification feature at `/account/verification` for high-value users and business accounts. Users can upload a government ID and a selfie for manual admin review. Status flows through: Not Started, Pending, Verified, Rejected.

This builds a new system separate from the existing P2P renter verification (which requires license details). Customer identity verification is simpler -- just document uploads and status tracking.

## What Gets Built

### 1. Database: New table and storage bucket

Create a `customer_identity_verifications` table:
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, unique -- one verification per user)
- `id_document_url` (text) -- uploaded government ID image
- `selfie_url` (text) -- uploaded selfie image
- `status` (text: pending | verified | rejected, default: pending)
- `rejection_reason` (text, nullable)
- `reviewed_by` (uuid, nullable)
- `reviewed_at` (timestamptz, nullable)
- `created_at` / `updated_at` (timestamptz)

RLS policies:
- Users can SELECT/INSERT/UPDATE their own row (customer role required)
- Admins can SELECT/UPDATE all rows

Storage bucket: `identity-documents` (private) with RLS allowing authenticated users to upload to their own folder.

### 2. Hook: `useCustomerVerification`

New file: `src/hooks/useCustomerVerification.ts`

Provides:
- `verification` -- current verification record (or null if not started)
- `uploadDocument(type, file)` -- uploads to storage, updates the verification row
- `submitVerification()` -- sets status to "pending"
- `status` -- derived: "not_started" | "pending" | "verified" | "rejected"

### 3. Page: `/account/verification`

New file: `src/pages/account/VerificationPage.tsx`

Layout:
- Header with Shield icon and title "Identity Verification"
- Status banner showing current state (not started / pending / verified / rejected)
- Optional badge explanation: "Verified accounts get a trust badge and access to higher-value features"
- Two upload cards: Government ID and Selfie
- Submit button (enabled when both documents uploaded)
- If rejected: show reason and allow resubmission

### 4. Route and Navigation

- Add route: `/account/verification` in `App.tsx` (ProtectedRoute)
- Add menu item in `MobileAccount.tsx` account settings section with a Shield icon

## Files Summary

| File | Action | What |
|------|--------|------|
| `supabase/migrations/[timestamp]_customer_identity_verification.sql` | Create | Table, RLS, storage bucket |
| `src/hooks/useCustomerVerification.ts` | Create | Data fetching, upload, submission hook |
| `src/pages/account/VerificationPage.tsx` | Create | Full verification page UI |
| `src/App.tsx` | Update | Add route for `/account/verification` |
| `src/pages/mobile/MobileAccount.tsx` | Update | Add verification menu item |

## Technical Details

### Database migration

```text
-- Table
CREATE TABLE public.customer_identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  id_document_url text,
  selfie_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.customer_identity_verifications ENABLE ROW LEVEL SECURITY;

-- Customer can read/write own record
CREATE POLICY "Users can view own verification"
  ON public.customer_identity_verifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'customer'));

CREATE POLICY "Users can insert own verification"
  ON public.customer_identity_verifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'customer'));

CREATE POLICY "Users can update own verification"
  ON public.customer_identity_verifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'customer'));

-- Admin access
CREATE POLICY "Admins can view all verifications"
  ON public.customer_identity_verifications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update verifications"
  ON public.customer_identity_verifications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('identity-documents', 'identity-documents', false);

CREATE POLICY "Users upload own identity docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own identity docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Hook structure

```text
useCustomerVerification() returns:
  - verification: row data or null
  - status: "not_started" | "pending" | "verified" | "rejected"
  - isLoading: boolean
  - uploadDocument(type: "id" | "selfie", file: File): uploads to storage, upserts row
  - isUploading: boolean
```

Upload flow:
1. Upload file to `identity-documents/{user_id}/{type}_{timestamp}.{ext}`
2. Get signed URL (private bucket)
3. Upsert `customer_identity_verifications` row with the URL

### Page UI structure

```text
/account/verification

[Header: Shield icon + "Identity Verification"]

[Status Banner]
  Not started: "Optional -- verify your identity for enhanced trust"
  Pending: "Your documents are being reviewed (1-2 business days)"
  Verified: Green checkmark + "Your identity is verified"
  Rejected: Red banner with rejection reason + "Resubmit" option

[Info Card]
  "Why verify?"
  - Trust badge on your profile
  - Access to higher-value bookings
  - Enhanced account security

[Upload: Government ID]
  Drop zone with preview, accepts images

[Upload: Selfie]
  Drop zone with preview, accepts images

[Submit Button]
  Enabled only when both uploads present
  Disabled if status is "pending" or "verified"
```

### Navigation entry in MobileAccount

Add to `accountItems` array after "ZIVO Rewards":
```text
{ icon: Shield, label: "Identity Verification", path: "/account/verification" }
```

### Edge cases

- User uploads new documents while status is "rejected": reset status to "pending" on resubmit
- User navigates to page when already verified: show verified state, no upload zones
- File validation: images only, max 10MB
- Private bucket: use `createSignedUrl` for display (60-minute expiry)
- Only users with customer role can access (enforced by RLS)
