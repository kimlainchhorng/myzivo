
# Plan: Implement ZivoHome Component Design

## Overview
Replace the current AppHome.tsx mobile home page with the new ZivoHome design you've shared. The new design features a cleaner layout with personalized greetings, profile avatar integration from the database, and an updated service grid.

## Key Changes

### 1. Profile Data Integration
- Use the existing `useUserProfile` hook instead of manual Supabase queries
- **Fix the bug in your code**: Change `.eq('id', user.id)` to `.eq('user_id', user.id)` - this matches the database schema
- Display the user's `avatar_url` and `full_name` from their profile

### 2. Updated Layout Structure
```text
┌─────────────────────────────┐
│  Header (Avatar + Name)     │
│  + Notification Bell        │
├─────────────────────────────┤
│  Promo Banner (Rides CTA)   │
├─────────────────────────────┤
│  Hero: "Explore the World"  │
│  + Search Bar               │
├─────────────────────────────┤
│  Services Grid (2x2)        │
│  Flights | Rides            │
│  Eats    | Move             │
├─────────────────────────────┤
│  Bottom Navigation          │
└─────────────────────────────┘
```

### 3. Components to Add/Update
- **ServiceCard** - Image background cards with gradient overlay
- **NavIcon** - Simple bottom navigation icons
- **Dynamic Greeting** - Based on time of day (already exists)

### 4. Styling Alignment
- Premium dark theme with `bg-[#0D0D0D]`
- Glassmorphic search bar with gradient glow
- Rounded corners and subtle borders
- Touch-optimized tap states

---

## Technical Implementation Details

### File Changes

**1. Update `src/pages/app/AppHome.tsx`**
- Replace content with the new ZivoHome layout
- Use `useUserProfile()` hook for profile data (already exists)
- Use `useAuth()` for authentication state
- Keep the existing `ZivoMobileNav` bottom navigation

### Key Code Fixes

**Profile Query Fix:**
```typescript
// WRONG (in your code)
.eq('id', user.id)

// CORRECT (matches database schema)
.eq('user_id', user.id)
```

**Recommended Approach - Use Existing Hook:**
```typescript
import { useUserProfile } from "@/hooks/useUserProfile";

const { data: profile, isLoading } = useUserProfile();
```

### Navigation Routes
- `/flights` → Flight search
- `/rides` → Ride booking
- `/eats` → Food delivery  
- `/move` → Package delivery
- `/profile` → Account settings

---

## What You'll See After Implementation
1. Personalized header with your profile avatar and name from the database
2. "Good Morning/Afternoon/Evening" greeting based on time
3. Prominent search bar with location picker
4. Clean 2x2 service grid with image backgrounds
5. Smooth transitions and premium visual styling
