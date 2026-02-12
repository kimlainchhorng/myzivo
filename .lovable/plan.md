

# Passenger Verification and Trust Score Enhancement

## What Already Exists (No Changes Needed)

The project already has extensive infrastructure covering most of the requested features:

- **Account verification**: Phone OTP, email verification, identity document upload with selfie (VerificationPage at `/account/verification`)
- **Trust score calculation**: `useAccountTrustLevel` hook with 8 signals (email, phone, identity, account age, orders, profile completeness)
- **Trust level display**: `TrustLevelPage` at `/account/trust` with score breakdown, benefits, and improvement suggestions
- **Trust level card**: `TrustLevelCard` on mobile account page showing score and tier
- **Fraud detection**: `check-fraud-signals` edge function detecting refund abuse, cancellation spikes, velocity spikes, wrong PIN attempts
- **Admin user management**: Full admin panel with user profiles, activity timelines, status management
- **Privacy controls**: DSAR/GDPR-compliant privacy page at `/account/privacy`
- **Driver rates passenger**: `RatePassengerModal` saving `rider_rating` to trips table

## What's Being Added

### 1. Rename Trust Tiers to Rider-Specific Labels

Update `src/config/trustLevel.ts` to use rider-friendly tier names:
- "Needs Attention" (0-29) becomes **"New"**
- "Good" (30-64) becomes **"Verified"**
- "Excellent" (65-84) becomes **"Trusted"**
- Add a new tier: **"Top Rider"** (85-100)

Add two new trust signals:
- `low_cancellation_rate`: "Low cancellation rate" (weight 5) -- earned when cancellation rate is below 15%
- `good_rider_rating`: "Good passenger rating" (weight 5) -- earned when average rider_rating >= 4.0

### 2. Update Trust Score Calculation

Update `src/hooks/useAccountTrustLevel.ts` to:
- Query `trips` table for cancellation rate (cancelled vs total trips)
- Query `trips` table for average `rider_rating` (from driver feedback)
- Include these two new signals in the earned map

### 3. Passenger Trust Badge for Drivers

Create `src/components/driver/PassengerTrustBadge.tsx`:
- A compact badge component showing the rider's trust tier icon, label, verification status, and average rating
- Displayed when a driver receives a ride request or views the active trip
- Fetches rider profile data (trust signals) using the rider_id from the trip

Create `src/hooks/usePassengerTrust.ts`:
- Given a `riderId`, queries profiles and trips to compute trust score for that rider
- Returns tier label, verification badges (email, phone, identity), avg rider rating, total trips

Integrate into `src/pages/ride/RideDriverPage.tsx`:
- Show `PassengerTrustBadge` in the pickup information card

### 4. Admin Trust Distribution Panel

Create `src/components/admin/AdminTrustDistribution.tsx`:
- Summary cards: count of users per trust tier (New, Verified, Trusted, Top Rider)
- Flagged users list (from `user_limits` where `is_blocked = true` or `risk_events` in last 7 days)
- Trust score distribution bar chart

Add as a new section in `AdminUserManagement.tsx` or as an additional tab in the admin dashboard.

### 5. Verification Status Notifications

Update `src/hooks/useCustomerVerification.ts`:
- After `submitMutation` success, show toast "Verification submitted -- you'll be notified when reviewed"
- Add a realtime subscription on `customer_identity_verifications` for changes to `status` field
- When status changes to "verified", show success toast "Your identity is now verified! Trust score updated."
- When status changes to "rejected", show warning toast with rejection reason

## Files Changed

| File | Change |
|------|--------|
| `src/config/trustLevel.ts` | Add "Top Rider" tier, rename tiers, add 2 new signals |
| `src/hooks/useAccountTrustLevel.ts` | Query cancellation rate and avg rider_rating, include new signals |
| `src/components/driver/PassengerTrustBadge.tsx` | New: compact rider trust badge for drivers |
| `src/hooks/usePassengerTrust.ts` | New: fetch and compute trust for a given rider |
| `src/pages/ride/RideDriverPage.tsx` | Show PassengerTrustBadge in pickup card |
| `src/components/admin/AdminTrustDistribution.tsx` | New: trust tier distribution and flagged users panel |
| `src/pages/AdminDashboard.tsx` | Add trust distribution tab |
| `src/hooks/useCustomerVerification.ts` | Add realtime subscription for verification status notifications |
| `src/components/account/TrustLevelCard.tsx` | Update color map for new "Top Rider" tier |
| `src/pages/account/TrustLevelPage.tsx` | Update color map for new tier |

## Technical Notes

- Trust tiers will use 4 levels instead of 3, with adjusted score thresholds (0-29, 30-64, 65-84, 85-100)
- Cancellation rate calculated as: cancelled trips / total trips (only counted if user has 3+ trips to avoid penalizing new users)
- Average rider_rating only included if the rider has been rated on 2+ trips
- PassengerTrustBadge is read-only and fetches data server-side via Supabase with RLS (driver can only see limited passenger profile data)
- No new database tables needed -- all data sources already exist (profiles, trips, customer_identity_verifications, risk_events, user_limits)

