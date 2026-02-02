

# ZIVO Website + Web App Finalization Plan

## Executive Summary
This plan consolidates and aligns the existing ZIVO platform into a unified, production-ready system with proper role-based access control, clear route organization, and beta/launch controls.

---

## Phase 1: Public Website Routes

### 1.1 Create `/cars` Route (Public Vehicle Browse)
- Add new route `/cars` that renders a public-facing vehicle search page
- Reuse existing `P2PVehicleSearch` component with modifications:
  - Remove login-required features
  - "Book Now" buttons redirect to login if not authenticated
  - SEO-optimized metadata

### 1.2 Create `/rent` Route (How It Works for Renters)
- New marketing page explaining the rental process for renters
- Sections: How to rent, verification process, insurance coverage, pricing transparency
- CTAs redirect to login/signup with redirect state to `/renter/dashboard`

### 1.3 Add Missing Website Routes
Routes to add (all public, no login required):
```text
/cars              → Public vehicle browse
/rent              → How renting works (for renters)
/list-your-car     → Already exists ✓
/insurance         → Already exists ✓
/terms/renter      → Already exists ✓
/terms/owner       → Already exists ✓
/damage-policy     → Already exists ✓
```

---

## Phase 2: Renter Web App Routes

### 2.1 Create Renter Dashboard Structure
New routes (all protected, require authentication):
```text
/renter/dashboard      → Main renter dashboard (bookings summary, verification status)
/renter/bookings       → Full booking history (reuse RenterTrips logic)
/renter/verification   → Redirect to /verify/driver
```

### 2.2 Renter Dashboard Page
Create `src/pages/renter/RenterDashboard.tsx`:
- Show verification status banner prominently if not verified
- Quick stats: upcoming trips, past trips, saved cars
- CTA to search cars or complete verification
- Navigation to bookings and verification

### 2.3 Renter Bookings Page
Create `src/pages/renter/RenterBookings.tsx`:
- Full booking management (extract logic from RenterTrips)
- Filter by status (upcoming, active, past)
- Booking details with vehicle/owner info

### 2.4 Verification Gate Logic
Update booking flow (`P2PVehicleDetail`, `P2PBookingConfirmation`):
- Check `useIsRenterVerified()` before allowing booking
- Show "Complete Verification First" banner with link to `/verify/driver`
- Block booking confirmation if not verified

---

## Phase 3: Owner Web App Enhancement

### 3.1 Owner Routes (Already Exist - Minor Cleanup)
Current routes are correct:
```text
/owner/dashboard     → OwnerDashboard ✓
/owner/cars          → OwnerCars ✓
/owner/bookings      → OwnerBookings ✓
/owner/payouts       → OwnerPayouts ✓
```

### 3.2 Add Missing Owner Earnings Route
Create `/owner/earnings` route:
- Either create new `OwnerEarnings.tsx` or redirect to `/owner/payouts`
- Show earnings breakdown, commission deductions, payout history

### 3.3 Owner Status Gate
Enhance `OwnerDashboard` and owner routes:
- Already shows pending/rejected status ✓
- Block vehicle creation until verified ✓
- Add Stripe Connect requirement check before payout release

---

## Phase 4: Admin Web App Routes

### 4.1 Admin Route Mapping
Current admin structure uses tabs in a single `/admin` route. For clarity, add dedicated URL routes:

```text
/admin                    → AdminDashboard (existing) ✓
/admin/owners             → Navigate to P2P Owners tab
/admin/renters            → Navigate to Renters tab
/admin/cars               → Navigate to P2P Vehicles tab
/admin/bookings           → Navigate to P2P Bookings tab
/admin/payouts            → Navigate to P2P Payouts tab
/admin/disputes           → Navigate to P2P Disputes tab
/admin/launch-checklist   → Navigate to City Launch tab
```

### 4.2 Admin Deep Link Navigation
Update `AdminDashboard.tsx` to:
- Parse URL params to auto-select correct tab on load
- Add URL sync when switching tabs (optional for UX)

---

## Phase 5: Role-Based Route Protection

### 5.1 Enhance ProtectedRoute Component
Extend `ProtectedRoute.tsx` to support role-based access:

```tsx
type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireOwner?: boolean;    // New: verified car owner
  requireRenter?: boolean;   // New: any authenticated user (renter default)
  allowAny?: boolean;        // New: any logged-in user
};
```

### 5.2 Create Role Verification Hooks
Extend `useUserAccess.ts` to include P2P roles:
- `isVerifiedOwner`: Has verified `car_owner_profiles` entry
- `isVerifiedRenter`: Has approved `renter_profiles` entry
- Use existing `is_verified_car_owner()` and `is_verified_renter()` DB functions

### 5.3 Apply Route Protection

```tsx
// Owner routes - require verified owner
<Route path="/owner/dashboard" element={
  <ProtectedRoute requireOwner>
    <OwnerDashboard />
  </ProtectedRoute>
} />

// Renter routes - require authentication (verification checked within pages)
<Route path="/renter/dashboard" element={
  <ProtectedRoute>
    <RenterDashboard />
  </ProtectedRoute>
} />

// Admin routes - require admin role (already implemented) ✓
```

---

## Phase 6: Auth Flow & Role-Based Redirect

### 6.1 Post-Login Redirect Logic
Update `AuthCallback.tsx` and login success handlers:

```tsx
// After successful login:
const { isAdmin, isVerifiedOwner, isVerifiedRenter } = useUserAccess(user.id);

if (isAdmin) {
  navigate("/admin");
} else if (isVerifiedOwner) {
  navigate("/owner/dashboard");
} else if (isVerifiedRenter) {
  navigate("/renter/dashboard");
} else {
  navigate("/"); // Default to home for new users
}
```

### 6.2 Preserve Intended Destination
Keep existing `location.state.from` logic so users return to their intended page after login.

---

## Phase 7: Global UI & Environment Badge

### 7.1 Beta Badge Component
Create `BetaEnvironmentBadge.tsx`:
- Fetch `useP2PBetaSettings()`
- If `betaMode === true`, show "Private Beta" badge in header
- Consistent styling across website and web app

### 7.2 Apply Badge to Headers
- Add to `Header.tsx` (website)
- Add to Owner dashboard header
- Add to Renter dashboard header (when created)

### 7.3 Consistent Layout
- Public website: `Header` + content + `Footer` ✓
- Web app dashboards: Custom header (with back nav) + content + no footer (app-style)

---

## Phase 8: Launch Readiness Controls

### 8.1 City-Based Launch Control
Leverage existing `p2p_launch_cities` table:
- Vehicles have `location_city` and `location_state`
- Only show vehicles in "live" launch cities in search results
- Block bookings for vehicles in non-live cities

### 8.2 Renter Beta Gate
Enhance `P2PVehicleSearch` and `P2PVehicleDetail`:

```tsx
const { data: betaSettings } = useRenterBetaSettings();

if (betaSettings?.betaMode) {
  // Check if user is on waitlist or has beta access
  // If not, redirect to /beta/waitlist
}
```

### 8.3 Waitlist Integration
Current waitlist flow exists at `/beta/waitlist` ✓
- Add admin control to grant beta access to specific users
- Check `renter_waitlist` table for approved entries

---

## Files to Create

| File | Description |
|------|-------------|
| `src/pages/Cars.tsx` | Public vehicle browse (wrapper for P2PVehicleSearch) |
| `src/pages/HowToRent.tsx` | Marketing page for renter education |
| `src/pages/renter/RenterDashboard.tsx` | Main renter dashboard |
| `src/pages/renter/RenterBookings.tsx` | Full booking management |
| `src/pages/owner/OwnerEarnings.tsx` | Earnings breakdown page |
| `src/components/shared/BetaBadge.tsx` | Environment indicator component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add new routes, update protection |
| `src/components/auth/ProtectedRoute.tsx` | Add owner/renter role checks |
| `src/hooks/useUserAccess.ts` | Add P2P role detection |
| `src/pages/AuthCallback.tsx` | Add role-based redirect |
| `src/components/Header.tsx` | Add beta badge |
| `src/pages/p2p/P2PVehicleDetail.tsx` | Add verification gate |
| `src/pages/admin/AdminDashboard.tsx` | Add URL-based tab navigation |

---

## Technical Notes

### Role Hierarchy
```text
Admin → Full access, can override all
Owner → Access to owner portal (requires verified status for actions)
Renter → Access to renter portal, booking requires verification
Guest → Public pages only
```

### Existing Database Functions to Use
- `is_admin(user_uuid)` - Check admin role
- `is_verified_car_owner(user_uuid)` - Check verified owner
- `is_verified_renter(user_uuid)` - Check verified renter

### Security Considerations
- All role checks happen server-side via RLS policies
- Client-side checks are for UX only (show/hide UI)
- Never trust client role state for authorization

---

## Testing Checklist

After implementation:
1. Guest can browse `/cars` and `/rent` without login
2. Login redirects to appropriate dashboard based on role
3. Owner cannot access renter dashboard and vice versa
4. Admin can access all areas
5. Beta badge shows when beta mode is enabled
6. Bookings blocked for non-verified renters
7. Vehicles only show in live cities
8. Waitlist page appears when renter beta mode is on

