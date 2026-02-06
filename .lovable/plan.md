

# ZIVO Ride - Premium Rider Flow Implementation

## Overview
Build a new, polished ZIVO Ride rider experience with two dedicated routes (`/ride` and `/ride/confirm`) that match the provided screenshot design. This will be a complete redesign focused on mobile-first, iPhone-style UX with glassmorphism, premium animations, and a streamlined booking flow.

---

## Routes & Structure

| Route | Purpose |
|-------|---------|
| `/ride` | Main ride selection screen with location inputs and vehicle grid |
| `/ride/confirm` | Confirmation screen with booking summary, payment selection, and confirm action |

---

## Component Architecture

```text
src/
  pages/
    ride/
      RidePage.tsx          <- Main ride selection (/ride)
      RideConfirmPage.tsx   <- Confirmation screen (/ride/confirm)
  components/
    ride/
      RideAppBar.tsx        <- Top nav with ZIVO logo + hamburger
      RideLocationCard.tsx  <- Glassmorphism pickup/destination inputs
      RideSegmentTabs.tsx   <- ECONOMY / PREMIUM / ELITE tabs
      RideGrid.tsx          <- 2-column vehicle card grid
      RideCard.tsx          <- Individual vehicle card
      RideStickyCTA.tsx     <- Bottom sticky button
      RideBottomNav.tsx     <- 5-tab bottom navigation
      RideSuggestions.tsx   <- Mock dropdown suggestions
```

---

## /ride Screen Design

### 1. App Bar (Fixed Top)
- Left: Circular "Z" logo with "ZIVO" text
- Right: Hamburger menu icon
- Background: transparent with subtle blur on scroll

### 2. Hero Background
- Full-screen city skyline image (use existing `src/assets/hero-rides.jpg` or Unsplash cityscape)
- Dark gradient overlay (from-black/80 via-black/40 to-transparent)

### 3. "Drivers Nearby" Pill
- Centered below app bar
- Green dot + "35 DRIVERS NEARBY" text
- Glassmorphic background (bg-white/10 backdrop-blur)

### 4. "Where to?" Heading
- Large, bold heading centered

### 5. Location Card (Glassmorphism)
- Two input rows:
  - Row 1: Paper-plane icon + "PICKUP LOCATION" label + editable input + crosshair icon
  - Row 2: Map-pin icon + "DESTINATION" label + editable input + crosshair icon
- Left vertical connector line between icons
- On typing: show mock dropdown suggestions (hardcoded addresses)

### 6. "Choose Your Ride" Section
- Title with "Ride" in blue/primary color
- Segmented tabs: ECONOMY (default) | PREMIUM | ELITE

### 7. Ride Cards Grid (2-column)
- Each card structure:
  - Background vehicle image
  - Top-right price badge
  - Bottom title + subtitle + ETA
- Selection state: blue border + glow effect
- Mock data:
  - **Economy**: Wait & Save ($15.89, 15min), Standard ($20.35, 4min)
  - **Premium**: Extra Comfort ($30.17, 5min), ZIVO Black ($49.80, 8min)
  - **Elite**: ZIVO Lux ($189.00, 20min), Executive ($150.00, 15min)

### 8. Sticky CTA Button
- Fixed above bottom nav
- Disabled state: "SELECT A RIDE"
- Active state: "SELECT [RideName] ($Price) ->" with arrow
- Glassmorphic background

### 9. Bottom Navigation
- Reuse existing `ZivoMobileNav` pattern but customize for this flow
- Icons: Home | Search | Trips | Alerts (badge) | Account

---

## /ride/confirm Screen Design

### 1. App Bar
- Back arrow + "Confirm Ride" title

### 2. Trip Summary Card
- Pickup location
- Destination
- Selected ride type with image
- Price
- ETA

### 3. Payment Method Selector
- Dropdown/list with options: Card (default), Apple Pay, Cash
- Mock saved card display

### 4. "CONFIRM RIDE" Button
- Large, prominent CTA
- On click: Show "Finding driver..." loading modal with progress animation
- After 2-3 seconds: Show success toast/modal

---

## Technical Implementation

### New Files to Create:

1. **`src/pages/ride/RidePage.tsx`** - Main ride selection page
2. **`src/pages/ride/RideConfirmPage.tsx`** - Confirmation page
3. **`src/components/ride/RideAppBar.tsx`** - Custom app bar
4. **`src/components/ride/RideLocationCard.tsx`** - Location input card
5. **`src/components/ride/RideSegmentTabs.tsx`** - Category tabs
6. **`src/components/ride/RideCard.tsx`** - Vehicle card component
7. **`src/components/ride/RideGrid.tsx`** - Vehicle grid wrapper
8. **`src/components/ride/RideStickyCTA.tsx`** - Sticky CTA
9. **`src/components/ride/RideBottomNav.tsx`** - Bottom navigation

### Routes Update (`src/App.tsx`):
- Add `/ride` -> `RidePage`
- Add `/ride/confirm` -> `RideConfirmPage`

### State Management:
- Use React `useState` for local state
- Pass selected ride + locations via URL params or React Router state

### Mock Data:
- Hardcoded vehicle options with Unsplash images
- Mock location suggestions (addresses)
- Mock payment methods

---

## UI/UX Details

### Colors & Styling
- Primary: Blue (`hsl(217, 91%, 60%)`) for selected states
- Background: `zinc-950` (near black)
- Glass effects: `bg-white/10 backdrop-blur-xl border-white/10`
- Green dot for "online" states

### Animations
- Framer Motion for card selections, transitions
- Pulse animation for loading states
- Scale on tap (0.98) for touch feedback

### Accessibility
- Large tap targets (min 48px)
- Focus states on all interactive elements
- High contrast text

### Mobile Optimizations
- Safe area insets for notch/home indicator
- No-scroll single viewport experience
- 16px font size on inputs to prevent iOS zoom

---

## Mock Images

| Element | Source |
|---------|--------|
| City background | `https://images.unsplash.com/photo-1477959858617-67f85cf4f1df` |
| Wait & Save | `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2` |
| Standard | `https://images.unsplash.com/photo-1469285994282-454ceb49e63c` |
| Extra Comfort | `https://images.unsplash.com/photo-1552519507-da3b142c6e3d` |
| ZIVO Black | `https://images.unsplash.com/photo-1563720223185-11003d516935` |
| Lux | `https://images.unsplash.com/photo-1553440637-d22ed8a02575` |
| Executive | `https://images.unsplash.com/photo-1559416523-140ddc3d238c` |

---

## Implementation Order

1. Create ride component folder structure
2. Build RidePage with static layout
3. Add RideLocationCard with mock suggestions
4. Implement RideSegmentTabs and RideGrid
5. Add selection state and RideStickyCTA
6. Create RideConfirmPage with summary
7. Add payment selector and confirm flow
8. Register routes in App.tsx
9. Test mobile responsiveness

