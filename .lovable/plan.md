
# Enhanced Airlines Display with More Airlines and Premium UX/UI

## Overview
Upgrade all airline display sections across ZIVO with an expanded airline database (80+ airlines), modern premium card designs, smooth animations, and comprehensive fallback logo handling using the `AirlineLogo` component.

---

## 1. Expand Airline Database

### File: `src/data/airlines.ts`

Add 20+ new airlines across all categories:

**New Premium Airlines:**
| Code | Name | Alliance | Country |
|------|------|----------|---------|
| HU | Hainan Airlines | Star Alliance | China |
| TG | Thai Airways | Star Alliance | Thailand |
| OZ | Asiana Airlines | Star Alliance | South Korea |

**New Full-Service Airlines:**
| Code | Name | Alliance | Country |
|------|------|----------|---------|
| ET | Ethiopian Airlines | Star Alliance | Ethiopia |
| SU | Aeroflot | SkyTeam | Russia |
| CA | Air China | Star Alliance | China |
| MU | China Eastern | SkyTeam | China |
| CZ | China Southern | SkyTeam | China |
| SA | South African Airways | Star Alliance | South Africa |
| MS | EgyptAir | Star Alliance | Egypt |
| RJ | Royal Jordanian | Oneworld | Jordan |
| SV | Saudia | SkyTeam | Saudi Arabia |
| GF | Gulf Air | Oneworld | Bahrain |
| EI | Aer Lingus | Independent | Ireland |
| A3 | Aegean Airlines | Star Alliance | Greece |

**New Low-Cost Airlines:**
| Code | Name | Country |
|------|------|---------|
| DY | Norwegian | Norway |
| EW | Eurowings | Germany |
| HV | Transavia | Netherlands |
| LS | Jet2 | UK |
| TO | Transavia France | France |

---

## 2. New Premium Airline Trust Section

### File: `src/components/home/AirlineTrustSection.tsx`

Redesigned layout with:

```text
+------------------------------------------------------------------+
|               Trusted by 500+ Airlines Worldwide                  |
|        Compare prices across major carriers and alliances         |
+------------------------------------------------------------------+
|                                                                   |
| [Alliance Pills: ⭐ Star Alliance | ⭐ SkyTeam | ⭐ Oneworld]     |
|                                                                   |
| +------+ +------+ +------+ +------+ +------+ +------+            |
| | LOGO | | LOGO | | LOGO | | LOGO | | LOGO | | LOGO | ...        |
| |  AA  | |  DL  | |  UA  | |  EK  | |  QR  | |  SQ  | scroll -->  |
| +------+ +------+ +------+ +------+ +------+ +------+            |
|                                                                   |
| Infinite scroll carousel with hover glow effects                  |
+------------------------------------------------------------------+
```

Design Features:
- **Glass card design** with subtle backdrop blur
- **Horizontal scroll carousel** with momentum on mobile
- **Hover glow effect** with airline category colors (premium = amber, full-service = sky, low-cost = emerald)
- **48px+ touch targets** for mobile accessibility
- **Fade gradients** on edges for smooth infinite feel
- Use `AirlineLogo` component with proper fallback chain

---

## 3. New Airline Partners Grid Component

### File: `src/components/flight/AirlinePartnersGrid.tsx` (NEW)

Modern grid layout showing airlines by alliance:

```text
+------------------------------------------------------------------+
|  ⭐ Star Alliance            ⭐ SkyTeam           ⭐ Oneworld      |
+------------------------------------------------------------------+
| +--------+  +--------+     +--------+  +--------+  +--------+     |
| |  LOGO  |  |  LOGO  |     |  LOGO  |  |  LOGO  |  |  LOGO  |     |
| |   UA   |  |   LH   |     |   DL   |  |   AF   |  |   BA   |     |
| | United |  | Lufth. |     | Delta  |  |Air Fra.|  |British |     |
| +--------+  +--------+     +--------+  +--------+  +--------+     |
|                                                                   |
| +--------+  +--------+     +--------+  +--------+  +--------+     |
| |  LOGO  |  |  LOGO  |     |  LOGO  |  |  LOGO  |  |  LOGO  |     |
| |   SQ   |  |   NH   |     |   KL   |  |   AM   |  |   QR   |     |
| |Singap. |  |  ANA   |     |  KLM   |  |Aeromex.|  | Qatar  |     |
| +--------+  +--------+     +--------+  +--------+  +--------+     |
+------------------------------------------------------------------+
| [View All 80+ Airlines]                                           |
+------------------------------------------------------------------+
```

Features:
- **Tab navigation** by alliance (All | Star Alliance | SkyTeam | Oneworld | Independent)
- **Responsive grid**: 3 cols mobile, 4 cols tablet, 6 cols desktop
- **Premium badge** for 5-star airlines (crown icon)
- **Hover scale + shadow** animation
- **Staggered fade-in** on scroll into view

---

## 4. Enhanced Airline Logo Card Component

### File: `src/components/flight/AirlineLogoCard.tsx` (NEW)

Reusable card with premium styling:

```text
+------------------------+
|  [Crown for Premium]   |
| +--------------------+ |
| |                    | |
| |    AIRLINE LOGO    | |
| |      (48x48)       | |
| |                    | |
| +--------------------+ |
|                        |
|     Airline Name       |
|     [SkyTeam]          |
+------------------------+
```

Props:
- `airline: Airline` - Airline data object
- `size?: 'sm' | 'md' | 'lg'` - Card size variant
- `showAlliance?: boolean` - Show alliance badge
- `showCategory?: boolean` - Show premium/full-service/low-cost
- `interactive?: boolean` - Enable hover effects

Styling by category:
- **Premium**: Amber glow, crown badge, gradient border
- **Full-Service**: Sky blue accent, clean design
- **Low-Cost**: Emerald accent, value badge

---

## 5. Infinite Scroll Airlines Carousel

### File: `src/components/flight/AirlineLogosCarousel.tsx`

Upgrade existing carousel:
- **Fix marquee animation** for smoother looping
- **Add pause on hover** for accessibility
- **Increase logo count** to show all 80+ airlines
- **Add loading states** with skeleton shimmer
- **Optimize with virtualization** for performance

---

## 6. Update Components to Use New Airline Data

### Files to Modify:

| File | Change |
|------|--------|
| `FlightAirlinePartners.tsx` | Use expanded airline list, add tabs for alliances |
| `AirlinePartnersBadges.tsx` | Show 20 airlines instead of 14, use new card design |
| `PopularRoutesSection.tsx` | Already uses `AirlineLogo` - no change needed |
| `FlightPopularRoutes.tsx` | Already uses `AirlineLogo` - no change needed |
| `AirlinePartnersHub.tsx` | Add real logos via `AirlineLogo` component |

---

## 7. CSS Animations

### File: `src/index.css`

Add/update keyframes:

```css
/* Smooth marquee animations */
@keyframes marquee-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes marquee-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

/* Glow pulse for premium airlines */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
  50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.5); }
}

/* Staggered fade in */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/data/airlines.ts` | **Modify** | Add 20+ new airlines |
| `src/components/flight/AirlineLogoCard.tsx` | **Create** | Reusable premium airline card |
| `src/components/flight/AirlinePartnersGrid.tsx` | **Create** | Alliance-grouped grid display |
| `src/components/home/AirlineTrustSection.tsx` | **Modify** | Horizontal scroll carousel design |
| `src/components/flight/FlightAirlinePartners.tsx` | **Modify** | Use new grid, add tab filtering |
| `src/components/flight/AirlineLogosCarousel.tsx` | **Modify** | Smoother animation, more airlines |
| `src/components/flight/AirlinePartnersBadges.tsx` | **Modify** | Use new card component |
| `src/components/flight/AirlinePartnersHub.tsx` | **Modify** | Replace emoji with AirlineLogo |
| `src/index.css` | **Modify** | Add animation keyframes |

---

## Technical Details

### Logo Fallback Chain (via AirlineLogo component):
1. AVS CDN: `https://pics.avs.io/{size}/{size}/{CODE}.png`
2. Duffel SVG: `https://assets.duffel.com/img/airlines/.../full-color-lockup/{CODE}.svg`
3. UI Avatars: `https://ui-avatars.com/api/?name={CODE}&background=0ea5e9&color=fff`
4. Plane icon: Lucide `<Plane />` component

### Touch Target Requirements:
- Minimum 48px height/width for all interactive elements
- Adequate spacing (12px+) between touch targets

### Animation Performance:
- Use CSS transforms only (no layout-triggering properties)
- `will-change: transform` for smooth marquee
- Lazy loading for images outside viewport

---

## Acceptance Criteria

1. 80+ airlines displayed across premium, full-service, and low-cost categories
2. All airline logos load from AVS CDN with graceful fallbacks
3. Alliance filtering works correctly (Star Alliance, SkyTeam, Oneworld, Independent)
4. Premium airlines have distinct amber glow and crown badges
5. Carousel animates smoothly with pause-on-hover
6. Touch targets are 48px+ on mobile
7. Animations perform at 60fps with no jank
8. All components use the `AirlineLogo` component for consistent fallback handling
