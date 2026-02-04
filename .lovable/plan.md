
# ZIVO Master Admin Control Center

## Overview
Consolidate and enhance the existing admin infrastructure into a unified **Master Admin Control Center** that provides centralized management of Travel OTA, Driver/Eats operations, Support, and Global Settings with proper role-based access control.

---

## Current State Analysis

The project already has substantial admin infrastructure:
- **Role System**: `app_role` enum with `admin`, `super_admin`, `operations`, `finance`, `support` roles already defined
- **Admin Dashboard**: Comprehensive dashboard at `/admin` with 50+ modules
- **Travel Admin**: `/admin/travel` with partner management, redirect logs, analytics
- **Driver Hub**: Full driver management with tracking, documents, payouts
- **Database**: `travel_bookings`, `drivers`, `support_tickets`, `user_roles` tables exist

---

## Phase 1: Unified Admin Entry Point

### A. New Admin Login Page
**File**: `src/pages/admin/AdminLogin.tsx`

```text
+--------------------------------------------------+
|                 ZIVO ADMIN PORTAL                 |
|                                                   |
|  [Email Input]                                    |
|  [Password Input]                                 |
|                                                   |
|  [Login Button]                                   |
|                                                   |
|  Forgot password? | Magic link login             |
+--------------------------------------------------+
```

- Dedicated admin login at `/admin/login`
- Redirect to `/admin` on success
- Block non-admin roles with clear messaging

### B. Enhanced Role-Based Route Protection
**File**: `src/components/auth/AdminProtectedRoute.tsx`

New component supporting granular role checks:
- `requireAdmin` - full admin access
- `requireOps` - operations team (drivers, support, trips)
- `requireFinance` - financial access (payouts, reports)
- `requireSupport` - support team (tickets, refunds)

---

## Phase 2: Master Admin Layout

### A. Unified Admin Shell
**File**: `src/layouts/AdminLayout.tsx`

```text
+------------------------------------------------------------------+
| [ZIVO Logo] ADMIN CONTROL CENTER     [User] [Role Badge] [Logout]|
+------------------------------------------------------------------+
|           |                                                       |
| SIDEBAR   |   MAIN CONTENT AREA                                   |
|           |                                                       |
| Dashboard |   [Tab/Module Content]                                |
| Travel    |                                                       |
| Drivers   |                                                       |
| Eats      |                                                       |
| Support   |                                                       |
| Payouts   |                                                       |
| Settings  |                                                       |
| Reports   |                                                       |
|           |                                                       |
+------------------------------------------------------------------+
```

Features:
- Collapsible sidebar with icons
- Role-based menu visibility
- Breadcrumb navigation
- Quick search across admin

---

## Phase 3: Admin Routes Structure

### New Route Hierarchy

| Route | Access | Description |
|-------|--------|-------------|
| `/admin/login` | Public | Admin login page |
| `/admin` | All Admins | Master dashboard |
| `/admin/travel/bookings` | Ops, Admin | Travel bookings list |
| `/admin/travel/refunds` | Ops, Admin | Refund requests |
| `/admin/travel/suppliers` | Admin | API status page |
| `/admin/drivers` | Ops, Admin | Driver management hub |
| `/admin/eats` | Ops, Admin | Eats operations |
| `/admin/jobs` | Ops, Admin | Rides + deliveries |
| `/admin/payouts` | Finance, Admin | Driver/partner payouts |
| `/admin/support` | Support, Admin | Ticket management |
| `/admin/settings` | Admin only | Global configuration |
| `/admin/reports` | Finance, Admin | Analytics & exports |

---

## Phase 4: Master Dashboard Home

### File: `src/pages/admin/MasterDashboard.tsx`

**KPI Cards Row:**
```text
+-------------+ +-------------+ +-------------+ +-------------+
| Today       | | Today       | | Active      | | Active      |
| Bookings    | | Revenue     | | Drivers     | | Deliveries  |
|    145      | |   $12,450   | |    89       | |    34       |
+-------------+ +-------------+ +-------------+ +-------------+
+-------------+ +-------------+
| Open        | | Pending     |
| Tickets     | | Payouts     |
|    12       | |   $8,200    |
+-------------+ +-------------+
```

**Quick Actions Panel:**
- Approve pending drivers (count badge)
- Review documents (count badge)
- View failed bookings (count badge)
- Process chargebacks (count badge)

**Activity Stream:**
- Real-time feed of admin actions
- "Driver approved by John"
- "Refund processed for booking #123"

---

## Phase 5: Travel Module (OTA)

### A. Bookings Page
**File**: `src/pages/admin/travel/TravelBookingsPage.tsx`

Table columns:
- Booking ID / Order Number
- Customer Name & Email
- Product Type (Flight/Hotel/Car)
- Supplier (Duffel/Aviasales/Hotelbeds)
- Status with color badges
- Amount
- Date
- Actions dropdown

Filters:
- Date range picker
- Status filter (Pending/Confirmed/Cancelled/Refunded)
- Supplier filter
- Search by booking ID or email

### B. Booking Detail Page
**File**: `src/pages/admin/travel/BookingDetailPage.tsx`

Sections:
- **Header**: Booking ID, status badge, quick actions
- **Customer Info**: Name, email, phone, user account link
- **Booking Details**: PNR, confirmation ref, passengers
- **Payment Info**: Amount, payment status, Stripe link
- **Fare Rules**: Cancellation policy, baggage, change fees
- **Timeline**: Booking created, payment processed, confirmed
- **Actions**: Resend email, initiate refund, add note

### C. Refunds Queue
**File**: `src/pages/admin/travel/TravelRefundsPage.tsx`

Workflow states:
1. Requested
2. Supplier Processing
3. Approved
4. Paid to Customer

Table with:
- Original booking link
- Customer info
- Refund amount
- Request reason
- Status progression
- Approve/Deny actions

### D. Suppliers Health Page
**File**: `src/pages/admin/travel/SuppliersStatusPage.tsx`

Cards for each supplier:
- **Duffel**: API status, last successful call, error count
- **Aviasales/TravelPayouts**: Widget status, affiliate tracking
- **Hotelbeds**: API health, booking success rate
- **RateHawk**: Connection status (placeholder)

---

## Phase 6: Driver + Eats Module

### A. Enhanced Driver Hub
**Route**: `/admin/drivers`

Leverages existing `AdminDriverManagement.tsx` with:
- Status filter tabs: All | Pending | Approved | Suspended | Rejected
- Bulk actions: Approve selected, suspend selected
- Enhanced search by name, email, phone, vehicle plate

### B. Driver Profile Detail
**File**: `src/pages/admin/drivers/DriverDetailPage.tsx`

Sections:
- Personal info card
- Vehicle info with photos
- Documents with verification status
- Performance metrics chart
- Earnings history
- Trip history table
- Admin notes/actions log

### C. Documents Review Queue
Enhance existing `AdminDocumentReview.tsx`:
- Queue priority sorting
- SLA countdown timer
- Batch approve/reject
- Rejection reason templates

### D. Jobs (Rides + Deliveries)
**File**: `src/pages/admin/JobsPage.tsx`

Unified view of:
- Ride requests (from `trips` table)
- Food deliveries (from `food_orders` table)

Columns:
- Job ID
- Type (Ride/Delivery)
- Customer
- Driver (assigned or "Unassigned")
- Status
- Payout amount
- Map link

---

## Phase 7: Support Center

### A. Ticket Queue Enhancement
**Route**: `/admin/support`

Improve existing `AdminSupportTickets.tsx`:
- Category filter (Booking/Driver/Eats/Payment)
- Priority sorting (Urgent/High/Normal/Low)
- SLA indicators
- Assign to agent dropdown
- Quick response templates

### B. Ticket Detail Page
**File**: `src/pages/admin/support/TicketDetailPage.tsx`

- Conversation thread (customer + agent messages)
- Internal notes section (staff only)
- Linked booking/trip/order
- Customer profile sidebar
- Action buttons: Resolve, Escalate, Transfer

---

## Phase 8: Payouts (Finance)

### A. Payout Queue
**Route**: `/admin/payouts`

Table with:
- Driver/Partner name
- Amount
- Status: Ready | Processing | Paid | Failed
- Bank method (placeholder)
- Request date
- Paid date

Actions:
- Approve payout (Finance/Admin only)
- Reject with reason
- Bulk process

### B. Payout Processing
Enhance existing `AdminPayoutProcessing.tsx`:
- Weekly payout schedule view
- Instant payout requests
- Failed payout retry queue

---

## Phase 9: Settings (Global Control)

### A. Settings Hub
**File**: `src/pages/admin/settings/SettingsHub.tsx`

Tabs:
1. **Fees & Pricing**
   - Travel service fee % by product
   - Driver commission % by service type
   - Delivery fee rules

2. **Dispatch Rules**
   - Service zones (link to zone management)
   - Peak pricing multipliers (text config)

3. **Risk Settings**
   - Fraud detection thresholds
   - Refund auto-approval limits
   - Cancellation window hours

4. **Branding**
   - Logo upload
   - App name
   - Support email/phone

---

## Phase 10: Database Enhancements

### A. New/Enhanced Tables

**admin_audit_logs** (enhance existing):
```sql
-- Already exists, add more event types
INSERT INTO event examples:
- 'driver_approved'
- 'refund_requested'
- 'payout_sent'
- 'settings_changed'
```

**travel_refund_requests** (if not exists):
```sql
CREATE TABLE travel_refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES travel_bookings(id),
  requested_by uuid REFERENCES auth.users(id),
  amount numeric(10,2) NOT NULL,
  reason text,
  status text DEFAULT 'requested',
  supplier_ref text,
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

### B. Role-Based Access Functions

```sql
-- Function to check multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;
```

---

## Phase 11: Security Requirements

### A. Route Protection Matrix

| Route Pattern | Allowed Roles |
|--------------|---------------|
| `/admin/login` | Public |
| `/admin` (dashboard) | admin, super_admin, operations, finance, support |
| `/admin/travel/*` | admin, operations |
| `/admin/drivers/*` | admin, operations |
| `/admin/support/*` | admin, support |
| `/admin/payouts/*` | admin, finance |
| `/admin/settings/*` | admin, super_admin |
| `/admin/reports/*` | admin, finance |

### B. Audit Logging
Every admin action logs:
- User ID
- Action type
- Target entity (booking, driver, etc.)
- Before/after values (for updates)
- IP address
- Timestamp

---

## Files to Create/Modify

### New Files:
| File | Purpose |
|------|---------|
| `src/pages/admin/AdminLogin.tsx` | Admin login page |
| `src/layouts/AdminLayout.tsx` | Unified admin shell |
| `src/pages/admin/MasterDashboard.tsx` | Master dashboard home |
| `src/pages/admin/travel/TravelBookingsPage.tsx` | Bookings table |
| `src/pages/admin/travel/BookingDetailPage.tsx` | Booking detail |
| `src/pages/admin/travel/TravelRefundsPage.tsx` | Refunds queue |
| `src/pages/admin/travel/SuppliersStatusPage.tsx` | API health |
| `src/pages/admin/drivers/DriverDetailPage.tsx` | Driver profile |
| `src/pages/admin/JobsPage.tsx` | Unified jobs view |
| `src/pages/admin/support/TicketDetailPage.tsx` | Ticket detail |
| `src/pages/admin/settings/SettingsHub.tsx` | Settings sections |
| `src/components/auth/AdminProtectedRoute.tsx` | Role-based protection |
| `src/hooks/useAdminRole.ts` | Role checking hook |

### Modified Files:
| File | Changes |
|------|---------|
| `src/App.tsx` | Add new admin routes |
| `src/contexts/AuthContext.tsx` | Add role checking methods |
| `src/components/admin/AdminRoleManagement.tsx` | Add operations/finance/support roles |

---

## Environment Variables Required

```env
# Already configured:
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY

# For travel suppliers (placeholders):
DUFFEL_API_KEY
HOTELBEDS_API_KEY
RATEHAWK_API_KEY
STRIPE_SECRET_KEY
```

---

## Development Credentials (Dev Only)

For development testing:
1. Create admin user in Supabase Auth
2. Add role via SQL:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'admin');
```

---

## Implementation Order

1. **Phase 1-2**: Admin login + layout (foundation)
2. **Phase 3**: Route structure + protection
3. **Phase 4**: Master dashboard home
4. **Phase 5**: Travel module pages
5. **Phase 6**: Driver + Eats enhancements
6. **Phase 7**: Support center
7. **Phase 8**: Payouts processing
8. **Phase 9**: Settings hub
9. **Phase 10**: Database migrations
10. **Phase 11**: Security hardening + audit
