# Fix mismatched icons on the Software & Apps page

The current cards use icons that don't visually match the app's purpose. Update them to clearer, more recognizable Lucide icons.

## Icon swaps in `src/components/admin/store/SoftwareDownloadsSection.tsx`

| App | Current icon | New icon | Why |
|---|---|---|---|
| ZIVO Manager | `Briefcase` (suitcase) | `LayoutDashboard` | Reads as a control panel, matches "manager dashboard" |
| ZIVO Front Desk | `ConciergeBell` (tiny bell) | `BellRing` | Larger, clearer reception bell |
| ZIVO Housekeeping | `BedDouble` (bed) | `Brush` | Bed = rooms; Brush = cleaning, the actual task |
| ZIVO Driver | `Car` (small hatchback) | `Navigation` | Navigation arrow conveys driving/turn-by-turn |
| ZIVO Property Suite | `Building2` (generic building) | `Hotel` | Purpose-built hotel building icon |
| ZIVO POS | `ShoppingBag` | unchanged | Already correct |
| ZIVO Kitchen Display | `ChefHat` | unchanged | Already correct |
| Receipt Printer | `Printer` | unchanged | Already correct |
| Inventory Scanner | `ScanBarcode` | unchanged | Already correct |

## Changes required

1. Update the `lucide-react` import block at the top of the file — replace `Briefcase, ConciergeBell, BedDouble, Car, Building2` with `LayoutDashboard, BellRing, Brush, Navigation, Hotel`.
2. Update the five `icon:` fields in the `SOFTWARE_CATALOG` entries accordingly.

No other files change. Runtime behaviour, layout, and copy stay the same.
