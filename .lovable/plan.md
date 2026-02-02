

# Next Update: P2P Dispute Integration + Owner Activity Feed

## Overview

The P2P car rental marketplace has mature booking, payment, review, and completion flows. However, two important features remain incomplete:

1. **Dispute Form is Orphaned** - The `DisputeForm` component exists in `/components/p2p/DisputeForm.tsx` but is not integrated into any user-facing page
2. **Owner Dashboard Activity Feed** - Shows a placeholder "Activity feed coming soon..." instead of real booking/earnings activity

This update integrates the dispute system into the renter journey and provides owners with a real-time activity feed on their dashboard.

---

## Current Gap Analysis

| Area | Issue |
|------|-------|
| **P2PBookingConfirmation** | No way for renters to report issues |
| **CompletedBookingSection** | Missing dispute option for problem trips |
| **OwnerDashboard** | Activity section is placeholder-only |
| **DisputeForm** | Component exists but imported nowhere |

---

## Phase 1: Integrate Dispute Form into Booking Confirmation

### 1.1 Add "Report an Issue" Button to P2PBookingConfirmation

For active, completed, or paid bookings, add the DisputeForm trigger:

```text
+----------------------------------------------------------+
|  Need Help?                                               |
|  [Report an Issue]  [Download Receipt]  [View All Trips] |
+----------------------------------------------------------+
```

Location: Add to the actions section at the bottom of the confirmation page.

### 1.2 Add Dispute Option to CompletedBookingSection

After the review forms, add a subtle dispute option for problem trips:

```text
+----------------------------------------------------------+
|  Had a problem?                                           |
|  [Report an Issue] if something went wrong during your   |
|  trip.                                                    |
+----------------------------------------------------------+
```

### 1.3 Conditional Display Rules

Show DisputeForm button when:
- `booking.status` is "active", "completed", or 
- `booking.payment_status` is "captured" or "paid"

Hide for pending/cancelled bookings that haven't progressed.

---

## Phase 2: Owner Dashboard Activity Feed

### 2.1 Create useOwnerActivity Hook

New hook to fetch recent owner activity:

```text
useOwnerActivity(ownerId):
├── Fetch last 10 bookings (any status)
├── Fetch last 5 payouts
├── Merge and sort by date
└── Return unified activity items
```

Activity item types:
- **Booking Request** - New booking came in
- **Booking Confirmed** - You confirmed a booking
- **Trip Started** - Renter picked up vehicle
- **Trip Completed** - Trip finished
- **Payment Received** - Payout deposited
- **Review Received** - Renter left a review

### 2.2 Create OwnerActivityFeed Component

Replace the placeholder in OwnerDashboard with a real activity feed:

```text
+----------------------------------------------------------+
|  Recent Activity                                          |
+----------------------------------------------------------+
|  📅 Today                                                 |
|  ✓ Trip completed - 2023 Tesla Model 3           2h ago  |
|  💰 Payout deposited - $245.00                   5h ago  |
+----------------------------------------------------------+
|  📅 Yesterday                                             |
|  ⭐ New review received - 5 stars               18h ago  |
|  📋 Booking confirmed - Honda Accord            22h ago  |
+----------------------------------------------------------+
```

### 2.3 Activity Item Icons and Colors

| Type | Icon | Color |
|------|------|-------|
| booking_request | Calendar | Amber |
| booking_confirmed | CheckCircle | Emerald |
| trip_started | Car | Blue |
| trip_completed | CheckCircle | Emerald |
| payout | DollarSign | Green |
| review | Star | Amber |

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/p2p/P2PBookingConfirmation.tsx` | **Update** | Add DisputeForm integration |
| `src/components/p2p/CompletedBookingSection.tsx` | **Update** | Add dispute CTA for problem trips |
| `src/hooks/useOwnerActivity.ts` | **Create** | Hook to fetch owner activity |
| `src/components/owner/OwnerActivityFeed.tsx` | **Create** | Activity feed component |
| `src/pages/owner/OwnerDashboard.tsx` | **Update** | Replace placeholder with real feed |

---

## Technical Implementation Details

### Owner Activity Hook

```text
useOwnerActivity(ownerId):
1. Query p2p_bookings where owner_id matches
   - Select: id, status, created_at, vehicle info, renter_id
   - Order by created_at DESC
   - Limit 10
2. Query p2p_payouts where owner_id matches
   - Select: id, amount, status, processed_at
   - Order by created_at DESC
   - Limit 5
3. Query p2p_reviews where reviewee_id = ownerId
   - Select: id, rating, created_at
   - Order by created_at DESC
   - Limit 5
4. Transform into activity items with type, description, timestamp
5. Sort combined list by timestamp DESC
```

### Activity Item Interface

```text
interface OwnerActivityItem {
  id: string;
  type: 'booking_request' | 'booking_confirmed' | 'trip_started' | 
        'trip_completed' | 'payout' | 'review';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    vehicleName?: string;
    amount?: number;
    rating?: number;
  };
}
```

---

## User Flows After Implementation

### Renter Dispute Journey
1. Renter completes trip or is in an active rental
2. Experiences an issue (damage, cleanliness, billing)
3. Opens booking confirmation page
4. Clicks "Report an Issue"
5. Selects issue type and describes problem
6. Submits dispute
7. Receives confirmation and waits for support response

### Owner Activity Feed Journey
1. Owner logs into dashboard
2. Sees "Recent Activity" section with real data
3. Views recent bookings, payouts, and reviews at a glance
4. Clicks on activity item to navigate to relevant page

---

## Testing Checklist

1. Navigate to booking confirmation for active booking
2. Click "Report an Issue" - Verify DisputeForm dialog opens
3. Submit a dispute - Verify success toast
4. Check that button disables after dispute is filed
5. Navigate to completed booking confirmation
6. Verify dispute option appears in CompletedBookingSection
7. Log in as verified owner with bookings
8. Navigate to OwnerDashboard
9. Verify activity feed shows real booking data
10. Click activity item - Verify navigation works

---

## Design Considerations

### Dispute Button Placement
- Subtle but visible - use outline variant with warning color
- Position in actions section, not as primary action
- Show "Dispute in Progress" badge if one exists

### Activity Feed Design
- Group by date (Today, Yesterday, This Week, Earlier)
- Icon + title + timestamp for each item
- Clickable items that navigate to relevant pages
- Empty state if no activity yet

### Mobile Responsiveness
- Activity feed scrollable with max height
- Dispute form dialog works well on mobile
- Touch-friendly tap targets

