

# ZIVO Homepage Premium Restyle

## Overview

Complete restyle of the ZIVO customer homepage to achieve a premium, global-brand-quality design (Uber/Booking/Expedia level). The user uploaded an MP4 video to use as the hero background media. The design will feature a split hero layout (text left, cinematic video right), neon green ZIVO accents, deep navy/charcoal tones, and smooth micro-animations throughout.

## What Changes

### 1. Hero Section Restyle (HeroSection.tsx)
- **Desktop**: Split layout -- left side has headline, subheadline, CTA buttons row, "Track prices" link, and trust badges; right side shows the uploaded MP4 video with a dark gradient overlay and subtle ZIVO green glow
- **Mobile**: Video stacks above content
- **Headline**: "Book Flights, Hotels, and Car Rentals -- All in One Place"
- **Subheadline**: "ZIVO helps you book travel with secure checkout and instant confirmation."
- **Buttons row**: "Book Flights" (filled green), "Book Hotels" (outline), "Book Car Rentals" (outline), "Book Rides" (outline)
- **Under buttons**: Small "Track prices and get alerts" link
- **Trust badges**: Secure Checkout, Instant Confirmation, 24/7 Customer Support, No Hidden Fees
- Copy the uploaded MP4 video to `src/assets/hero-video.mp4`

### 2. NavBar Restyle (NavBar.tsx)
- Deep charcoal/navy background with backdrop blur
- Left: ZIVO logo
- Center: Flights, Hotels, Cars, Help, More (existing), Rides/Eats/Move link
- Right: "Log in" (ghost) + "Sign up" (filled neon green button with glow)
- Smooth hover transitions on all nav items

### 3. Homepage Layout Simplification (Index.tsx - DesktopHomePage)
Streamline sections to match the requested layout:
1. Hero (restyled)
2. Popular Destinations (existing DestinationShowcase, restyled cards)
3. Best Deals carousel (RecommendedDealsSection, horizontal scroll)
4. Why ZIVO (WhyBookWithZivo, restyled as 4 feature cards)
5. Footer (existing, minor polish)

Remove or reorder excess sections (BentoFeatures, PrimaryServicesSection, HowItWorksSimple, AirlineTrustSection, etc.) to reduce clutter and match the clean premium layout requested.

### 4. Global Style Enhancements (index.css)
- Add ZIVO green glow utility classes for buttons and hero accents
- Add subtle green radial glow behind hero section
- Ensure dark theme uses deep navy (`--background: 222 47% 11%`) with proper contrast
- Add smooth section reveal animations (already using Framer Motion FadeInSection)

### 5. Trust Badges Restyle (HeroTrustBar.tsx)
- Styled as small chips/cards with checkmark icons
- White text on transparent glass backgrounds
- Subtle green accent on icons

### 6. Sign Up Button Glow
- NavBar "Sign up" button gets neon green fill with a soft green glow shadow (`shadow-[0_0_20px_rgba(34,197,94,0.3)]`)

---

## Technical Details

### Files Modified
| File | Change |
|------|--------|
| `src/assets/hero-video.mp4` | NEW -- copy uploaded MP4 video |
| `src/components/home/HeroSection.tsx` | Full restyle: split layout with video, new button row, green glow accents |
| `src/components/home/NavBar.tsx` | Restyle: darker bg, green Sign up button with glow, cleaner nav spacing |
| `src/components/home/HeroTrustBar.tsx` | Restyle as premium glass chips |
| `src/components/home/WhyBookWithZivo.tsx` | Add 4th card, update to match premium dark/white aesthetic |
| `src/pages/Index.tsx` | Simplify section order: Hero, Destinations, Deals, Why ZIVO, Footer |
| `src/index.css` | Add green glow utilities, hero glow background class |

### Key Design Tokens
- **Neon green accent**: existing `--primary: 142 71% 45%` (Verdant Green) -- already in place
- **Button glow**: `shadow-primary/30` + `hover:shadow-primary/50`
- **Hero video overlay**: `bg-gradient-to-l from-transparent to-background/30` + subtle green radial glow
- **Typography**: Inter (already configured), bold headlines, clean body text
- **Border radius**: 12-16px (`rounded-xl` to `rounded-2xl`)
- **Micro-animations**: Framer Motion `whileInView` fade-in, button `hover:scale-[1.03]`, nav item transitions

### No Breaking Changes
- All existing routes and functionality preserved
- Mobile app home (AppHome) untouched
- Footer compliance disclosures untouched
- Auth flows untouched

