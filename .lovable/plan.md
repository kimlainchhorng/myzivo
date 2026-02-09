

# Order Disputes (Customer-Facing) — Implementation Plan

## Overview
Add a customer-facing dispute flow so users can report problems (missing items, wrong items, late orders, etc.) directly from their order detail pages. After submission, show a confirmation message. Provide a dedicated `/account/disputes` page for tracking dispute status.

---

## Current State

| What Exists | Details |
|-------------|---------|
| `order_disputes` table | Full dispute schema with status, reason, description, refund tracking |
| `useCreateDispute` hook | Mutation that inserts into `order_disputes` (currently used by admin with `created_role: "admin"`) |
| `useDisputes` hook | Fetches disputes (admin-oriented, joins on `food_orders`) |
| `TravelOrderDetailPage` | Customer order detail at `/trips/:orderNumber` — has Cancel and Resend buttons but no "Report a problem" |
| `MyOrdersPage` | Lists orders at `/my-orders` — clicking opens confirmation page |
| `CreateDisputeDialog` | Admin-oriented dispute dialog (references order total, driver payouts) |

### What's Missing
- No "Report a problem" button on customer order pages
- No customer-friendly dispute form (current dialog is admin-focused)
- No customer dispute listing page (`/account/disputes`)
- No hook to fetch disputes for the current customer
- No route registered for `/account/disputes`

---

## Implementation Plan

### 1) Create `useCustomerDisputes` Hook

**New file:** `src/hooks/useCustomerDisputes.ts`

A customer-focused hook that:
- `useMyDisputes()` — fetches disputes where `created_by = auth.uid()`, ordered by newest first
- `useCreateCustomerDispute()` — wraps `order_disputes` insert with `created_role: "customer"` and customer-friendly reason values

Reason values: `missing_items`, `wrong_items`, `order_late`, `other`

### 2) Create `ReportProblemDialog` Component

**New file:** `src/components/orders/ReportProblemDialog.tsx`

A customer-friendly dialog triggered by "Report a problem" button:
- Reason selector: Missing items, Wrong items, Order late, Other
- Description textarea (required)
- On submit: creates dispute via `useCreateCustomerDispute`
- On success: shows inline confirmation "Your request is under review" with a checkmark, then auto-closes after 3 seconds

### 3) Add "Report a problem" Button to Order Detail Pages

**Files to modify:**
- `src/pages/TravelOrderDetailPage.tsx` — Add a "Report a problem" button in the actions area (only for confirmed/delivered orders)

### 4) Create Customer Disputes Page

**New file:** `src/pages/CustomerDisputesPage.tsx`

Route: `/account/disputes`

Shows a list of the customer's disputes with:
- Order reference
- Reason (human-readable label)
- Status badge: Open (amber), Reviewing (blue), Resolved (green), Rejected (red)
- Submitted date
- Empty state: "No disputes filed"

### 5) Register Route in App.tsx

**File to modify:** `src/App.tsx`

Add route for `/account/disputes` pointing to `CustomerDisputesPage`, wrapped in `ProtectedRoute`.

---

## File Summary

### New Files (3)
| File | Purpose |
|------|---------|
| `src/hooks/useCustomerDisputes.ts` | Fetch + create disputes for logged-in customer |
| `src/components/orders/ReportProblemDialog.tsx` | Customer-friendly dispute form dialog |
| `src/pages/CustomerDisputesPage.tsx` | `/account/disputes` — dispute status tracking |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/pages/TravelOrderDetailPage.tsx` | Add "Report a problem" button |
| `src/App.tsx` | Register `/account/disputes` route |

---

## User Flow

```text
Customer opens order detail page
       |
       v
  Sees "Report a problem" button (below existing actions)
       |
       v
  Dialog opens with:
    - Reason dropdown: Missing items / Wrong items / Order late / Other
    - Description textarea (required)
    - Submit button
       |
       v
  On submit -> inserts into order_disputes (created_role: "customer")
       |
       v
  Dialog shows: [checkmark] "Your request is under review."
  Auto-closes after 3 seconds
       |
       v
  Customer can track at /account/disputes:
    - List of their disputes
    - Status: Open -> Reviewing -> Resolved
```

---

## Status Mapping

| DB Status | Customer-Facing Label | Badge Color |
|-----------|----------------------|-------------|
| `open` | Open | Amber |
| `under_review` | Reviewing | Blue |
| `resolved` | Resolved | Green |
| `rejected` | Closed | Gray |
| `escalated` | Reviewing | Blue |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Duplicate dispute on same order | Allow (admin can merge); show existing disputes on the form |
| Not logged in | "Report a problem" button hidden; `/account/disputes` redirects to login |
| Order in draft/pending status | "Report a problem" button hidden (only show for confirmed+ orders) |
| Empty disputes list | Show friendly empty state with illustration |

