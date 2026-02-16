

# Add Accepted Vehicles List to the Drive Page

## Overview
Add a comprehensive "Accepted Vehicles" accordion section to the `/drive` page, inspired by the Lyft reference screenshots. This will show prospective drivers exactly which car makes and models qualify for each ZIVO service tier (Standard, Extra Comfort, Black, XL).

## New Component: `src/components/drive/AcceptedVehiclesList.tsx`

A standalone component containing:

### Data Structure
A static data file (`src/data/acceptedVehicles.ts`) with the full vehicle list organized by make, each model entry including:
- Model name
- Minimum year
- Eligible tiers (array of tier tags like "Extra Comfort", "Black", "XL")

Covers all makes from the reference images: Acura, Audi, Bentley, BMW, Cadillac, Chevrolet, Dodge, Ford, Genesis, GMC, Honda, Hyundai, Infiniti, Jaguar, Jeep, Kia, Land Rover, Lexus, Lincoln, Lucid, Maserati, Mazda, Mercedes-Benz, Mitsubishi, Porsche, Rivian, Rolls-Royce, Tesla, Toyota, Volkswagen, Volvo.

### UI Design
- Section header with a Car icon badge and "Accepted Vehicles" title
- Search/filter bar at the top to quickly find a make or model
- Tier filter chips (All, Standard, Extra Comfort, Black, XL) to narrow by service level
- Radix Accordion with one item per make (alphabetically sorted)
  - Make name as the trigger (bold, dark text)
  - Collapsed by default; multiple can be open
  - Each model shown as: **MODEL NAME** - Year (Tier tags as small colored badges)
- Tier badge colors:
  - Standard: emerald/green
  - Extra Comfort: blue
  - Black: dark/slate
  - XL: purple
- Footnotes explaining tier eligibility criteria
- Matches ZIVO spatial design system (rounded-2xl cards, glassmorphism, Inter font)

### Integration
- Add the component to `src/pages/Drive.tsx` between the "Requirements" section and the "Benefits" section
- Wrapped in a framer-motion fade-in animation matching the existing page pattern

## Files

| File | Type | Description |
|------|------|-------------|
| `src/data/acceptedVehicles.ts` | New | Static data: all makes, models, years, and tier eligibility |
| `src/components/drive/AcceptedVehiclesList.tsx` | New | Accordion UI component with search and tier filters |
| `src/pages/Drive.tsx` | Edit | Import and render AcceptedVehiclesList between Requirements and Benefits |

## Technical Notes

- Uses Radix `Accordion` (already installed) for the collapsible make sections
- No database or API calls needed -- this is static reference data
- The search input filters both make names and model names in real time
- Tier filter chips use `useState` to toggle which tiers are shown
- Total vehicle count displayed in the section subtitle (e.g., "300+ accepted vehicles across 31 makes")
- Mobile-responsive: single column layout, full-width accordion items
