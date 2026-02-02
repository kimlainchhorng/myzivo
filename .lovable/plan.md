
# Phase 2: P2P Car Owner Onboarding

## Overview
Build the complete owner onboarding flow for the ZIVO P2P car rental marketplace. This includes the owner application form, document uploads, admin approval module, and owner profile management.

---

## What We're Building

### Public Pages
1. **List Your Car Landing** (`/list-your-car`) - Marketing page to attract car owners
2. **Owner Application** (`/owner/apply`) - Multi-step form for becoming a host

### Owner Dashboard Pages (Protected)
3. **Owner Dashboard** (`/owner/dashboard`) - Overview with earnings and stats
4. **Owner Profile** (`/owner/profile`) - Edit profile and settings

### Admin Module
5. **Admin P2P Owners Module** - Review and approve/reject owner applications

---

## Technical Implementation

### 1. New Hooks

**`src/hooks/useCarOwner.ts`**
```text
- useCarOwnerProfile() - Fetch current user's owner profile
- useCreateOwnerProfile() - Submit owner application
- useUpdateOwnerProfile() - Update profile details
- useOwnerDocuments() - Fetch owner's uploaded documents
- useUploadOwnerDocument() - Upload document to storage
```

**`src/hooks/useAdminP2P.ts`**
```text
- useCarOwners() - Fetch all owner profiles (admin)
- useUpdateOwnerStatus() - Approve/reject owner (admin)
- useOwnerDocuments(ownerId) - Fetch owner's documents (admin)
- useUpdateDocumentStatus() - Approve/reject document (admin)
```

### 2. New Pages

#### List Your Car Landing (`/list-your-car`)
- Hero section with value proposition
- How it works steps (List, Rent, Earn)
- Earnings calculator preview
- Trust & safety highlights
- CTA to start application

#### Owner Application (`/owner/apply`)
Multi-step wizard following the driver registration pattern:

**Step 1: Personal Information**
- Full name
- Email  
- Phone
- Date of birth
- Address (street, city, state, zip)

**Step 2: Verification**
- Driver's license number
- SSN last 4 digits (for Stripe Connect)
- Insurance option selection (Platform / Own / None)

**Step 3: Documents**
- Driver's license upload
- Proof of address (utility bill, bank statement)
- Insurance certificate (if own insurance)
- Profile photo

**Step 4: Confirmation**
- Application submitted message
- Next steps (await approval)
- Link to add vehicles (disabled until approved)

#### Owner Dashboard (`/owner/dashboard`)
- Welcome message with approval status
- Quick stats (vehicles listed, active bookings, total earnings)
- Recent activity feed
- Quick links to add vehicle, view earnings

### 3. Admin Module

**`AdminP2POwnersModule.tsx`** (added to AdminPanel)
- Stats cards: Total owners, Pending, Verified, Suspended
- Search & filter by name, email, status
- Table with owner list showing:
  - Name, email, phone
  - Status badge (pending/verified/rejected/suspended)
  - Documents verified indicator
  - Created date
  - Quick actions: View, Approve, Reject
- Detail modal with:
  - Full profile information
  - Document viewer with approve/reject per document
  - Status change dropdown
  - Notes field for rejection reason

### 4. Storage Integration

Documents uploaded to `p2p-documents` bucket:
```text
Path format: {user_id}/{document_type}_{timestamp}.{ext}

Example: 
abc123/drivers_license_1706890000.jpg
abc123/insurance_1706890000.pdf
```

### 5. Database Operations

**Owner Application Flow:**
1. User submits Step 1 & 2 -> Create `car_owner_profiles` record (status: 'pending')
2. User uploads documents -> Create `car_owner_documents` records
3. Application complete -> Profile marked ready for review

**Admin Review Flow:**
1. Admin views pending owners
2. Admin reviews each document (approve/reject with notes)
3. When all documents approved -> Admin approves owner
4. Owner receives notification (future: email)
5. Owner can now add vehicles

---

## File Structure

```text
src/
├── hooks/
│   ├── useCarOwner.ts          # Owner-side hooks
│   └── useAdminP2P.ts          # Admin P2P hooks
├── pages/
│   ├── ListYourCar.tsx         # Marketing landing
│   ├── owner/
│   │   ├── OwnerApply.tsx      # Application wizard
│   │   ├── OwnerDashboard.tsx  # Owner home
│   │   └── OwnerProfile.tsx    # Profile settings
│   └── admin/
│       └── modules/
│           └── AdminP2POwnersModule.tsx
├── components/
│   └── owner/
│       ├── OwnerApplicationSteps.tsx
│       ├── OwnerDocumentUpload.tsx
│       ├── OwnerStatusBadge.tsx
│       └── OwnerStatsCards.tsx
└── types/
    └── p2p.ts                  # P2P TypeScript types
```

---

## Routes to Add

```typescript
// Public
<Route path="/list-your-car" element={<ListYourCar />} />

// Owner (Protected)
<Route path="/owner/apply" element={<ProtectedRoute><OwnerApply /></ProtectedRoute>} />
<Route path="/owner/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
<Route path="/owner/profile" element={<ProtectedRoute><OwnerProfile /></ProtectedRoute>} />
```

---

## Form Validation Schema

```typescript
const ownerApplicationSchema = z.object({
  // Step 1
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  date_of_birth: z.date().refine(d => age >= 21, "Must be 21+"),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().length(2),
  zip_code: z.string().regex(/^\d{5}$/),
  
  // Step 2
  ssn_last_four: z.string().length(4).regex(/^\d{4}$/),
  insurance_option: z.enum(['platform', 'own', 'none']),
});
```

---

## Admin Panel Integration

Add to `AdminPanel.tsx` navItems:
```typescript
{ id: "p2p-owners", label: "P2P Owners", icon: CarFront }
```

Add to renderModule switch:
```typescript
case "p2p-owners":
  return <AdminP2POwnersModule />;
```

---

## Key Features

1. **Multi-step wizard** - Clean, guided experience matching driver registration UX
2. **Document upload with preview** - Image/PDF support with size validation
3. **Status tracking** - Clear indicators for application status
4. **Admin review workflow** - Approve/reject documents individually
5. **Mobile-first design** - Responsive forms and upload interfaces

---

## Estimated Deliverables

| Component | Description |
|-----------|-------------|
| `ListYourCar.tsx` | Marketing landing page |
| `OwnerApply.tsx` | 4-step application wizard |
| `OwnerDashboard.tsx` | Owner home with stats |
| `useCarOwner.ts` | Owner-side data hooks |
| `useAdminP2P.ts` | Admin data hooks |
| `AdminP2POwnersModule.tsx` | Admin approval interface |
| `types/p2p.ts` | TypeScript type definitions |
| Route updates in `App.tsx` | New routes registered |

---

## After This Phase

Once Phase 2 is complete, owners can:
- Apply to become hosts
- Upload verification documents
- Get approved by admin

Next: **Phase 3 - Vehicle Management** where approved owners can add their cars.
