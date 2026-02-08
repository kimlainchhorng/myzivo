

# Premium Light Map + Uber-Style UI Transformation

## Summary
Transform ZIVO Rides from dark theme to a clean, premium light map (like Uber) with enhanced markers, car icons, and a polished bottom sheet with blur/shadows.

---

## Current State vs Target

| Element | Current | Target |
|---------|---------|--------|
| **Map Style** | Dark navy (`#0b1220`) | Clean light gray/cream (`#f5f6f7`) |
| **Route Line** | Dark gray | Dark gray (keep - Uber style) |
| **POI/Transit** | Hidden | Hidden (keep) |
| **Water** | Dark blue | Light blue (`#dbeafe`) |
| **Roads** | Dark gray | White with subtle borders |
| **Bottom Sheet** | White, basic shadow | Frosted glass blur with premium shadow |
| **Ride Cards** | Small icon circle | Car image thumbnail (Uber style) |
| **CTA Button** | Black | Black (keep - correct) |

---

## Changes

### 1. Add Light Map Style (Uber-inspired)
**File: `src/components/maps/GoogleMap.tsx`**

Add a new light map style alongside the dark style:

```text
┌──────────────────────────────────────────┐
│ ZIVO_LIGHT_MAP_STYLE                     │
├──────────────────────────────────────────┤
│ geometry:        #f5f6f7 (cream/gray)    │
│ labels.text:     #111827 (dark gray)     │
│ roads:           #ffffff (white)         │
│ road.stroke:     #e5e7eb (light border)  │
│ water:           #dbeafe (soft blue)     │
│ poi/transit:     off (hidden)            │
└──────────────────────────────────────────┘
```

Update the `options` to conditionally use light or dark:
- When `darkMode={false}` → use `ZIVO_LIGHT_MAP_STYLE`
- When `darkMode={true}` → use existing `ZIVO_MAP_STYLE`

### 2. Update Rides.tsx to Use Light Map
**File: `src/pages/Rides.tsx`**

Change the GoogleMap prop from `darkMode={true}` to `darkMode={false}`:

```typescript
<GoogleMap
  // ...other props
  darkMode={false}  // Changed from true
/>
```

Update gradient overlay from dark to subtle light vignette:
```typescript
// Before
<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />

// After
<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)]" />
```

### 3. Premium Bottom Sheet Styling
**File: `src/pages/Rides.tsx`**

Update the bottom sheet container for glassmorphism:

```typescript
// Before
className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)]"

// After
className="rounded-t-[28px] bg-white/95 backdrop-blur-xl shadow-[0_-18px_40px_rgba(0,0,0,0.18)]"
```

Update handle bar styling:
```typescript
// Before
<div className="w-10 h-1 bg-zinc-300 rounded-full" />

// After
<div className="w-12 h-1.5 bg-zinc-300/80 rounded-full" />
```

### 4. Ride Cards with Car Thumbnails
**File: `src/pages/Rides.tsx`**

Replace the `CarIcon` component with actual car image thumbnails:

```typescript
// Before - Generic icon circle
function CarIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 shrink-0">
      <CarFront className="h-5 w-5 text-zinc-700" />
    </div>
  );
}

// After - Car thumbnail image
function RideImage({ type }: { type: string }) {
  // Use different car images based on type
  const imageMap: Record<string, string> = {
    wait_save: "/images/rides/standard.png",
    standard: "/images/rides/standard.png",
    green: "/images/rides/green.png",
    priority: "/images/rides/priority.png",
    comfort: "/images/rides/comfort.png",
    black: "/images/rides/black.png",
    black_suv: "/images/rides/suv.png",
    // ... etc
  };
  
  return (
    <img 
      src={imageMap[type] || "/images/rides/standard.png"}
      alt="Vehicle"
      className="w-14 h-10 object-contain shrink-0"
    />
  );
}
```

If no actual car images exist, use a premium styled fallback:
```typescript
function RideImage({ type }: { type: string }) {
  return (
    <div className="w-14 h-10 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg flex items-center justify-center shrink-0">
      <CarFront className="w-6 h-4 text-zinc-600" />
    </div>
  );
}
```

### 5. Selected Ride Card Styling (Premium)
**File: `src/pages/Rides.tsx`**

Update selected state from ring to thick border with shadow:

```typescript
// Before
className={`... ${isSelected ? "bg-zinc-100 ring-2 ring-zinc-900" : "hover:bg-zinc-50"}`}

// After
className={`... ${
  isSelected 
    ? "bg-zinc-50 border-2 border-black shadow-[0_10px_24px_rgba(0,0,0,0.12)]" 
    : "border border-transparent hover:bg-zinc-50"
}`}
```

### 6. Update Gradient Overlay in GoogleMap.tsx
**File: `src/components/maps/GoogleMap.tsx`**

For light mode, use subtle vignette instead of dark gradient:

```typescript
{/* ZIVO gradient overlay for premium look */}
<div className={cn(
  "pointer-events-none absolute inset-0",
  darkMode 
    ? "bg-gradient-to-b from-black/20 via-transparent to-black/60"
    : "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.04)_100%)]"
)} />
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/maps/GoogleMap.tsx` | Add `ZIVO_LIGHT_MAP_STYLE`, update overlay for light mode |
| `src/pages/Rides.tsx` | Switch to `darkMode={false}`, premium bottom sheet blur/shadow, car thumbnails, selected card styling |

---

## Visual Comparison

```text
BEFORE (Dark Theme):                    AFTER (Light Theme):
┌──────────────────────┐               ┌──────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │               │  ░░░░░░░░░░░░░░░░░░  │
│  ▓▓▓ Dark Map  ▓▓▓▓  │               │  ░░░ Light Map ░░░░  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │               │  ░░░░░░░░░░░░░░░░░░  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │               │  ░░░░░░░░░░░░░░░░░░  │
├──────────────────────┤               ├──────────────────────┤
│ ████ White Sheet ████│               │ ▒▒▒▒ Glass Sheet ▒▒▒▒│
│                      │               │   (blur + shadow)    │
│  [○] Standard  $24   │               │  [🚗] Standard  $24  │
│  [○] Priority  $32   │               │  [🚗] Priority  $32  │
│                      │               │                      │
│ [ Choose Standard ]  │               │ [ Choose Standard ]  │
└──────────────────────┘               └──────────────────────┘
```

---

## Technical Notes

### Light Map Style Rationale
- Uber uses `#f5f6f7` (very light gray) for base geometry
- Roads are pure white `#ffffff` with subtle gray stroke
- Water is soft blue `#dbeafe` (matches Tailwind blue-100)
- All POIs and transit hidden for cleaner look

### Glassmorphism Bottom Sheet
- `backdrop-blur-xl` creates iOS-style frosted glass effect
- `bg-white/95` allows background to subtly show through
- `shadow-[0_-18px_40px_rgba(0,0,0,0.18)]` creates premium depth

### Car Thumbnails
- Larger than current icon (56x40px vs 40x40px)
- Horizontal aspect ratio matches actual car silhouettes
- Can be replaced with actual vehicle images later

