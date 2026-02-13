

## Marketing Website and Landing Pages for ZIVO

### Current State

Your marketing website is already well-built with most pages in place:
- **Home page** with hero, services, how it works, testimonials, and app download
- **About, FAQ, How It Works, Contact, Partners, Careers** pages all exist
- **Install page** with PWA download guidance for iOS/Android
- **Restaurant Registration** form exists (but no marketing landing page)
- **SEO infrastructure** with meta tags, Open Graph, and FAQ schema markup

### What Needs to Be Added

Three dedicated marketing landing pages are missing. These would serve as public-facing pages to attract each user type with tailored messaging and clear calls to action.

---

### 1. Customer Landing Page (`/for-customers`)

A public page showcasing all ZIVO services from the customer perspective.

**Sections:**
- Hero with tagline ("Your all-in-one travel and mobility app")
- Service cards: Book Rides, Order Food, Send Packages, Search Flights, Compare Hotels, Rent Cars
- Benefits list (no hidden fees, compare options, trusted partners)
- App screenshots placeholder area
- Download/signup CTA buttons
- FAQ section specific to customers

---

### 2. Driver Landing Page (`/drive`)

A recruitment-focused page to attract new drivers.

**Sections:**
- Hero with earnings-focused headline ("Drive with ZIVO. Earn on your schedule.")
- Earnings examples (e.g., "Drivers earn up to $X/week")
- How it works (3 steps: Sign up, Get approved, Start earning)
- Requirements list (valid license, vehicle, smartphone, background check)
- Benefits (flexible hours, weekly payouts, in-app support)
- Driver signup form (name, email, phone, city, vehicle type) with Zod validation
- FAQ section for driver-specific questions

---

### 3. Restaurant Marketing Page (`/for-restaurants`)

A page to attract restaurant partners, separate from the existing registration form.

**Sections:**
- Hero with growth-focused headline ("Reach more hungry customers with ZIVO Eats")
- Benefits cards (increased orders, easy management, fast payouts, marketing tools)
- How it works (3 steps: Apply, Set up menu, Start receiving orders)
- Dashboard preview section (feature highlights of the restaurant dashboard)
- Testimonial/social proof placeholder
- CTA button linking to existing `/restaurant-registration` form
- FAQ section for restaurant-specific questions

---

### 4. Route Registration

Add the three new routes to the app router:
- `/for-customers` renders CustomerLandingPage
- `/drive` renders DriverLandingPage
- `/for-restaurants` renders RestaurantMarketingPage

---

### Technical Details

- **Files to create:**
  - `src/pages/ForCustomers.tsx`
  - `src/pages/Drive.tsx`
  - `src/pages/ForRestaurants.tsx`

- **Patterns followed:**
  - Uses existing `Header`, `Footer`, `SEOHead`, `FAQSchema` components
  - Verdant theme with `Card`, `Badge`, `Button` from the UI library
  - Zod-validated lead capture form on the Driver page
  - Lucide icons in gradient containers (no raw emojis)
  - Mobile-first responsive layout with `rounded-2xl` card shapes
  - Framer Motion fade-in animations matching the home page pattern

- **SEO:**
  - Each page gets `SEOHead` with unique title, description, and canonical URL
  - Driver and Restaurant pages include `FAQSchema` for rich snippets

