
# Business Accounts — Implementation Plan

## Overview
Enable users to join or create a company account for corporate billing, allowing payment to be charged to the company instead of personal payment methods. This includes a Business Account section in account settings with invite code functionality and checkout integration.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Business accounts table | Exists | `business_accounts` (id, company_name, billing_email) |
| Business account users table | Exists | `business_account_users` (business_id, user_id, role) |
| Business renter accounts | Exists | `business_renter_accounts` (full corporate profile) |
| Invite code system | Exists | `useRenterInvites.ts` (for P2P invites) |
| Account settings pages | Exists | `src/pages/account/` |
| EatsCheckout | Exists | `src/pages/EatsCheckout.tsx` |
| B2B config | Exists | `src/config/b2bTravelConfig.ts` |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| Business Account settings page | Missing | Section for joining/creating company |
| Company invite codes table | Missing | Table for company-specific invite codes |
| User business membership hook | Missing | Check if user belongs to a company |
| Payment method selector | Missing | Personal vs Company toggle |
| Checkout company billing display | Missing | "Billed to company" indicator |

---

## Implementation Plan

### 1) Database Schema Updates

**New Table: `company_invite_codes`**

Stores invite codes that allow users to join specific companies.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| business_id | uuid (FK) | Links to business_accounts |
| invite_code | text | 8-char alphanumeric code (e.g., "ACME2024") |
| created_by | uuid (FK) | User who created the code |
| expires_at | timestamp | Optional expiration |
| max_uses | integer | Max number of times code can be used |
| uses_count | integer | Current number of uses |
| is_active | boolean | Whether code is active |
| created_at | timestamp | Creation timestamp |

**Updates to `business_accounts`:**
- Add `invite_code_enabled` (boolean) — whether company allows invite joins
- Add `owner_id` (uuid FK to auth.users) — company owner/admin

**Updates to `business_account_users`:**
- Add `payment_preference` (text) — "personal" or "company"
- Add `joined_via` (text) — "invite_code" or "direct"
- Add `joined_at` (timestamp)

**RLS Policies:**
- Users can read their own business membership
- Company admins can manage invite codes
- Company admins can view all company members

---

### 2) Create Business Account Settings Page

**File to Create:** `src/pages/account/BusinessAccountPage.tsx`

**Purpose:** Section in account settings for managing business account membership.

**States:**
1. **No Business Account** — Show options to join or create
2. **Member of Company** — Show company info, role, payment preference
3. **Company Admin** — Additional management options

**UI Layout:**

```text
┌─────────────────────────────────────────────────┐
│ ← Business Account                    [Building]│
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ 🏢 Join a Company                         │  │
│ │ Enter your company's invite code          │  │
│ │                                           │  │
│ │ [ENTER CODE          ]    [Join]         │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ─────────────── OR ────────────────            │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ 🆕 Create a Business Account              │  │
│ │ Set up company billing for your team      │  │
│ │                                           │  │
│ │ [Get Started →]                           │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**When Member:**

```text
┌─────────────────────────────────────────────────┐
│ ← Business Account                              │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ 🏢 Acme Corporation                       │  │
│ │ Member since Jan 2024 • Employee          │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ 💳 Payment Method                         │  │
│ │                                           │  │
│ │ (○) Personal — Use my own card            │  │
│ │ (●) Company — Billed to Acme Corp         │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ [Leave Company]                                 │
└─────────────────────────────────────────────────┘
```

---

### 3) Create Business Membership Hook

**File to Create:** `src/hooks/useBusinessMembership.ts`

**Purpose:** Fetch and manage user's business account membership.

**Functions:**
- `useBusinessMembership()` — Get current user's business membership
- `useJoinCompanyWithCode()` — Join company using invite code
- `useLeaveCompany()` — Leave current company
- `useUpdatePaymentPreference()` — Toggle personal/company payment

**Return Type:**
```text
interface BusinessMembership {
  isMember: boolean;
  company: {
    id: string;
    name: string;
    billingEmail: string;
  } | null;
  role: "admin" | "member" | "viewer";
  paymentPreference: "personal" | "company";
  joinedAt: string;
  isLoading: boolean;
}
```

---

### 4) Create Company Invite Code Validation Hook

**File to Create:** `src/hooks/useCompanyInviteCode.ts`

**Purpose:** Validate and redeem company invite codes.

**Functions:**
- `useValidateCompanyCode()` — Check if code is valid
- `useRedeemCompanyCode()` — Join company with code

**Validation Logic:**
1. Check code exists and is active
2. Check code hasn't expired
3. Check max uses not exceeded
4. Check user not already in this company

---

### 5) Update EatsCheckout for Business Billing

**File to Modify:** `src/pages/EatsCheckout.tsx`

**Changes:**
- Import `useBusinessMembership` hook
- Add payment method selector when user is company member
- Show "Billed to company" badge in order summary
- Pass billing type to order creation

**New UI Section (before order summary):**

```text
┌───────────────────────────────────────────────┐
│ 💳 Payment Method                              │
│                                                │
│ ┌──────────────────┐ ┌──────────────────┐    │
│ │ Personal         │ │ ✓ Company        │    │
│ │ My payment       │ │ Acme Corp        │    │
│ └──────────────────┘ └──────────────────┘    │
└───────────────────────────────────────────────┘
```

**In Order Summary:**

```text
Payment: Billed to Acme Corporation
```

---

### 6) Update Order Creation

**File to Modify:** `src/hooks/useEatsOrders.ts`

**Changes:**
- Add `billing_type` field: "personal" | "company"
- Add `business_account_id` field when billing to company
- Store company billing info in order record

**New Fields in CreateFoodOrderInput:**
```text
billing_type?: "personal" | "company";
business_account_id?: string;
business_account_name?: string;
```

---

### 7) Add Route and Navigation

**File to Modify:** `src/App.tsx`

**Changes:**
- Import lazy-loaded `BusinessAccountPage`
- Add route: `/account/business`

**File to Update:** `src/pages/mobile/MobileAccount.tsx`

**Changes:**
- Add "Business Account" menu item in Account Settings section
- Show company badge if user is a member

---

## File Summary

### New Files (3)
| File | Purpose |
|------|---------|
| `src/pages/account/BusinessAccountPage.tsx` | Business account settings section |
| `src/hooks/useBusinessMembership.ts` | User's business membership state |
| `src/hooks/useCompanyInviteCode.ts` | Invite code validation/redemption |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/pages/EatsCheckout.tsx` | Payment method selector, company billing display |
| `src/hooks/useEatsOrders.ts` | Add billing type to order creation |
| `src/App.tsx` | Add /account/business route |
| `src/pages/mobile/MobileAccount.tsx` | Add Business Account menu item |

### Database Changes (1 migration)
| Change | Description |
|--------|-------------|
| New table | `company_invite_codes` |
| Alter table | `business_accounts` — add owner_id, invite_code_enabled |
| Alter table | `business_account_users` — add payment_preference, joined_via, joined_at |
| RLS policies | For all new/modified tables |

---

## Invite Code Flow

### Joining a Company

```text
1. User enters invite code in Business Account settings
2. System validates code:
   - Code exists and is_active = true
   - Not expired (expires_at is null or > now)
   - Uses remaining (uses_count < max_uses or max_uses is null)
   - User not already a member
3. If valid:
   - Create row in business_account_users
   - Increment uses_count on invite code
   - Show success, display company info
4. If invalid:
   - Show specific error message
```

### Code Format
- 8 alphanumeric characters
- Uppercase only
- No confusing characters (0/O, 1/I, L)
- Example: `ACME2024`, `TECH8K4M`

---

## Payment Method Logic

### Selection Rules
| Condition | Available Options |
|-----------|------------------|
| Not a company member | Personal only (no UI shown) |
| Company member, preference = personal | Both options, Personal selected |
| Company member, preference = company | Both options, Company selected |

### Checkout Display
- Personal: Standard checkout (no changes)
- Company: Show "Billed to {Company Name}" badge near total

### Order Record
- `billing_type`: "personal" or "company"
- `business_account_id`: null or company UUID
- `business_account_name`: null or company name

---

## Security Considerations

### RLS Policies

```text
company_invite_codes:
- SELECT: Company admins can view their company's codes
- INSERT: Company admins can create codes
- UPDATE: Company admins can modify their codes
- DELETE: Company admins can delete their codes

business_account_users:
- SELECT: Users can view their own membership
- SELECT: Company admins can view all company members
- INSERT: Via invite code redemption (RPC function)
- DELETE: User can leave, admin can remove members
```

### Server-Side Validation
- Invite code validation in secure RPC function
- Payment preference stored server-side
- Company billing requires active membership verification

---

## UI Components

### PaymentMethodSelector Component

**File to Create:** `src/components/checkout/PaymentMethodSelector.tsx`

```text
Props:
- membership: BusinessMembership
- selected: "personal" | "company"
- onSelect: (type) => void
- disabled?: boolean

Features:
- Two toggle cards (Personal / Company)
- Company option shows company name
- Only visible when user is company member
```

### CompanyBillingBadge Component

**File to Create:** `src/components/checkout/CompanyBillingBadge.tsx`

```text
Props:
- companyName: string

Display:
- Building2 icon + "Billed to {companyName}"
- Muted styling, informational
```

---

## Empty States

| State | Display |
|-------|---------|
| No membership | Join/Create options |
| Pending invite | "Invite sent to company admin for approval" |
| Left company | Confirmation + option to rejoin |

---

## Summary

This implementation provides:

1. **Business Account settings page** — Join company with invite code or create new
2. **Payment method toggle** — Personal or Company billing preference
3. **Checkout integration** — "Billed to company" indicator when company payment selected
4. **Invite code system** — Secure codes for company membership
5. **Membership management** — View company, change preference, leave company
6. **Order tracking** — Billing type stored with each order

The feature enables corporate users to easily expense orders to their company while maintaining personal account flexibility.
