

# ZIVO Homepage: AI-Generated Videos + UX/UI Polish

## Overview

Replace the copied hero video with AI-generated travel videos using Lovable AI (Gemini image model), delete the static MP4 file, and further polish the homepage UX/UI for a more premium 2026 feel.

## What Changes

### 1. Delete Static Hero Video
- Remove `src/assets/hero-video.mp4` from the project
- The hero section will use AI-generated images instead (video generation is not supported by current AI models, but we can generate stunning cinematic travel images)

### 2. AI-Generated Hero Images via Edge Function
Create a new edge function `generate-hero-image` that uses Lovable AI Gateway with the `google/gemini-2.5-flash-image` model to generate premium travel visuals on demand. The hero section will display a rotating set of AI-generated cinematic travel images (airplane at sunset, luxury hotel lobby, city skyline at night, etc.).

**How it works:**
- Edge function calls Lovable AI with image generation prompts
- Generated images are stored in Supabase Storage (`hero-images` bucket)
- Hero section fetches and displays them with smooth crossfade transitions
- Fallback to high-quality static Unsplash images if generation fails

### 3. Hero Section Restyle (HeroSection.tsx)
- Replace `<video>` element with an AI-generated image carousel using crossfade animation
- Add a shimmer/loading state while images generate
- Keep the split layout (text left, visual right on desktop)
- Add a subtle parallax scroll effect on the hero image
- Enhance the dark gradient overlays for more depth

### 4. UX/UI Polish Across Homepage

**NavBar improvements:**
- Add a subtle bottom border glow (green accent line) when scrolled
- Smoother dropdown animation with spring easing
- Slightly larger touch targets on nav items

**Hero Section enhancements:**
- Staggered text animation (headline, then subheadline, then buttons fade in sequentially)
- Buttons get a subtle hover glow effect (not just scale)
- "Track prices and get alerts" link gets an animated sparkle icon

**Destination Cards (DestinationShowcase):**
- Add a subtle glass overlay on hover with a "Explore" label
- Smoother image zoom on hover (scale 1.05 instead of 1.10)
- Add a small airplane icon next to "from $XX" price

**Why ZIVO Section:**
- Cards get a subtle border glow on hover (green accent)
- Icon containers get a gentle float animation
- Add a subtle background pattern/texture

**Trust Bar:**
- Add a gentle shimmer animation across the chips
- Slightly larger on desktop for better readability

**Sticky CTA Button:**
- Add a pulse ring animation to draw attention
- Slightly larger with more padding

### 5. Global CSS Additions (index.css)
- `.hero-image-crossfade` - smooth crossfade transition for hero images
- `.shimmer-loading` - premium loading shimmer effect
- `.glow-border-hover` - green border glow on hover
- `.float-gentle` - subtle floating animation for icons
- Enhanced `.glow-green-btn` with stronger glow on hover

## Technical Details

### New Files
| File | Purpose |
|------|---------|
| `supabase/functions/generate-hero-image/index.ts` | Edge function to generate travel images via Lovable AI |

### Modified Files
| File | Change |
|------|--------|
| `src/assets/hero-video.mp4` | DELETED |
| `src/components/home/HeroSection.tsx` | Replace video with AI image carousel, add staggered animations |
| `src/components/home/NavBar.tsx` | Add green accent border on scroll, smoother transitions |
| `src/components/home/DestinationShowcase.tsx` | Enhanced hover effects, glass overlay |
| `src/components/home/WhyBookWithZivo.tsx` | Glow borders, floating icons |
| `src/components/home/HeroTrustBar.tsx` | Shimmer effect, larger desktop sizing |
| `src/pages/Index.tsx` | Updated sticky CTA with pulse, remove video import |
| `src/index.css` | New animation utilities and effects |

### AI Image Generation Flow

```text
User visits homepage
       |
       v
Frontend checks Supabase Storage for cached hero images
       |
  [Images exist?]
    /        \
  Yes         No
   |           |
   v           v
Display    Call generate-hero-image edge function
cached     (uses Lovable AI + Gemini image model)
images          |
                v
           Save to Supabase Storage
                |
                v
           Display generated images
```

### Edge Function: generate-hero-image
- Uses `google/gemini-2.5-flash-image` model via Lovable AI Gateway
- Generates 3-4 premium travel scenes with prompts like:
  - "Cinematic aerial view of an airplane wing at golden hour over clouds, luxury travel photography, 16:9 aspect ratio"
  - "Premium hotel infinity pool overlooking a tropical ocean at sunset, travel magazine quality"
  - "Modern city skyline at night with dramatic lighting, travel destination photography"
- Stores base64 results in Supabase Storage bucket
- Returns public URLs to frontend

### Fallback Strategy
If AI generation fails or takes too long, the hero uses premium Unsplash images as fallback -- ensuring the page always looks great immediately on load.

### No Breaking Changes
- All existing routes and functionality preserved
- Mobile app home (AppHome) untouched
- Footer and compliance disclosures untouched
- Auth flows untouched

