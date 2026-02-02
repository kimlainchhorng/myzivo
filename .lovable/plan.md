

# Next Update: P2P Receipt Integration + Owner Reviews for Renters

## Overview

The P2P car rental marketplace now has working payment, review, and completion flows. However, two gaps remain in the user experience:

1. **Receipt Download is Non-Functional** - The "Download Receipt" button on P2PBookingConfirmation.tsx does nothing meaningful (just a placeholder)
2. **Owners Cannot Review Renters** - The review system only allows renters to review vehicles/owners, but owners cannot review renters

This update integrates the existing RenterReceipt component and completes the two-way review system.

---

## Current Gap Analysis

| Area | Issue |
|------|-------|
| **P2PBookingConfirmation** | "Download Receipt" button is placeholder |
| **RenterReceipt** | Component exists but not integrated into confirmation flow |
| **Review System** | Only supports renter_to_vehicle and renter_to_owner types |
| **OwnerBookings** | No way for owners to leave reviews for renters |

---

## Phase 1: Integrate Receipt into Booking Confirmation

### 1.1 Add Receipt Modal/Sheet to P2PBookingConfirmation

Wire the "Download Receipt" button to show a sheet/dialog with the RenterReceipt component:

```text
User clicks "Download Receipt"
       |
       v
Show Sheet/Dialog with RenterReceipt
       |
       v
RenterReceipt provides "Print" and "Share" actions
```

Implementation:
- Import `RenterReceipt` component
- Add Sheet or Dialog to wrap the receipt
- Wire button to open the sheet
- Only show for paid/completed bookings

### 1.2 Conditional Receipt Availability

Receipt should only be available when:
- `payment_status === "paid"` or `"captured"`
- OR `status === "completed"`

For pending/unpaid bookings, disable the button with tooltip explaining "Available after payment"

---

## Phase 2: Owner-to-Renter Reviews

### 2.1 Add Owner Review Form to OwnerBookings

For completed bookings in the History tab, allow owners to leave reviews for renters:

```text
+----------------------------------------------------------+
| 2023 Tesla Model 3 - Completed Dec 18                     |
| Renter: John D.                        $255.00 earned     |
|                                                            |
| [Leave Review for Renter]             [View Details]      |
+----------------------------------------------------------+
```

### 2.2 Update ReviewForm for Owner Reviews

The ReviewForm component already handles multiple review types. Add support for:
- `review_type: "owner_to_renter"`
- Different rating categories (communication, vehicle care, timeliness)

### 2.3 Update useCreateReview for Renter Ratings

When owner submits a review:
- Store in `p2p_reviews` with `review_type = "owner_to_renter"`
- Optionally track renter ratings (could add to profiles table later)

---

## Phase 3: Owner Review Dialog in OwnerBookings

### 3.1 Create Review Dialog for Completed Trips

Add a dialog to OwnerBookings.tsx that shows when owner clicks "Leave Review":

```text
+----------------------------------------------------------+
|  Rate Your Renter                                         |
|  John D. rented your Tesla Model 3 (Dec 15-18)            |
|                                                            |
|  Overall Rating: [★★★★★]                                 |
|  Communication: [★★★★★]                                  |
|  Vehicle Care: [★★★★★]                                   |
|  Timeliness: [★★★★★]                                     |
|                                                            |
|  Comment: [                                    ]           |
|                                                            |
|                    [Cancel]  [Submit Review]              |
+----------------------------------------------------------+
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/p2p/P2PBookingConfirmation.tsx` | **Update** | Integrate RenterReceipt with Sheet |
| `src/pages/owner/OwnerBookings.tsx` | **Update** | Add review CTA and dialog for completed trips |
| `src/components/p2p/ReviewForm.tsx` | **Update** | Add owner_to_renter review type support |
| `src/hooks/useP2PReview.ts` | **Update** | Add support for renter review queries |

---

## Technical Implementation Details

### Receipt Integration

```text
P2PBookingConfirmation.tsx:
├── Import Sheet, SheetContent, SheetTrigger from "@/components/ui/sheet"
├── Import RenterReceipt from "@/components/p2p/RenterReceipt"
├── Wrap "Download Receipt" button in SheetTrigger
├── Show RenterReceipt inside SheetContent
└── Disable if payment_status !== "paid"/"captured" and status !== "completed"
```

### Owner Review Form Categories

For `owner_to_renter` review type:
- **Overall Rating** (1-5 stars) - Required
- **Communication** (1-5 stars) - How responsive was the renter
- **Vehicle Care** (1-5 stars) - How well they treated the vehicle
- **Timeliness** (1-5 stars) - Were they on time for pickup/return
- **Comment** (text) - Optional

---

## User Flow After Implementation

### Renter Receipt Download Journey
1. Renter completes payment for P2P booking
2. Navigates to booking confirmation page
3. Clicks "Download Receipt"
4. Sheet opens showing formatted receipt
5. Can print or share the receipt

### Owner Review Journey
1. Trip completes successfully
2. Owner views completed booking in History tab
3. Sees "Leave Review" button on booking card
4. Clicks to open review dialog
5. Rates renter on communication, care, timeliness
6. Submits review
7. Review stored for future reference

---

## Testing Checklist

1. Create test booking with "paid" status
2. Navigate to booking confirmation
3. Click "Download Receipt" - Verify sheet opens with formatted receipt
4. Print receipt - Verify browser print dialog opens
5. Test receipt for unpaid booking - Button should be disabled
6. Navigate to Owner Bookings > History
7. Click "Leave Review" on completed booking
8. Submit review - Verify toast and review saved
9. Check that review badge updates on booking card

---

## Design Considerations

### Receipt Sheet
- Use Sheet component for mobile-friendly slide-up
- Full-screen on mobile, side panel on desktop
- Include all booking details and payment breakdown

### Owner Review Dialog
- Centered modal dialog
- Show renter name and trip summary at top
- Rating inputs for each category
- Optional text comment
- Loading state during submission

### Review Status Badges
- "Reviewed" badge on completed trips where owner left review
- "Leave Review" prompt on unreviewed completed trips

