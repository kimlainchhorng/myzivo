

# Add "One App. Many Services" Value Proposition Section

## Overview
Create a new marketing section that highlights ZIVO's multi-service platform offering with clean, impactful messaging. This will reinforce the unified platform value and add a new "package delivery" service mention.

---

## Implementation Details

### 1. Create New Component: `OneAppSection.tsx`
**Location:** `src/components/home/OneAppSection.tsx`

A premium, visually appealing section featuring:
- **Headline:** "One app. Many services." with gradient styling
- **Three service bullets** with appropriate icons:
  - ✈️ Book flights, hotels, and rental cars worldwide
  - 🚗 Get rides, food delivery, and local transport
  - 📦 Move packages with trusted drivers
- **Closing tagline:** "ZIVO connects you to the best travel partners and local service providers — all in one place."
- **Visual treatment:** Glassmorphism cards with service icons, subtle animations

### 2. Design Specifications
- **Layout:** Centered text layout with icon-led bullet points
- **Colors:** Use existing service colors (flights, hotels, cars, rides, eats) for icons
- **Typography:** `font-display` for headline, `text-muted-foreground` for supporting text
- **Background:** Subtle gradient or muted background to distinguish from adjacent sections
- **Animation:** Fade-in slide-up on scroll using existing patterns

### 3. Integration Points

**Desktop Homepage (`src/pages/Index.tsx`):**
Place after the Services Grid section for reinforcement:
```text
HeroSection → GlobalTrustBar → ServicesGrid → OneAppSection → HowItWorksSimple → ...
```

**Mobile Homepage (`src/pages/app/AppHome.tsx`):**
Add a compact version below the Quick Actions Grid, above the Trust Strip.

---

## Technical Notes
- Component follows existing patterns from `WhyZivo.tsx` and `TrustSection.tsx`
- Uses existing Lucide icons: `Plane`, `Hotel`, `CarFront`, `Car`, `UtensilsCrossed`, `Package`
- Mobile-first responsive design with `sm:` and `lg:` breakpoints
- No new dependencies required

