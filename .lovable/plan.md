

# Simple Emoji-Style Ride Cards

## Overview
Replace the current 3D car images with a simple car emoji (🚗) for a clean, lightweight design that matches your provided code example.

---

## What Changes

### Current → New
- **Current**: External image URLs loaded via `<img>` tags
- **New**: Simple text emoji `🚗` in place of images

### Card Layout (Your Reference)
```
┌──────────────────────────────────────────────┐
│  🚗  │  ZivoX                       │ $25.94 │
│      │  4:51 PM · 11 min            │        │
│      │  Affordable rides all to...  │        │
└──────────────────────────────────────────────┘
```

---

## Technical Changes

### File: `src/pages/Rides.tsx`

**1. Remove Image Container & Replace with Emoji**

In both card locations (step "request" ~lines 698-705 and step "options" ~lines 796-799):

Replace:
```tsx
<div className="w-16 h-10 md:w-20 md:h-12 flex-shrink-0 flex items-center justify-center">
  <img src={ride.image} className="w-full h-full object-contain" alt={ride.name} />
</div>
```

With:
```tsx
<div className="text-3xl md:text-4xl mr-1">🚗</div>
```

**2. Also Update Confirm Step (~line 831-833)**

Replace the image in the confirmation card with the emoji:
```tsx
<div className="text-4xl md:text-5xl">🚗</div>
```

---

## Benefits
- No external image loading = faster load times
- No broken images if URLs change
- Simpler, cleaner aesthetic matching your reference
- Reduced bandwidth usage

---

## Files to Modify
- `src/pages/Rides.tsx` — Replace 3 image containers with emoji text

