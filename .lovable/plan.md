

# Plan: Optimize Mobile Home for No-Scroll Experience

## Overview
Adjust the AppHome layout so all content fits within the mobile viewport without requiring scrolling. This creates a native app-like experience where all services are immediately visible.

## Current Issue
The current layout has significant vertical spacing that pushes content below the fold:
- Top bar with gradient (padding: `p-6`)
- Live Activity Island (at `top-24`)
- Hero section (starts at `pt-48`, has `mb-8` gaps)
- Large service cards (`h-32` = 128px each)
- Bottom nav area (`pb-32` = 128px)

**Total content height exceeds typical mobile screens (667px - 812px)**

---

## Changes

### 1. Reduce Top Bar & Live Activity Spacing
- Reduce top bar padding from `p-6` to `p-4`
- Move Live Activity Island from `top-24` to `top-16`

### 2. Compress Hero Section  
- Reduce hero padding from `pt-48` to `pt-36`
- Reduce title size from `text-4xl` to `text-2xl`
- Reduce margin below subtitle from `mb-8` to `mb-4`
- Make search bar slightly smaller (reduce padding from `p-4` to `p-3`)

### 3. Shrink Service Cards
- Reduce main grid cards from `h-32` (128px) to `h-24` (96px)
- Reduce Hotels row height from `h-28` to `h-20`
- Reduce grid gap from `gap-3` to `gap-2`

### 4. Reduce Bottom Padding
- Change bento grid section padding from `pb-32` to `pb-24`

### 5. Hide Services Header Row
- Remove "Services" label and "View All" button to save vertical space

---

## Technical Details

**File: `src/pages/app/AppHome.tsx`**

| Section | Current | New |
|---------|---------|-----|
| Top bar | `p-6` | `p-4` |
| Live Island | `top-24` | `top-16` |
| Hero section | `pt-48` | `pt-36` |
| Title | `text-4xl` | `text-2xl` |
| Subtitle margin | `mb-8` | `mb-4` |
| Search bar | `p-4` | `p-3` |
| Grid gap | `gap-3` | `gap-2` |
| Service cards | `h-32` | `h-24` |
| Hotels card | `h-28` | `h-20` |
| Section padding | `pb-32` | `pb-24` |

---

## Expected Result
All home screen content (greeting, Live Activity, search bar, 6 service cards, and bottom nav) will be visible on a single screen without scrolling on most mobile devices (iPhone SE to iPhone 15 Pro Max).

