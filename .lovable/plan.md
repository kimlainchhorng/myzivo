

## Restore Ride, Eats & Delivery Services

The previous fix incorrectly removed Ride and Eats as services by redirecting `/rides` and `/eats` to `/flights`. Your screenshot shows the original super-app design with all 6 services (Ride, Eats, Delivery, Flights, Hotels, Rentals). Here's the plan to restore everything:

---

### 1. Fix Routes in App.tsx
- Remove the broken redirects that send `/rides` -> `/flights` and `/eats` -> `/flights`
- Add proper routes:
  - `/rides` -> `RequestRidePage` (already exists at `src/pages/app/RequestRidePage.tsx`)
  - `/eats` -> New `EatsPage` (simple hub page listing restaurants)
  - `/eats/restaurant/:id` -> Restaurant detail page (stub)
- Keep `/food` as a redirect to `/eats` (alias)

### 2. Create Eats Landing Page
- New file: `src/pages/EatsLanding.tsx`
- Simple food delivery hub with search bar, cuisine categories, and featured restaurant cards
- Uses existing `FeaturedEatsSection` content/patterns
- Premium glassmorphism style matching the rest of the app

### 3. Restore 3x2 Service Grid in AppHome.tsx
- Update `quickActions` array to restore the original 6-service grid:
  - **Ride** (Car icon, green, `/rides`)
  - **Eats** (UtensilsCrossed icon, orange, `/eats`)
  - **Delivery** (Package icon, violet, `/extras`)
  - **Flights** (Plane icon, sky, `/flights`)
  - **Hotels** (BedDouble icon, amber, `/hotels`)
  - **Rentals** (Car icon, teal, `/rent-car`)
- Restore "Quick Ride" estimate card to navigate to `/rides`
- Fix "Order Again" and "Popular Near You" sections to link to `/eats`

### 4. Restore HeroSearchCard Tabs
- Keep all 5 tabs (Flights, Hotels, Cars, Rides, Eats)
- Fix search routes so Rides tab navigates to `/rides` and Eats tab navigates to `/eats` (currently both go to `/flights`)

### 5. Restore NavBar Links
- Keep Rides and Eats in the main navigation bar (`NavBar.tsx`) pointing to `/rides` and `/eats`

### 6. Restore ServiceQuickNav
- Add Ride and Eats back as service buttons in the quick nav component

### 7. Fix UnifiedDashboard
- Add Ride and Eats back to the services grid (currently only shows 5: Flights, Hotels, Cars, Activities, Extras)

### 8. Fix ServicesShowcase
- Already has Rides and Eats -- just verify links work with the new routes

---

### Files to Create
- `src/pages/EatsLanding.tsx` -- Food delivery hub page

### Files to Edit
- `src/App.tsx` -- Fix routes for `/rides` and `/eats`
- `src/pages/app/AppHome.tsx` -- Restore 6-service grid with Ride, Eats, Delivery
- `src/components/home/HeroSearchCard.tsx` -- Fix Rides/Eats search destinations
- `src/pages/app/UnifiedDashboard.tsx` -- Add Ride and Eats to services
- `src/components/navigation/ServiceQuickNav.tsx` -- Add Ride and Eats buttons
- `src/components/home/QuickActionsSection.tsx` -- Optionally restore Ride/Eats actions

