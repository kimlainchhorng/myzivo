
# ZIVO Rides + Eats MVP Continuation Plan

## Summary

This plan continues the implementation from Phase 1-2 (completed: database + Rides page) to build out:
- Phase 3: ZIVO Eats public ordering flow (4 pages)
- Phase 4: Admin dashboard enhancements for ride requests and food orders
- Phase 5: Navigation and homepage updates
- Phase 6: Contact information updates across the site

---

## Current State (Completed in Previous Message)

1. **Database**: `ride_requests` table created with RLS policies
2. **ZIVO Rides**: `/rides` page functional with form submission
3. **Hooks**: `useRideRequests.ts` and `useEatsOrders.ts` created
4. **Cart Context**: `CartContext.tsx` for Eats cart management
5. **Demo Restaurants**: 8 restaurants with 40 menu items seeded

---

## Phase 3: ZIVO Eats Public Flow

### 3A: Eats Landing Page (`/eats`)
**Replace EatsComingSoon.tsx with full Eats.tsx**

- Hero section with ZIVO Eats branding (orange/amber theme)
- Delivery address input field
- "Find Restaurants" CTA button
- Popular restaurants preview section
- How It Works section (3 steps)

### 3B: Restaurant Listing Page (`/eats/restaurants`)
**New file: EatsRestaurants.tsx**

- Header with delivery address (editable)
- Restaurant grid with cards showing:
  - Restaurant image/logo
  - Name, cuisine type
  - Rating, prep time estimate
  - "Order Now" button
- Filter by cuisine type (optional)
- Empty state for no restaurants

### 3C: Restaurant Menu Page (`/eats/restaurant/:id`)
**New file: EatsRestaurantMenu.tsx**

- Restaurant header with details
- Menu organized by category
- Menu item cards with:
  - Name, description, price
  - "Add to Cart" button
- Floating cart indicator (item count + total)
- Cart drawer/sidebar for viewing items

### 3D: Checkout Page (`/eats/checkout`)
**New file: EatsCheckout.tsx**

- Order summary (items, quantities, prices)
- Customer info form:
  - Name, phone, email
  - Delivery address (pre-filled)
  - Delivery instructions
  - Preferred time: ASAP / Schedule
- "Place Order Request" CTA
- Success confirmation modal/page

### 3E: Supporting Components
**New files in src/components/eats/**

- `RestaurantCard.tsx` - Restaurant listing card
- `MenuItemCard.tsx` - Menu item with add button
- `CartDrawer.tsx` - Slide-out cart panel
- `OrderSummary.tsx` - Checkout order summary

---

## Phase 4: Admin Dashboard Enhancements

### 4A: Admin Ride Requests (`AdminRidesManagement.tsx`)
**Transform from trips-based to ride_requests-based**

Current state: Uses `useTrips()` for existing trips table
New state: Add a "Ride Requests" tab using `useRideRequests()`

Updates:
- Add "Ride Requests" tab alongside "Live Rides"
- Table showing: ID, Customer, Phone, Pickup, Dropoff, Type, Status, Created
- Status filter dropdown (New, Contacted, Assigned, etc.)
- Row actions:
  - View details (slide-out panel)
  - Update status dropdown
  - Assign driver (modal with driver list)
  - Add admin notes
  - Contact (mailto: link)
- Real-time refresh from Supabase

### 4B: Admin Eats Orders (`AdminEatsManagement.tsx`)
**Replace mock data with real Supabase queries**

Updates:
- Replace `mockOrders` with `useFoodOrders()` hook
- Table showing: Order ID, Customer, Restaurant, Items, Total, Status, Created
- Status filter: New, Confirmed, Driver Assigned, Out for Delivery, Delivered, Cancelled
- Row actions:
  - View order details
  - Update status
  - Assign driver (if applicable)
  - Add admin notes
  - Contact customer

### 4C: Driver Management Enhancement
**Update AdminDriverManagement.tsx if needed**

- Ensure CRUD operations work
- Add "Assign to Request" action

### 4D: Restaurant Management Enhancement
**Update AdminRestaurantManagement.tsx if needed**

- Basic CRUD for restaurants
- Menu items management link

---

## Phase 5: Navigation and Homepage Updates

### 5A: Mega Menu Updates (`megaMenuData.ts`)
- Change ZIVO Rides: Remove "Soon" badge, update href to `/rides`
- Change ZIVO Eats: Remove "Soon" badge, update href to `/eats`
- Keep descriptions updated for active services

### 5B: Footer Updates (`Footer.tsx`)
- Change "Rides (Coming Soon)" to "Rides" with href `/rides`
- Change "Eats (Coming Soon)" to "Eats" with href `/eats`
- Remove "ZIVO Rides and ZIVO Eats are planned services" disclaimer
- Add contact section with emails:
  - info@hizivo.com
  - payment@hizivo.com
- Keep affiliate disclosure text

### 5C: Homepage Service Cards (`ServiceCards.tsx`)
**Expand from 3 cards to 6 cards**

Add:
- ZIVO Rides: "Request a ride in your area" → `/rides`
- ZIVO Eats: "Order food from local restaurants" → `/eats`
- Extras: "Airport transfers, insurance & more" → `/extras`

### 5D: Header Help Link
- Add Help/Support icon-link to `/contact` in desktop actions
- Already has Help Center in user dropdown (line 118)

---

## Phase 6: Contact Updates

### 6A: Contact Page (`Contact.tsx`)
**Already correct** - Has all three emails:
- info@hizivo.com (Support)
- payment@hizivo.com (Billing)
- kimlain@hizivo.com (Business)
- ZIVO LLC business info

### 6B: Organization Schema (`OrganizationSchema.tsx`)
Update to include:
- name: "ZIVO LLC"
- email: "info@hizivo.com"
- contactPoint array with all emails

### 6C: index.html Organization Schema
Already includes contactPoint with emails - confirm consistency

---

## File Changes Summary

### New Files (8 files)
```text
src/pages/Eats.tsx                         - Eats landing page
src/pages/EatsRestaurants.tsx              - Restaurant listing
src/pages/EatsRestaurantMenu.tsx           - Restaurant menu
src/pages/EatsCheckout.tsx                 - Checkout page
src/components/eats/RestaurantCard.tsx     - Restaurant card component
src/components/eats/MenuItemCard.tsx       - Menu item component
src/components/eats/CartDrawer.tsx         - Cart slide-out panel
src/components/eats/OrderSummary.tsx       - Order summary component
```

### Modified Files (8 files)
```text
src/App.tsx                                - Add Eats routes
src/components/admin/AdminRidesManagement.tsx - Ride requests tab
src/components/admin/AdminEatsManagement.tsx  - Real data integration
src/components/navigation/megaMenuData.ts     - Active Rides/Eats links
src/components/Footer.tsx                     - Update services, add contacts
src/components/home/ServiceCards.tsx          - 6 service cards
src/components/Header.tsx                     - Help link
src/components/seo/OrganizationSchema.tsx     - Add emails
```

---

## Technical Details

### App.tsx Route Additions
```text
/eats                    → Eats.tsx
/eats/restaurants        → EatsRestaurants.tsx
/eats/restaurant/:id     → EatsRestaurantMenu.tsx
/eats/checkout           → EatsCheckout.tsx
```

### CartProvider Integration
Wrap Eats routes with CartProvider in App.tsx to maintain cart state across pages.

### MVP Compliance Reminders
- No payment capture fields
- No delivery time guarantees
- Clear "request received" messaging
- Partner/vendor confirmation language
- Mobile-first form design with large inputs

---

## Implementation Order

1. **Eats Pages** (Phase 3A-3E): Create all Eats flow pages
2. **Admin Enhancements** (Phase 4A-4B): Update admin modules
3. **Navigation/Footer** (Phase 5): Update megaMenu, footer, homepage
4. **Contact/SEO** (Phase 6): Update schema with emails

---

## Expected Outcome

After implementation:
- Users can submit ride requests at `/rides` (already done)
- Users can browse restaurants and submit food orders at `/eats`
- Admin can view and manage ride requests at `/admin` (Rides tab)
- Admin can view and manage food orders at `/admin` (Eats tab)
- Navigation shows active Rides and Eats links
- Homepage displays all 6 services
- Contact information is consistent across the site
