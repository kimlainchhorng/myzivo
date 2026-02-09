

# Ratings and Reviews — Wire Up Existing Infrastructure

## Overview

All the building blocks already exist but are disconnected:
- **`RatingModal`** (`src/components/eats/RatingModal.tsx`): Full UI with overall, food, and delivery ratings plus optional comment -- never imported anywhere
- **`useEatsReviews` hook**: CRUD operations for `eats_reviews` table -- never used from order pages
- **`eats_reviews` table**: Exists in Supabase with columns for rating, food_rating, delivery_rating, comment
- **`useOrderReview` hook**: Checks if an order has been reviewed -- never used

This plan wires everything together so the rating modal appears after delivery and past ratings show in order history.

## What Changes

### 1. Show RatingModal on order detail page after delivery

Update `EatsOrderDetail.tsx` to:
- Import `RatingModal` and `useOrderReview`
- Auto-open the modal when order status is `delivered` and no review exists yet
- Add a "Rate this order" button for delivered orders that haven't been rated
- Show a "Rated" badge for orders that have already been reviewed

### 2. Show past ratings in order history

Update `EatsOrders.tsx` to:
- For delivered orders, show star rating inline if a review exists
- Query reviews for the user's delivered orders using `useEatsReviews`

### 3. Show rating on individual order detail (already delivered)

On the order detail page for a delivered order that has been rated:
- Display the submitted rating (overall, food, delivery) and comment in a read-only summary card below the order details

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/pages/EatsOrderDetail.tsx` | Update | Import RatingModal, auto-trigger on delivery, add Rate button, show rating summary |
| `src/pages/EatsOrders.tsx` | Update | Show star rating inline for reviewed orders |
| `src/hooks/useEatsReviews.ts` | Update | Add hook to batch-fetch reviews for multiple order IDs |

## Technical Details

### Auto-trigger rating modal

In `EatsOrderDetail.tsx`, add state and effect:

```text
const [showRating, setShowRating] = useState(false);
const { data: existingReview } = useOrderReview(order?.id);

useEffect:
  if order.status === 'delivered' && existingReview === null (loaded, not found)
    delay 1.5s then setShowRating(true)
```

This gives the delivered status animation time to play before the modal appears. The modal is skippable.

### "Rate this order" button for delivered orders

Below the "Order Again" button for delivered orders, add a "Rate Order" button that opens the modal -- only if no review exists yet. If already reviewed, show the rating inline instead.

### Rating summary card

For delivered orders with an existing review, render a read-only card showing:
- Overall stars
- Food quality stars (if provided)
- Delivery experience stars (if provided)
- Written comment (if provided)

Uses the existing `StarRating` component in disabled/read-only mode.

### Order history inline ratings

In `EatsOrders.tsx`, add a new hook `useMyOrderReviews` to `useEatsReviews.ts` that fetches all reviews for the logged-in user. Then for each delivered order card, if a review exists, show a small star icon with the rating number next to the status badge.

```text
New hook: useMyOrderReviews()
  Query: eats_reviews WHERE user_id = auth.uid()
  Returns: Map<orderId, EatsReview>

In order card:
  If review exists for this order:
    Show star icon + rating (e.g., "4.0") next to Delivered badge
```

### Edge cases

- Modal only auto-opens once per page visit (guarded by state)
- If user navigates away and comes back, modal triggers again if still unrated (acceptable UX for encouraging reviews)
- Skip button simply closes the modal without submitting
- Review cannot be submitted twice (useCreateEatsReview will fail on duplicate order_id due to DB constraint)
- Orders with status other than "delivered" never show the rating modal or button
