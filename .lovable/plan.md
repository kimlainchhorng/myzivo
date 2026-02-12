

## Add Onboarding Welcome Screens for First-Time Users

### Current Flow

```text
Login/Signup --> Email Verify --> /setup (profile form) --> / (Home)
```

### Proposed Flow

```text
Login/Signup --> Email Verify --> /onboarding (4 welcome slides) --> /setup (profile form) --> / (Home)
```

The onboarding carousel shows only once, before the profile setup form.

### Implementation

**1. New Page: `src/pages/Onboarding.tsx`**

A full-screen swipeable carousel with 4 slides:

| Slide | Title | Description | Icon |
|-------|-------|-------------|------|
| 1 | Ride Anywhere Easily | Your ride, one tap away | Car (Lucide) |
| 2 | Order Food & Delivery Fast | Meals and packages delivered | UtensilsCrossed |
| 3 | Book Flights, Hotels & Rentals | Travel the world with ZIVO | Plane |
| 4 | Earn Rewards & Save Money | Credits, cashback, and perks | Gift |

Features:
- Framer Motion `AnimatePresence` for smooth slide transitions
- Progress dots at the bottom (verdant green active dot)
- "Next" button advances slides (verdant green gradient)
- "Skip" text button in top-right corner jumps to the end
- Final slide shows "Get Started" button instead of "Next"
- Large centered Lucide icons inside verdant green gradient containers (matching 2026 Spatial UI)
- Clean white background, large readable text, rounded card shapes
- Completion stored in `localStorage` key `hizovo-onboarding-seen`

**2. Route Registration: `src/App.tsx`**

- Add lazy import for `Onboarding`
- Add route: `<Route path="/onboarding" element={<Onboarding />} />`
- Place it alongside other public auth routes (login, signup, verify)

**3. Redirect Logic: `src/components/auth/SetupRequiredRoute.tsx`**

After email verification passes and before the setup redirect, check if onboarding has been seen:
- If `localStorage.getItem("hizovo-onboarding-seen")` is falsy and setup is not complete, redirect to `/onboarding` instead of `/setup`
- The onboarding page itself navigates to `/setup` on completion

**4. Design Details**

- Verdant green gradient on icons: `bg-gradient-to-br from-primary to-emerald-400`
- Active dot: `bg-primary` (verdant green), inactive: `bg-muted`
- "Get Started" button: full-width verdant green gradient with shadow
- Skip button: subtle `text-muted-foreground` in corner
- Responsive: max-w-md centered, works on all screen sizes
- Dark mode compatible using semantic Tailwind classes (`bg-background`, `text-foreground`)

### Files Summary

| File | Action |
|------|--------|
| `src/pages/Onboarding.tsx` | New -- 4-slide welcome carousel |
| `src/App.tsx` | Add route for `/onboarding` |
| `src/components/auth/SetupRequiredRoute.tsx` | Add onboarding check before setup redirect |

### Technical Notes

- localStorage-based "seen" flag ensures the carousel never shows again, even across sessions
- No database column needed -- this is a lightweight UX enhancement, not a security gate
- The onboarding page is accessible without authentication (public route) so it loads instantly after email verification
- Framer Motion is already installed and used extensively throughout the app

