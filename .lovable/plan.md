
# ZIVO P2P Car Rental Marketplace Implementation Plan

## Overview
Build a full-stack peer-to-peer car rental platform (similar to Turo) where ZIVO acts as the **merchant of record**, processes payments via Stripe, and earns commission from each booking.

---

## Current State Analysis

### Existing Infrastructure
- **Database Tables**: `rental_cars` (with `owner_id`), `car_rentals` (bookings with `booking_status` enum)
- **Auth System**: Role-based auth via `user_roles` table with `app_role` enum (`admin`, `moderator`, `user`)
- **Stripe Integration**: Webhook handler, checkout session creation for rides/eats
- **Admin Panel**: Modular admin dashboard at `/admin` with driver/restaurant management patterns
- **Storage Buckets**: `driver-documents`, `avatars` (can extend for car owner docs)

### Key Gaps to Fill
- No dedicated `car_owner_profiles` table for owner applications
- No `p2p_vehicles` table with approval workflow
- No `vehicle_availability` calendar system
- No owner dashboard pages
- No payout/earnings system for car owners
- No review system for P2P rentals
- No dispute handling for P2P

---

## Database Schema (New Tables)

### 1. car_owner_profiles
```text
id (uuid, PK)
user_id (uuid, FK -> auth.users, unique)
full_name (text)
phone (text)
email (text)
address (text)
city (text)
state (text)
zip_code (text)
date_of_birth (date)
ssn_last_four (text, encrypted reference)
stripe_account_id (text) -- Stripe Connect account
payout_enabled (boolean, default false)
status (enum: pending, verified, rejected, suspended)
documents_verified (boolean, default false)
insurance_option (enum: platform, own, none)
created_at (timestamptz)
updated_at (timestamptz)
```

### 2. car_owner_documents
```text
id (uuid, PK)
owner_id (uuid, FK -> car_owner_profiles)
document_type (enum: drivers_license, vehicle_registration, insurance, title)
file_url (text)
file_name (text)
status (enum: pending, approved, rejected)
reviewed_at (timestamptz)
reviewed_by (uuid)
notes (text)
expires_at (date)
created_at (timestamptz)
```

### 3. p2p_vehicles
```text
id (uuid, PK)
owner_id (uuid, FK -> car_owner_profiles)
make (text)
model (text)
year (int, CHECK >= 2018)
trim (text)
color (text)
vin (text, unique)
license_plate (text)
category (enum: economy, compact, midsize, fullsize, suv, luxury, minivan, truck)
transmission (enum: automatic, manual)
fuel_type (enum: gasoline, diesel, electric, hybrid)
seats (int)
doors (int)
mileage (int)
features (jsonb) -- AC, GPS, Bluetooth, etc.
description (text)
daily_rate (numeric)
weekly_rate (numeric)
monthly_rate (numeric)
min_trip_days (int, default 1)
max_trip_days (int, default 30)
location_address (text)
location_city (text)
location_state (text)
location_zip (text)
lat (numeric)
lng (numeric)
images (jsonb) -- array of image URLs
approval_status (enum: pending, approved, rejected, suspended)
is_available (boolean, default true)
instant_book (boolean, default false)
total_trips (int, default 0)
rating (numeric)
created_at (timestamptz)
updated_at (timestamptz)
```

### 4. vehicle_availability
```text
id (uuid, PK)
vehicle_id (uuid, FK -> p2p_vehicles)
date (date)
is_available (boolean, default true)
price_override (numeric) -- optional daily price override
created_at (timestamptz)
```

### 5. p2p_bookings
```text
id (uuid, PK)
vehicle_id (uuid, FK -> p2p_vehicles)
renter_id (uuid, FK -> auth.users)
owner_id (uuid, FK -> car_owner_profiles)
pickup_date (timestamptz)
return_date (timestamptz)
pickup_location (text)
return_location (text)
total_days (int)
daily_rate (numeric)
subtotal (numeric)
service_fee (numeric) -- ZIVO fee to renter
platform_fee (numeric) -- ZIVO commission from owner
insurance_fee (numeric)
total_amount (numeric) -- renter pays
owner_payout (numeric) -- subtotal - platform_fee
status (enum: pending, confirmed, active, completed, cancelled, disputed)
payment_status (enum: pending, authorized, captured, refunded, failed)
stripe_payment_intent_id (text)
renter_license_verified (boolean)
insurance_accepted (boolean)
pickup_confirmed_at (timestamptz)
return_confirmed_at (timestamptz)
actual_return_date (timestamptz)
mileage_start (int)
mileage_end (int)
notes (text)
created_at (timestamptz)
updated_at (timestamptz)
```

### 6. p2p_reviews
```text
id (uuid, PK)
booking_id (uuid, FK -> p2p_bookings)
reviewer_id (uuid, FK -> auth.users)
reviewee_id (uuid) -- owner or renter
review_type (enum: renter_to_owner, owner_to_renter, renter_to_vehicle)
rating (int, 1-5)
title (text)
comment (text)
cleanliness (int) -- for vehicle
communication (int)
accuracy (int)
value (int)
is_public (boolean, default true)
created_at (timestamptz)
```

### 7. p2p_payouts
```text
id (uuid, PK)
owner_id (uuid, FK -> car_owner_profiles)
booking_id (uuid, FK -> p2p_bookings)
amount (numeric)
status (enum: pending, processing, completed, failed)
stripe_transfer_id (text)
requested_at (timestamptz)
processed_at (timestamptz)
notes (text)
```

### 8. p2p_disputes
```text
id (uuid, PK)
booking_id (uuid, FK -> p2p_bookings)
raised_by (uuid, FK -> auth.users)
dispute_type (enum: damage, late_return, cancellation, refund, other)
description (text)
evidence (jsonb) -- photos, messages
status (enum: open, investigating, resolved, closed)
resolution (text)
resolved_by (uuid)
resolved_at (timestamptz)
created_at (timestamptz)
```

### 9. p2p_commission_settings
```text
id (uuid, PK)
name (text)
owner_commission_pct (numeric, default 20) -- % taken from owner
renter_service_fee_pct (numeric, default 10) -- % added to renter
is_active (boolean)
created_at (timestamptz)
updated_at (timestamptz)
```

---

## New Enums Required

```sql
CREATE TYPE p2p_vehicle_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE p2p_booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed');
CREATE TYPE p2p_payment_status AS ENUM ('pending', 'authorized', 'captured', 'refunded', 'failed');
CREATE TYPE p2p_payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE p2p_dispute_status AS ENUM ('open', 'investigating', 'resolved', 'closed');
CREATE TYPE p2p_review_type AS ENUM ('renter_to_owner', 'owner_to_renter', 'renter_to_vehicle');
CREATE TYPE document_type AS ENUM ('drivers_license', 'vehicle_registration', 'insurance', 'title', 'id_card');
CREATE TYPE insurance_option AS ENUM ('platform', 'own', 'none');
```

---

## Frontend Pages

### Public Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/cars` | `P2PCarSearch.tsx` | Browse & search P2P cars |
| `/cars/:id` | `P2PCarDetail.tsx` | Vehicle details, calendar, book |
| `/rent` | `HowRentingWorks.tsx` | Renter info page |
| `/list-your-car` | `ListYourCar.tsx` | Owner onboarding CTA |

### Renter Pages (Protected)
| Route | Component | Description |
|-------|-----------|-------------|
| `/cars/:id/checkout` | `P2PCheckout.tsx` | Booking + payment |
| `/bookings` | `RenterBookings.tsx` | My trips list |
| `/bookings/:id` | `RenterBookingDetail.tsx` | Trip details |
| `/reviews` | `RenterReviews.tsx` | My reviews |

### Owner Pages (Protected)
| Route | Component | Description |
|-------|-----------|-------------|
| `/owner/apply` | `OwnerApplication.tsx` | Become a host form |
| `/owner/dashboard` | `OwnerDashboard.tsx` | Overview + earnings |
| `/owner/cars` | `OwnerCars.tsx` | My vehicles list |
| `/owner/cars/new` | `AddVehicle.tsx` | Add new vehicle |
| `/owner/cars/:id/edit` | `EditVehicle.tsx` | Edit vehicle |
| `/owner/bookings` | `OwnerBookings.tsx` | Incoming bookings |
| `/owner/earnings` | `OwnerEarnings.tsx` | Earnings history |
| `/owner/payouts` | `OwnerPayouts.tsx` | Payout requests |

### Admin Pages (Protected + Admin Role)
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/p2p` | `AdminP2POverview.tsx` | P2P dashboard |
| `/admin/p2p/owners` | `AdminOwners.tsx` | Approve/manage owners |
| `/admin/p2p/vehicles` | `AdminP2PVehicles.tsx` | Approve/manage vehicles |
| `/admin/p2p/bookings` | `AdminP2PBookings.tsx` | All bookings |
| `/admin/p2p/payouts` | `AdminP2PPayouts.tsx` | Approve payouts |
| `/admin/p2p/disputes` | `AdminP2PDisputes.tsx` | Handle disputes |
| `/admin/p2p/settings` | `AdminP2PSettings.tsx` | Commission config |

---

## Edge Functions

### 1. create-p2p-checkout
- Create Stripe PaymentIntent for P2P booking
- Calculate fees (service fee, insurance, taxes)
- Create pending booking record
- Block vehicle availability dates

### 2. p2p-stripe-webhook
- Handle `payment_intent.succeeded` -> confirm booking
- Handle `payment_intent.payment_failed` -> release dates
- Handle refunds

### 3. process-p2p-payout
- Calculate owner earnings (booking amount - commission)
- Create Stripe Transfer to owner's Connect account
- Update payout status

### 4. complete-p2p-trip
- Mark booking as completed
- Trigger payout eligibility
- Send review request emails

---

## Storage Buckets

### p2p-documents (Private)
- Owner ID documents
- Vehicle registration
- Insurance certificates

### p2p-vehicle-images (Public)
- Vehicle photos (up to 10 per vehicle)

---

## Security & RLS Policies

### car_owner_profiles
- Users can read/update their own profile
- Admins can read/update all profiles

### p2p_vehicles
- Public read for approved vehicles
- Owners can CRUD their own vehicles
- Admins can manage all

### p2p_bookings
- Renters can read their own bookings
- Owners can read bookings for their vehicles
- Admins can read all

### p2p_payouts
- Owners can read their own payouts
- Admins can manage all

---

## Implementation Phases

### Phase 1: Database & Core Models (Week 1)
1. Create all new database tables with migrations
2. Add new enums
3. Create RLS policies
4. Create storage buckets
5. Add security definer functions for owner/vehicle checks

### Phase 2: Owner Onboarding (Week 2)
1. Build owner application form
2. Document upload flow
3. Admin owner approval module
4. Owner profile management

### Phase 3: Vehicle Management (Week 3)
1. Add vehicle form with validation (2018+ year check)
2. Photo upload gallery
3. Availability calendar component
4. Admin vehicle approval module

### Phase 4: Renter Booking Flow (Week 4)
1. P2P car search page with filters
2. Vehicle detail page with booking widget
3. Checkout with Stripe integration
4. Booking confirmation flow

### Phase 5: Trip Management (Week 5)
1. Renter booking dashboard
2. Owner booking management
3. Pickup/return confirmation flow
4. Review system after trip

### Phase 6: Payouts & Admin (Week 6)
1. Owner earnings dashboard
2. Payout request flow
3. Admin payout approval
4. Dispute management system

---

## Key Business Rules

1. **Vehicle Year Restriction**: Only 2018+ vehicles allowed
2. **Admin Approval**: Owners and vehicles require admin approval before going live
3. **Commission**: Default 20% from owner earnings (configurable)
4. **Insurance Acknowledgment**: Required checkbox before booking
5. **License Verification**: Renters must confirm valid driver's license
6. **Payout Timing**: Payouts processed 24 hours after trip completion
7. **Reviews**: Both parties can leave reviews within 14 days of trip end

---

## Technical Notes

- Reuse existing `booking_status` enum where applicable
- Extend `app_role` to include `car_owner` if needed (or use profile-based check)
- Use existing Stripe webhook infrastructure, extend with P2P handlers
- Follow existing admin module patterns for consistency
- Use existing driver document upload patterns for owner documents
