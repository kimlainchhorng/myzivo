
# Next Update: P2P Marketplace Discovery + Admin Overview Integration

## Overview

The P2P car rental marketplace infrastructure is complete with test data tools, but it's **hidden from users**. This update integrates P2P rentals into the main user experience and admin dashboard, making the marketplace discoverable while adding key stats to admin overview.

---

## Current Gap Analysis

| Area | Issue |
|------|-------|
| **Homepage** | P2P not mentioned - only shows traditional car rentals |
| **Mobile App Home** | Quick actions link to `/rent-car` (traditional), not P2P |
| **Admin Overview** | No P2P stats (owners, vehicles, bookings) |
| **Navigation** | No "Rent from Owners" option anywhere |
| **ExtrasSection** | Lists services but missing P2P |

---

## Phase 1: Admin Overview P2P Stats Integration

### Add P2P Stats Cards to AdminOverview.tsx

New stats row showing:
- Total P2P Owners (pending/verified)
- Total P2P Vehicles (pending/approved)  
- Total P2P Bookings (pending/active/completed)
- P2P Revenue (sum of platform_fee from bookings)

```text
+---------------------+  +---------------------+  +---------------------+
| 👤 P2P Owners       |  | 🚗 P2P Vehicles     |  | 📅 P2P Bookings     |
|   3 verified        |  |   8 approved        |  |   12 total          |
|   1 pending         |  |   2 pending review  |  |   2 active          |
+---------------------+  +---------------------+  +---------------------+
```

### Add P2P Activity to Recent Activity Feed

Include P2P bookings alongside rides and eats in the combined activity feed.

---

## Phase 2: Homepage P2P Discovery

### 2.1 Add P2P Card to ExtrasSection

Add a card for "Rent from Local Owners" in the ExtrasSection component:

```text
Card Details:
- Title: "Rent from Local Owners"
- Description: "Skip the rental counter. Book unique cars directly from people in your area."
- Icon: CarFront with UserCircle overlay
- Link: /p2p/search
- Badge: "NEW" or "P2P"
```

### 2.2 Update PrimaryServicesSection Car Rental Card

Modify the Car Rentals card to include a secondary CTA for P2P:

```text
Current: "Find Rental Cars" → /rent-car
Add: "Or rent from local owners →" link to /p2p/search
```

---

## Phase 3: Mobile App Home P2P Integration

### 3.1 Add P2P Quick Action

Replace or add to quick actions grid in AppHome.tsx:

Option A: Replace "Extras" with "P2P Cars"
Option B: Add 4th row with P2P card

```text
{ id: "p2p", label: "P2P Cars", icon: CarFront, href: "/p2p/search", color: "bg-primary" }
```

### 3.2 Add P2P Section Below Featured Restaurants

New section: "Rent from Local Owners"
- Horizontal scroll of featured P2P vehicles (if any exist)
- CTA: "Browse all →" linking to /p2p/search
- Empty state: "Be the first to list your car" → /list-your-car

---

## Phase 4: Create useAdminP2PStats Hook

New hook for admin P2P statistics:

```typescript
export function useAdminP2PStats() {
  return useQuery({
    queryKey: ["adminP2PStats"],
    queryFn: async () => {
      // Count owners by status
      const { count: totalOwners } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true });
      
      const { count: pendingOwners } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      // Count vehicles by approval status
      const { count: totalVehicles } = await supabase
        .from("p2p_vehicles")
        .select("*", { count: "exact", head: true });
      
      const { count: approvedVehicles } = await supabase
        .from("p2p_vehicles")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "approved");
      
      // Count bookings
      const { count: totalBookings } = await supabase
        .from("p2p_bookings")
        .select("*", { count: "exact", head: true });
      
      const { count: activeBookings } = await supabase
        .from("p2p_bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      return {
        owners: { total: totalOwners || 0, pending: pendingOwners || 0 },
        vehicles: { total: totalVehicles || 0, approved: approvedVehicles || 0 },
        bookings: { total: totalBookings || 0, active: activeBookings || 0 },
      };
    },
  });
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useAdminP2PStats.ts` | **Create** | New hook for P2P statistics |
| `src/pages/admin/modules/AdminOverview.tsx` | **Update** | Add P2P stats cards and activity |
| `src/components/home/ExtrasSection.tsx` | **Update** | Add P2P card |
| `src/components/home/PrimaryServicesSection.tsx` | **Update** | Add P2P link under Car Rentals |
| `src/pages/app/AppHome.tsx` | **Update** | Add P2P section for mobile |

---

## User Flow After Implementation

### Desktop User Journey
1. User lands on homepage
2. Sees Car Rentals card with "Or rent from local owners" link
3. Clicks to browse `/p2p/search`
4. Views available vehicles from verified owners
5. Books directly from owner

### Mobile User Journey  
1. User opens app on mobile
2. Sees P2P section below quick actions
3. Browses featured P2P vehicles
4. Taps to view details and book

### Admin Journey
1. Admin opens dashboard
2. Sees P2P stats alongside Rides/Eats/Clicks
3. Can quickly see pending owners/vehicles needing review
4. Clicks to navigate to respective P2P modules

---

## Design Considerations

### P2P Branding
- Use primary color for P2P elements
- Badge: "P2P" or "From Owners"
- Icon: Car with user indicator

### Empty State Handling
When no P2P vehicles exist, show:
- "No cars available yet"
- CTA: "List your car and be the first to earn"
- Link to /list-your-car

---

## Testing Checklist

1. Create test owner via admin → Verify stats update
2. Create test vehicle via admin → Verify appears in P2P search
3. Create test booking via admin → Verify in admin overview activity
4. Mobile: Verify P2P section renders correctly
5. Desktop: Verify ExtrasSection shows P2P card
6. Click all P2P navigation links → Verify correct routing
