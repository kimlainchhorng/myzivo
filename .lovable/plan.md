
# ZIVO Rides + Eats MVP Implementation Plan

## Executive Summary

This plan transforms ZIVO Rides and ZIVO Eats from "Coming Soon" placeholders into fully functional MVP request/lead capture systems with a comprehensive Admin Dashboard. Users can submit ride requests and food orders, while admins can manage, assign, and track all requests.

---

## Current State Analysis

**What Exists:**
- Database tables already exist for `drivers`, `trips`, `food_orders`, `restaurants`, `menu_items`
- Admin components exist: `AdminRidesManagement.tsx` (real-time trip data), `AdminEatsManagement.tsx` (mock data only)
- `/ride` and `/food` routes point to `RidesComingSoon.tsx` and `EatsComingSoon.tsx`
- Extensive admin dashboard at `/admin` with 60+ modules (protected route)
- Contact page exists with correct emails
- Footer has contact info and affiliate disclosure

**What Needs Building:**
- Public-facing Rides request form
- Public-facing Eats ordering flow (restaurant browsing, menu, cart, checkout)
- Seed demo restaurant data
- Enhanced admin modules for managing requests with status updates, assignment, notes
- New database table for ride requests (separate from trips which are for accepted rides)
- Update navigation and homepage

---

## Implementation Phases

### Phase 1: Database Schema Updates

**New Table: `ride_requests`**
Separate from `trips` (which are for active/completed rides with drivers assigned)

```text
ride_requests:
- id (UUID)
- customer_name (TEXT)
- customer_phone (TEXT) 
- customer_email (TEXT)
- pickup_address (TEXT)
- pickup_lat (NUMERIC)
- pickup_lng (NUMERIC)
- dropoff_address (TEXT)
- dropoff_lat (NUMERIC)
- dropoff_lng (NUMERIC)
- ride_type (enum: standard, xl, premium)
- scheduled_at (TIMESTAMPTZ, nullable - null means "now")
- notes (TEXT)
- status (enum: new, contacted, assigned, en_route, completed, cancelled)
- assigned_driver_id (UUID, FK to drivers)
- admin_notes (TEXT)
- created_at, updated_at

RLS: Insert allowed for anyone (public form), Select/Update for authenticated admins
```

**Update `food_orders` for MVP:**
Add fields if missing:
- `customer_name`, `customer_phone`, `customer_email` (for guest checkout)
- `preferred_time` (enum: asap, scheduled)
- `admin_notes`
- Update status enum: new, restaurant_confirmed, driver_assigned, out_for_delivery, delivered, cancelled

**Seed Demo Restaurants:**
Create 6-8 realistic demo restaurants with menu items for testing.

---

### Phase 2: Public ZIVO Rides MVP

**File: `src/pages/Rides.tsx`** (replaces RidesComingSoon)

UI Components:
1. Hero section with ZIVO Rides branding
2. Request form with:
   - Pickup address (text input with validation)
   - Drop-off address
   - Date/Time selector (Now / Schedule picker)
   - Ride type dropdown (Standard / XL / Premium)
   - Customer name, phone, email
   - Optional notes
3. "Request Ride" CTA button
4. Confirmation page/modal after submission

Key Design Decisions:
- Mobile-first form with large inputs and sticky CTA
- No fake ETAs or driver availability claims
- Clear messaging: "Request received. We'll match you with available drivers."
- Form validation with Zod

---

### Phase 3: Public ZIVO Eats MVP

**Multi-step ordering flow:**

**Step 1: Address Entry** (`/eats`)
- Delivery address input
- "Find Restaurants" button

**Step 2: Restaurant List** (`/eats/restaurants`)
- Grid of seeded demo restaurants
- Filter by cuisine type
- Each card shows: name, cuisine, rating, prep time, image

**Step 3: Restaurant Menu** (`/eats/restaurant/:id`)
- Restaurant header with details
- Menu categories and items
- Add to cart functionality (client-side state)

**Step 4: Cart & Checkout** (`/eats/checkout`)
- Cart summary with items, quantities, totals
- Checkout form:
  - Name, phone, email
  - Delivery address (pre-filled from Step 1)
  - Delivery instructions
  - Preferred time: ASAP / Schedule
- "Place Order Request" button
- Confirmation: "Order request received. A partner will confirm shortly."

Key Design Decisions:
- No payment capture (MVP)
- No delivery tracking promises
- Professional restaurant imagery using placeholder patterns
- Cart state via React Context

---

### Phase 4: Admin Dashboard Enhancements

**4A: `/admin/rides` - Ride Requests Management**

Enhanced `AdminRidesManagement.tsx`:
- Table view of all ride requests with search/filter
- Status filter: All / New / Contacted / Assigned / En Route / Completed / Cancelled
- Columns: ID, Customer, Phone, Pickup → Dropoff, Type, Status, Created, Actions
- Row actions:
  - View details (slide-out panel)
  - Update status dropdown
  - Assign driver (modal with driver list)
  - Add internal notes
  - Send message (opens mailto: link)
- Real-time data from Supabase

**4B: `/admin/eats-orders` - Food Orders Management**

Enhanced `AdminEatsManagement.tsx`:
- Replace mock data with real Supabase queries
- Table view of all orders
- Status filter: All / New / Restaurant Confirmed / Driver Assigned / Out for Delivery / Delivered / Cancelled
- Columns: Order ID, Customer, Restaurant, Items, Total, Status, Created, Actions
- Row actions:
  - View order details
  - Update status
  - Assign restaurant (if multi-vendor)
  - Assign delivery driver
  - Add admin notes
  - Contact customer

**4C: `/admin/drivers` - Driver Management**

Enhance existing `AdminDriverManagement.tsx`:
- CRUD for drivers
- Fields: Name, Phone, Email, City, Vehicle Type, Status (Active/Inactive)
- Assignment history view

**4D: `/admin/restaurants` - Restaurant Management**

Enhance existing `AdminRestaurantManagement.tsx`:
- CRUD for restaurants
- Fields: Name, City, Phone, Email, Status, Menu Items
- Link to menu item editor (basic CRUD)

---

### Phase 5: Navigation & Homepage Updates

**Navigation Updates:**

Update `megaMenuData.ts`:
- Change ZIVO Rides from "Coming Soon" to active link `/rides`
- Change ZIVO Eats from "Coming Soon" to active link `/eats`
- Remove "Soon" badge

Update header to include Help/Support link to `/contact`.

**Homepage Updates:**

Update `ServiceCards.tsx` or add new section:
- 6-card grid: Flights, Hotels, Car Rental, Rides, Eats, Extras
- Each card with icon, description, CTA
- Rides: "Request a Ride" → `/rides`
- Eats: "Order Food" → `/eats`

Update mobile homepage (`Index.tsx`):
- Update quick services grid to show active Rides/Eats

---

### Phase 6: Contact & Footer Updates

**Contact Page** (`/contact`) - Already correct with:
- info@hizivo.com
- payment@hizivo.com  
- kimlain@hizivo.com
- ZIVO LLC business info

**Footer** - Already has:
- Contact email
- Affiliate disclosure text

**Organization Schema** (`OrganizationSchema.tsx`):
- Add email: info@hizivo.com
- Add contactPoint with emails

---

## Technical Architecture

### New Files to Create:
```text
src/pages/Rides.tsx                    - Public ride request form
src/pages/Eats.tsx                     - Eats entry (address input)
src/pages/EatsRestaurants.tsx          - Restaurant listing
src/pages/EatsRestaurantMenu.tsx       - Single restaurant menu
src/pages/EatsCheckout.tsx             - Cart & checkout
src/contexts/CartContext.tsx           - Eats cart state
src/hooks/useRideRequests.ts           - Ride requests query/mutation
src/hooks/useEatsOrders.ts             - Food orders query/mutation
src/components/rides/RideRequestForm.tsx
src/components/eats/RestaurantCard.tsx
src/components/eats/MenuItemCard.tsx
src/components/eats/CartDrawer.tsx
supabase/migrations/XXXX_ride_requests.sql
supabase/migrations/XXXX_seed_restaurants.sql
```

### Files to Modify:
```text
src/App.tsx                            - Add new routes
src/pages/AdminDashboard.tsx           - Already has tabs
src/components/admin/AdminRidesManagement.tsx - Enhance for requests
src/components/admin/AdminEatsManagement.tsx  - Real data
src/components/admin/AdminDriverManagement.tsx
src/components/admin/AdminRestaurantManagement.tsx
src/components/navigation/megaMenuData.ts
src/components/home/ServiceCards.tsx
src/components/seo/OrganizationSchema.tsx
```

---

## Compliance & UX Standards

**MVP Rules Enforced:**
- No credit card collection
- No fake ETAs or guaranteed availability
- Clear "request received" messaging
- Partner/vendor confirmation language

**Form UX:**
- Mobile-first with h-12 inputs, gap-4 spacing
- Sticky CTAs on mobile
- Loading states during submission
- Toast notifications for success/error

**Admin Security:**
- All admin routes protected via `ProtectedRoute requireAdmin`
- RLS policies restrict ride_requests to admin-only viewing

---

## Estimated Scope

| Phase | Components | Complexity |
|-------|------------|------------|
| Phase 1: Database | 2 migrations | Low |
| Phase 2: Rides | 2 pages, 1 form | Medium |
| Phase 3: Eats | 4 pages, 4 components, 1 context | High |
| Phase 4: Admin | 4 enhanced modules | Medium |
| Phase 5: Nav/Home | 3 file updates | Low |
| Phase 6: Contact | Already done | None |

**Recommended Approach:** Implement in phases across multiple prompts to ensure quality and manageable changes for the large project.
