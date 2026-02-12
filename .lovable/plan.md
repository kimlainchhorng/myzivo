

# Driver Ratings and Passenger Feedback System

## What Already Exists

The project has significant rating infrastructure already built:

- **Customer rates driver (rides)**: Star rating in `RideReceiptModal` saves to `trips.rating` and `trips.feedback`
- **Customer rates driver + restaurant (food)**: Full rating page at `/rate/:code` with stars, tags, comments, contact-back
- **Admin quality dashboard**: `DispatchQuality` page with KPIs, worst performers, low ratings, distribution charts (reads from `order_ratings` table)
- **Customer reviews page**: `MyReviewsPage` at `/account/reviews` shows past food order ratings
- **Reusable components**: `StarRating`, `TagSelector`, `TripRatingWidget`

## What's Missing

1. **Driver rates passenger** -- No database column, no UI
2. **Post-ride rating with feedback categories** -- Current ride rating is basic (stars + free text). No structured categories like "driving quality", "cleanliness", "friendliness", "navigation"
3. **Driver's own rating dashboard** -- Drivers can't see their avg rating, trends, or feedback
4. **Low-rating alerts for drivers** -- No notification when rating drops
5. **Ride ratings in unified quality dashboard** -- Admin quality dashboard only reads `order_ratings` (food), not `trips` ratings

## Plan

### 1. Database Changes

Add columns to the `trips` table:
- `rider_rating` (integer, 1-5) -- driver's rating of the passenger
- `rider_feedback` (text) -- driver's comment about the passenger
- `rating_categories` (jsonb) -- structured categories for customer's driver rating (e.g., `{ driving: 4, cleanliness: 5, friendliness: 5, navigation: 3 }`)
- `rating_tags` (text array) -- feedback tags similar to food order ratings

### 2. Post-Ride Rating Enhancement (Customer Side)

Update `RideReceiptModal.tsx` to add feedback category chips after the star rating:
- **Driving Quality** (1-5 mini stars or thumbs)
- **Cleanliness** (1-5)
- **Friendliness** (1-5)
- **Navigation** (1-5)
- Feedback tags: "Great conversation", "Smooth ride", "Clean car", "Late arrival", "Unsafe driving", "Rude behavior"
- Keep the existing overall star rating as primary

Update `saveRideRating` in `supabaseRide.ts` to save the new category and tag fields.

### 3. Driver Rates Passenger (New UI)

Create `src/components/driver/RatePassengerModal.tsx`:
- Appears after trip completion in the driver app
- Star rating (1-5) for the passenger
- Quick feedback chips: "Punctual", "Respectful", "Good directions", "Late to pickup", "No-show", "Incorrect address", "Rude"
- Optional comment field (max 200 chars)
- Saves to `trips.rider_rating` and `trips.rider_feedback`

Create `src/hooks/useRatePassenger.ts`:
- Mutation to update `trips.rider_rating` and `trips.rider_feedback`
- Only allowed for completed trips where `driver_id` matches current user

Integrate into `RideDriverPage.tsx` -- show the modal after trip reaches "completed" status.

### 4. Driver Rating Dashboard

Create `src/components/driver/DriverRatingDashboard.tsx`:
- Summary card: Average rating, total rated trips, rating trend (up/down arrow)
- Star distribution bar chart (how many 1-star, 2-star, etc.)
- Recent feedback list (last 10 comments from passengers)
- Category averages (driving, cleanliness, friendliness, navigation)

Create `src/hooks/useDriverRatings.ts`:
- Fetches trips where `driver_id` matches, aggregates ratings
- Calculates 7-day and 30-day trends
- Returns category breakdowns from `rating_categories` jsonb

Add a "My Ratings" card to `DriverHomePage.tsx` showing avg rating and quick link, and a full section in `DriverAccountPage.tsx`.

### 5. Low-Rating Detection and Driver Notifications

Create `src/hooks/useDriverRatingAlerts.ts`:
- Subscribes to realtime changes on `trips` table filtered by driver_id
- When a new rating arrives that is 2 stars or below, shows a toast notification
- When 7-day average drops below 4.0, shows a warning banner on DriverHomePage
- When positive feedback is received (5 stars), shows a congratulatory toast

Add a rating alert banner component to `DriverHomePage.tsx` that shows when avg rating is declining.

### 6. Admin Dashboard Enhancement

Update `useQualityMetrics.ts` to also query `trips` table ratings alongside `order_ratings`, giving the admin a unified view of both ride and food delivery quality.

Add a "Rides" tab to `DispatchQuality.tsx` showing ride-specific rating metrics.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/supabaseRide.ts` | Extend `SaveRatingPayload` with categories, tags; add `savePassengerRating` function |
| `src/components/ride/RideReceiptModal.tsx` | Add feedback category chips and tags after star rating |
| `src/components/driver/RatePassengerModal.tsx` | New: driver rates passenger modal |
| `src/hooks/useRatePassenger.ts` | New: mutation hook for driver rating passenger |
| `src/components/driver/DriverRatingDashboard.tsx` | New: driver's own rating stats and trends |
| `src/hooks/useDriverRatings.ts` | New: fetch and aggregate driver's own ratings |
| `src/hooks/useDriverRatingAlerts.ts` | New: realtime low-rating detection and toasts |
| `src/pages/driver/DriverHomePage.tsx` | Add rating summary card and alert banner |
| `src/pages/driver/DriverAccountPage.tsx` | Add full rating dashboard section |
| `src/hooks/useQualityMetrics.ts` | Include `trips` ratings in admin quality metrics |
| `src/pages/dispatch/DispatchQuality.tsx` | Add "Rides" tab for ride-specific quality data |

## Technical Notes

- New `trips` columns (`rider_rating`, `rider_feedback`, `rating_categories`, `rating_tags`) will be added via SQL migration
- `rating_categories` uses JSONB for flexible category storage without schema changes if categories evolve
- Driver can only rate a passenger on trips where they are the assigned driver (enforced in the mutation)
- Rating is only allowed after trip status is "completed" (enforced both in UI and query filter)
- No editing of ratings after submission (one-time write, enforced by checking if `rating` or `rider_rating` is already set)
- All new components follow the verdant theme with existing design system tokens

