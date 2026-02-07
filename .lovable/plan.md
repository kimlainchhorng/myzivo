
# Update Economy Rides Data

## Overview
This update will replace the current Economy ride options with your new set of 4 rides, each with its own colored badge indicator.

---

## Changes

### 1. Update Economy Rides Data

**File: `src/pages/Rides.tsx`** (lines 88-93)

Replace the current Economy rides with your new structure:

| Ride | Badge Color | Badge Label | ETA | Price Multiplier |
|------|-------------|-------------|-----|------------------|
| Wait & Save | Blue | Save | 15 min | 0.75 |
| Standard | Yellow | Standard | 4 min | 1.0 |
| Green | Emerald | Eco | 6 min | 1.02 |
| Priority | Orange | Fast | 1 min | 1.3 |

### 2. Update Tag System

**File: `src/pages/Rides.tsx`** (lines 62-82)

Update the `TagPill` component and tag mapping to include the new badge styles:

```text
wait_save  → Blue dot   → "Save"
standard   → Yellow dot → (no label, just standard indicator)
green      → Emerald dot → "Eco"  
priority   → Orange dot → "Fast"
```

### 3. Visual Badge Styling

Each ride card will show:
- A small colored dot indicator matching the badge color
- A text label next to the name (Save, Eco, Fast)
- Standard rides show the dot but no extra label

---

## Updated Data Structure

```typescript
Economy: [
  { 
    id: "wait_save", 
    name: "Wait & Save", 
    desc: "Lowest price, longer wait.", 
    seats: 4, 
    eta: 15, 
    multiplier: 0.75, 
    tag: "wait_save",
    badge: { dotClass: "bg-blue-400", label: "Save" }
  },
  { 
    id: "standard", 
    name: "Standard", 
    desc: "Reliable everyday rides.", 
    seats: 4, 
    eta: 4, 
    multiplier: 1.0, 
    tag: "standard",
    badge: { dotClass: "bg-yellow-400", label: "Standard" }
  },
  { 
    id: "green", 
    name: "Green", 
    desc: "EVs & Hybrids.", 
    seats: 4, 
    eta: 6, 
    multiplier: 1.02, 
    tag: "green",
    badge: { dotClass: "bg-emerald-400", label: "Eco" }
  },
  { 
    id: "priority", 
    name: "Priority", 
    desc: "Faster pickup.", 
    seats: 4, 
    eta: 1, 
    multiplier: 1.3, 
    tag: "priority",
    badge: { dotClass: "bg-orange-400", label: "Fast" }
  }
]
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Rides.tsx` | Update Economy array with new 4 rides, update TagPill styling |

---

## Result After Implementation

The Economy tab will show 4 ride options:
1. **Wait & Save** - Blue "Save" badge, 15 min ETA, lowest price
2. **Standard** - Yellow indicator, 4 min ETA, base price
3. **Green** - Emerald "Eco" badge, 6 min ETA, EVs & Hybrids
4. **Priority** - Orange "Fast" badge, 1 min ETA, premium for speed
