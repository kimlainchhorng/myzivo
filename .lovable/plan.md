

## Phase 6 (Sub-phases 2-4): Platform-Wide Mega Update

This update covers all remaining items from the Phase 6 plan -- verticals, ads, desktop polish, and mobile UX -- in one large batch.

---

### SUB-PHASE 2: Ride, Eats, and Delivery Verticals

#### A. Rides Page (`src/pages/Rides.tsx`)

1. **Saved Places Quick-Select Row** -- Add a horizontal row of quick-tap buttons (Home, Work, Airport) above the pickup input in the "request" step. These pre-fill the pickup or dropoff with saved addresses (stored in localStorage for now). Icons: Home, Briefcase, Plane.

2. **"Schedule for Later" Button** -- Add a secondary button below the "Find Rides" CTA in the request step. Tapping it opens a date/time picker (native HTML datetime-local input in a modal). Selected time displays as a badge on the pickup card.

3. **Vehicle Card Glow Effects** -- Enhance the `ZivoRideRow` component with a subtle colored left-border glow when selected:
   - Economy cards: emerald glow
   - Premium cards: blue glow
   - Elite cards: amber/gold glow

4. **ETA Countdown Animation** -- When ride is confirmed (step = "processing" or "success"), show an animated countdown ring around the ETA badge using framer-motion's circular progress.

#### B. Eats Desktop Page (`src/pages/Eats.tsx`)

1. **Featured Restaurants Section** -- Add a new section between the Hero and Features Grid that queries Supabase for 4 top-rated active restaurants and displays them in cards with images, ratings, and cuisine type.

2. **Live Order Counter** -- Add a social proof badge in the hero: "1,247+ orders today" with a subtle pulse animation. Uses a static seed number + time-based increment for demo purposes.

3. **Promo Banner Slot** -- Add a full-width gradient banner below the hero: "Free delivery on your first order. Use code WELCOME" with a CTA button to /eats/restaurants.

#### C. Eats Mobile (`src/components/eats/MobileEatsPremium.tsx`)

1. **Cuisine Filter Chips** -- Replace the static `categories` array with an expanded set: All, Pizza, Sushi, Burgers, Healthy, Mexican, Chinese, Indian, Thai, BBQ. Add horizontal scroll with momentum.

2. **"Free Delivery" Toggle** -- Add a toggle switch below the sort pills that filters restaurants to show only those with free delivery (delivery_fee = 0 or null).

#### D. Move/Delivery Pages

**`src/pages/Move.tsx`:**
1. **Animated Package Illustration** -- Replace the static hero with a framer-motion animated package icon that bounces and has a tracking line animation.
2. **Waitlist Email Capture** -- Add a "Coming Soon to Your City" section with an email input and "Notify Me" button. Stores email in localStorage (no backend needed yet).
3. **Testimonials** -- Add 3 mock customer testimonials with star ratings below the How It Works section.

**`src/pages/PackageDelivery.tsx`:**
1. **Pricing Calculator Preview** -- Add an interactive pricing estimator above the booking form: user selects package size (Small/Medium/Large) and distance range (Under 5mi / 5-15mi / 15-30mi), shows estimated price range instantly.

---

### SUB-PHASE 3: Flights, Hotels, and Rentals

#### A. Flights Page (`src/pages/FlightSearch.tsx`)

1. **"Flexible Dates" Badge** -- Add a badge next to the search form header: "Flexible Dates" with a calendar icon and tooltip explaining that nearby dates may have better prices.

2. **Recent Searches Chips** -- Below the search form, show recent searches stored in localStorage as clickable chips (e.g., "NYC to LAX, Feb 15"). Max 4 items.

3. **Price Trends Mini-Section** -- Add a new section after the search form with 3 cards showing mock "Best Time to Book" data: "Book 3-4 weeks early", "Tuesdays are cheapest", "Set a price alert".

4. **Compliance Disclaimer Polish** -- Update the amber disclaimer banner to use a cleaner design with rounded corners, subtle border, and slightly smaller text.

#### B. Hotels Page (`src/pages/HotelsPage.tsx`)

1. **"Tonight's Deals" Section** -- Add a horizontal scroll section before results (when not searched) showing 4 mock "Tonight" deals with "Book by midnight" urgency badges.

2. **Hotel Category Quick Filters** -- Add visual filter cards above results: Boutique, Resort, Business, Budget -- each with an icon and background gradient. Clicking adds to filter state.

3. **"Best Value" Badge** -- Add a "Best Value" badge to the first hotel result card (lowest price-to-rating ratio).

#### C. Cars/Rentals Page (`src/pages/Cars.tsx`)

1. **"Popular Makes" Horizontal Scroll** -- Add a horizontal scroll section above results with brand name chips: Tesla, BMW, Toyota, Honda, Mercedes, Ford, Audi, Porsche. Clicking filters by make.

2. **"Price Match Guarantee" Trust Badge** -- Add a trust badge in the hero section: shield icon + "Price Match Guarantee" text.

3. **"Recently Viewed" Section** -- Track viewed vehicles in localStorage. Show a "Recently Viewed" horizontal scroll section at the bottom of the page when the user has history.

---

### SUB-PHASE 4: Ads, Desktop Polish, and Mobile UX

#### A. Ad Placements

1. **New `HomepageAdBanner` Component** (`src/components/ads/HomepageAdBanner.tsx`) -- A responsive ad banner component with:
   - Gradient background with animated shimmer
   - "Sign up and save $10 on your first booking" for signed-out users
   - "Exclusive ZIVO+ deals" for signed-in users
   - CTA button linking to /signup or /membership
   - "Ad" label for transparency

2. **Place Ad on Homepage** (`src/pages/Index.tsx`) -- Insert `HomepageAdBanner` between PopularRoutesSection and SmartOffersSection.

3. **Promo Banner on Mobile AppHome** (`src/pages/app/AppHome.tsx`) -- The signed-out promo banner added in sub-phase 1 already covers this. No additional work needed.

#### B. Desktop Homepage Polish (`src/pages/Index.tsx`, `src/components/home/HeroSection.tsx`)

1. **Scroll-Triggered Animations** -- Wrap each homepage section (WhyBookWithZivo, BentoFeatures, PrimaryServicesSection, HowItWorksSimple, etc.) in a framer-motion `motion.div` with `whileInView` fade-in-up animation. Add `viewport={{ once: true }}` for performance.

2. **Sticky "Book Now" CTA Bar** -- Add a fixed bottom bar (desktop only) that appears after scrolling past the hero. Shows "Book Flights from $49" with a CTA button. Uses Intersection Observer to toggle visibility.

3. **"As Seen On" Section** -- Add a new section after SocialProofSection with 5-6 placeholder press logo boxes (gray rectangles with text: TechCrunch, Forbes, Bloomberg, etc.) in a horizontal row.

#### C. NavBar Glassmorphism (`src/components/home/NavBar.tsx`)

1. **Scroll-Based Glass Effect** -- Add a scroll listener that increases backdrop blur and adds a subtle border-bottom glow when the user scrolls past 50px. The navbar background transitions from `bg-background/95` to `bg-background/80 backdrop-blur-xl` with a border animation.

#### D. Footer Enhancement (`src/components/Footer.tsx`)

1. **Social Media Links** -- Add a social media row in the brand column: Twitter/X, Instagram, LinkedIn, YouTube icons linking to placeholder URLs.

2. **App Store Badges** -- Add mock "Download on App Store" and "Get it on Google Play" badge images below the social links.

#### E. Mobile App Polish

1. **Pull-to-Refresh on AppHome** (`src/pages/app/AppHome.tsx`) -- Add a pull-down gesture that triggers a page reload using a simple touch event handler with visual feedback (spinning arrow icon).

2. **Haptic Feedback Utility** -- Create a new utility `src/lib/haptics.ts` that wraps `navigator.vibrate()` for key actions (book, confirm, pay). Import and call in ride booking confirmation, eats order placement, etc.

3. **Safe Area Padding** -- Audit and ensure all fixed-position elements (ZivoMobileNav, MobileStickyFooter, RideStickyCTA) use `pb-safe` / `safe-area-bottom` classes consistently.

4. **Skeleton Loading States** -- Add skeleton placeholders to the AppHome trending section and service grid while data loads.

---

### Summary of All Files

| Change | Files |
|--------|-------|
| Rides UX | `src/pages/Rides.tsx`, `src/components/ride/ZivoRideRow.tsx` |
| Eats Desktop | `src/pages/Eats.tsx` |
| Eats Mobile | `src/components/eats/MobileEatsPremium.tsx` |
| Move | `src/pages/Move.tsx` |
| Package Delivery | `src/pages/PackageDelivery.tsx` |
| Flights | `src/pages/FlightSearch.tsx` |
| Hotels | `src/pages/HotelsPage.tsx` |
| Cars | `src/pages/Cars.tsx` |
| Ads | new `src/components/ads/HomepageAdBanner.tsx` |
| Desktop Homepage | `src/pages/Index.tsx`, `src/components/home/HeroSection.tsx` |
| NavBar | `src/components/home/NavBar.tsx` |
| Footer | `src/components/Footer.tsx` |
| Mobile Home | `src/pages/app/AppHome.tsx` |
| Haptics Utility | new `src/lib/haptics.ts` |

**Total: ~16 files modified/created across all verticals, ads, and polish layers.**

