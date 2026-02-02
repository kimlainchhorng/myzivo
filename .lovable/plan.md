
# Pricing Strategy and Smart Price Suggestions - Implementation Plan

## Overview
Implement a transparent pricing system with category-based price recommendations for car owners, admin-configurable price limits, and clear price breakdowns for renters. This ensures competitive pricing, quality margins, and high booking conversion rates.

---

## Current System Analysis

### Existing Components
| Component | File | Status |
|-----------|------|--------|
| Vehicle Categories | `VehicleForm.tsx` | 8 categories defined |
| Daily Rate Input | `VehicleForm.tsx` | Min $20, no max or suggestions |
| Commission Settings | `AdminP2PCommissionModule.tsx` | Platform commission, service fee, insurance |
| Booking Pricing | `useP2PBooking.ts` | Calculates fees but no category-based guidance |
| Price Display | `P2PVehicleDetail.tsx` | Shows breakdown to renter |

### Gaps to Fill
1. **No price suggestions based on vehicle category**
2. **No min/max price limits per category**
3. **No admin panel for configuring price ranges**
4. **No estimated earnings display for owners**
5. **No "Insurance included" labeling for renters**
6. **Owner pricing form lacks guidance UI**

---

## Database Schema Changes

### New Table: `p2p_category_pricing`
Store recommended price ranges per vehicle category.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `category` | text | Vehicle category (economy, compact, etc.) |
| `min_daily_price` | numeric | Minimum allowed daily price |
| `suggested_daily_price` | numeric | Recommended daily price |
| `max_daily_price` | numeric | Maximum allowed daily price |
| `city` | text | Optional city-specific pricing (nullable for default) |
| `is_active` | boolean | Whether this pricing is active |
| `created_at` | timestamp | Record created |
| `updated_at` | timestamp | Last updated |

### Default Data to Seed

| Category | Min | Suggested | Max |
|----------|-----|-----------|-----|
| economy | $40 | $55 | $70 |
| compact | $40 | $55 | $70 |
| midsize | $55 | $75 | $90 |
| fullsize | $55 | $75 | $90 |
| suv | $70 | $95 | $120 |
| truck | $90 | $125 | $160 |
| minivan | $70 | $95 | $120 |
| luxury | $110 | $150 | $200 |

### New System Setting
Add to `system_settings` table:

| Key | Value | Description |
|-----|-------|-------------|
| `p2p_price_suggestions_enabled` | `true` | Toggle price suggestions feature |

---

## New Files to Create

```
src/hooks/useCategoryPricing.ts      - Hooks for category pricing data
src/components/owner/PricingHelper.tsx - Smart pricing suggestion UI component
src/pages/admin/modules/AdminCategoryPricingModule.tsx - Admin pricing configuration
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/owner/VehicleForm.tsx` | Add smart pricing suggestions UI |
| `src/pages/p2p/P2PVehicleDetail.tsx` | Add "Insurance included" badge, cleaner breakdown |
| `src/pages/p2p/P2PBookingConfirmation.tsx` | Add insurance disclosure |
| `src/pages/admin/AdminPanel.tsx` | Add "Category Pricing" nav item |
| `src/hooks/useP2PCommission.ts` | Add earnings calculator helper |

---

## Implementation Details

### 1. useCategoryPricing.ts Hook

```typescript
// Types
interface CategoryPricing {
  id: string;
  category: string;
  min_daily_price: number;
  suggested_daily_price: number;
  max_daily_price: number;
  city: string | null;
  is_active: boolean;
}

// Fetch pricing for a specific category
export function useCategoryPricing(category: string, city?: string) {
  return useQuery({
    queryKey: ["categoryPricing", category, city],
    queryFn: async () => {
      // First try city-specific, fall back to default (null city)
      let query = supabase
        .from("p2p_category_pricing")
        .select("*")
        .eq("category", category)
        .eq("is_active", true);
      
      if (city) {
        query = query.or(`city.eq.${city},city.is.null`);
      } else {
        query = query.is("city", null);
      }
      
      const { data } = await query.order("city", { nullsLast: true }).limit(1);
      return data?.[0] || null;
    },
    enabled: !!category,
  });
}

// Fetch all category pricing (admin)
export function useAllCategoryPricing() {
  return useQuery({
    queryKey: ["allCategoryPricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("p2p_category_pricing")
        .select("*")
        .order("category");
      
      if (error) throw error;
      return data as CategoryPricing[];
    },
  });
}

// Admin: Update category pricing
export function useUpdateCategoryPricing() {
  // ... mutation to update p2p_category_pricing
}

// Admin: Create category pricing
export function useCreateCategoryPricing() {
  // ... mutation to create p2p_category_pricing
}
```

---

### 2. PricingHelper.tsx Component

A smart component that displays pricing guidance within the VehicleForm.

**Features:**
- Shows recommended price range for selected category
- Visual slider showing where owner's price falls
- Estimated earnings preview after commission
- Warning if price is outside recommended range

```tsx
interface PricingHelperProps {
  category: string;
  currentPrice: number;
  city?: string;
  onSuggestedClick?: (price: number) => void;
}

export function PricingHelper({ category, currentPrice, city, onSuggestedClick }: PricingHelperProps) {
  const { data: pricing } = useCategoryPricing(category, city);
  const { data: commission } = useP2PCommissionSettings();
  
  if (!pricing) return null;
  
  // Calculate position on range
  const range = pricing.max_daily_price - pricing.min_daily_price;
  const position = ((currentPrice - pricing.min_daily_price) / range) * 100;
  
  // Calculate estimated earnings (3-day trip example)
  const tripDays = 3;
  const subtotal = currentPrice * tripDays;
  const platformFee = subtotal * ((commission?.owner_commission_pct || 20) / 100);
  const ownerEarnings = subtotal - platformFee;
  
  // Determine if price is in range
  const isInRange = currentPrice >= pricing.min_daily_price && currentPrice <= pricing.max_daily_price;
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <span className="font-medium">Pricing Recommendation</span>
        </div>
        
        {/* Price Range Bar */}
        <div className="space-y-2">
          <div className="relative h-2 bg-muted rounded-full">
            <div 
              className="absolute h-full bg-gradient-to-r from-emerald-500 via-primary to-amber-500 rounded-full"
              style={{ left: '0%', right: '0%' }}
            />
            <div 
              className="absolute w-3 h-3 bg-foreground rounded-full -top-0.5 transform -translate-x-1/2"
              style={{ left: `${Math.max(0, Math.min(100, position))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${pricing.min_daily_price}/day</span>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-primary"
              onClick={() => onSuggestedClick?.(pricing.suggested_daily_price)}
            >
              ${pricing.suggested_daily_price} (suggested)
            </Button>
            <span>${pricing.max_daily_price}/day</span>
          </div>
        </div>
        
        {/* Warning if out of range */}
        {!isInRange && (
          <Alert variant="warning">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              {currentPrice < pricing.min_daily_price 
                ? `Minimum price for ${category} vehicles is $${pricing.min_daily_price}/day`
                : `Maximum price for ${category} vehicles is $${pricing.max_daily_price}/day`
              }
            </AlertDescription>
          </Alert>
        )}
        
        {/* Earnings Preview */}
        <div className="p-3 rounded-lg bg-background border">
          <p className="text-sm text-muted-foreground mb-1">
            Estimated earnings per {tripDays}-day trip:
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              ${ownerEarnings.toFixed(0)}
            </span>
            <span className="text-sm text-muted-foreground">
              after {commission?.owner_commission_pct || 20}% platform fee
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 3. VehicleForm.tsx Updates

Integrate the PricingHelper component into the Pricing section:

```tsx
// In Pricing Card section, add after CardHeader:
<CardContent className="space-y-4">
  {/* Smart Pricing Helper */}
  <PricingHelper
    category={form.watch("category")}
    currentPrice={form.watch("daily_rate")}
    city={form.watch("location_city")}
    onSuggestedClick={(price) => form.setValue("daily_rate", price)}
  />
  
  {/* Existing pricing fields... */}
  <div className="grid gap-4 md:grid-cols-3">
    {/* daily_rate, weekly_rate, monthly_rate fields */}
  </div>
</CardContent>

// Update zod schema to include category-based validation:
daily_rate: z.number()
  .min(20, "Daily rate must be at least $20")
  .max(500, "Daily rate cannot exceed $500"),
```

---

### 4. AdminCategoryPricingModule.tsx

Admin panel for managing category price ranges:

**Features:**
- Table showing all categories with their price ranges
- Inline editing for min/suggested/max prices
- City-specific overrides (optional)
- Toggle to enable/disable price suggestions globally

```tsx
export default function AdminCategoryPricingModule() {
  const { data: pricing, isLoading } = useAllCategoryPricing();
  const updatePricing = useUpdateCategoryPricing();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Category Pricing</h1>
        <p className="text-muted-foreground">
          Configure recommended price ranges for each vehicle category
        </p>
      </div>
      
      {/* Global Toggle */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Price Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Show recommended prices to owners when listing vehicles
              </p>
            </div>
            <Switch checked={suggestionsEnabled} onCheckedChange={toggleSuggestions} />
          </div>
        </CardContent>
      </Card>
      
      {/* Pricing Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Min ($)</TableHead>
              <TableHead>Suggested ($)</TableHead>
              <TableHead>Max ($)</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricing?.map((item) => (
              <CategoryPricingRow 
                key={item.id} 
                item={item} 
                onUpdate={updatePricing.mutate} 
              />
            ))}
          </TableBody>
        </Table>
      </Card>
      
      {/* Add City Override */}
      <Button variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add City-Specific Pricing
      </Button>
    </div>
  );
}
```

---

### 5. P2PVehicleDetail.tsx Updates

Enhance the renter pricing display with clearer labels:

```tsx
{/* In Pricing Breakdown section */}
{pricing && (
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span>Rental ({pricing.totalDays} days × ${pricing.dailyRate}/day)</span>
      <span>${pricing.subtotal.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-muted-foreground">
      <span>Service fee</span>
      <span>${pricing.serviceFee.toFixed(2)}</span>
    </div>
    {insuranceAccepted && (
      <div className="flex justify-between text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Insurance protection
        </span>
        <span>${pricing.insuranceFee.toFixed(2)}</span>
      </div>
    )}
    <div className="flex justify-between text-muted-foreground">
      <span>Taxes & fees</span>
      <span>${pricing.taxes.toFixed(2)}</span>
    </div>
    <Separator />
    <div className="flex justify-between font-semibold text-base">
      <span>Total</span>
      <span>${pricing.totalAmount.toFixed(2)}</span>
    </div>
  </div>
)}

{/* Add insurance badge */}
{insuranceAccepted && (
  <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600">
    <Shield className="w-3 h-3" />
    Insurance included during rental
  </Badge>
)}
```

---

### 6. AdminPanel.tsx Updates

Add Category Pricing nav item:

```typescript
// In navItems array, add under P2P section:
{ id: "category-pricing", label: "Category Pricing", icon: DollarSign }

// In renderModule switch:
case "category-pricing":
  return <AdminCategoryPricingModule />;
```

---

### 7. useP2PCommission.ts Enhancement

Add a helper function for owner earnings calculation:

```typescript
// Calculate owner earnings preview
export function calculateOwnerEarnings(
  dailyRate: number,
  days: number,
  commission: P2PCommissionSettings | null
): { subtotal: number; platformFee: number; earnings: number } {
  if (!commission) {
    return { subtotal: dailyRate * days, platformFee: 0, earnings: dailyRate * days };
  }
  
  const subtotal = dailyRate * days;
  const platformFee = subtotal * (commission.owner_commission_pct / 100);
  const earnings = subtotal - platformFee;
  
  return { subtotal, platformFee, earnings };
}
```

---

## Database Migration Summary

```sql
-- Create category pricing table
CREATE TABLE public.p2p_category_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  min_daily_price NUMERIC(10,2) NOT NULL,
  suggested_daily_price NUMERIC(10,2) NOT NULL,
  max_daily_price NUMERIC(10,2) NOT NULL,
  city TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_price_range CHECK (min_daily_price <= suggested_daily_price AND suggested_daily_price <= max_daily_price),
  CONSTRAINT positive_prices CHECK (min_daily_price > 0)
);

-- Create unique index for category + city combination
CREATE UNIQUE INDEX idx_category_pricing_unique ON p2p_category_pricing (category, COALESCE(city, '__default__'));

-- Create index for lookups
CREATE INDEX idx_category_pricing_category ON p2p_category_pricing(category);

-- Seed default pricing data
INSERT INTO p2p_category_pricing (category, min_daily_price, suggested_daily_price, max_daily_price)
VALUES
  ('economy', 40, 55, 70),
  ('compact', 40, 55, 70),
  ('midsize', 55, 75, 90),
  ('fullsize', 55, 75, 90),
  ('suv', 70, 95, 120),
  ('truck', 90, 125, 160),
  ('minivan', 70, 95, 120),
  ('luxury', 110, 150, 200);

-- Add system setting for toggling price suggestions
INSERT INTO system_settings (key, value, description, category, is_public)
VALUES ('p2p_price_suggestions_enabled', 'true', 'Show price suggestions to owners', 'p2p', false)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE p2p_category_pricing ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read active pricing
CREATE POLICY "Anyone can read active category pricing"
  ON p2p_category_pricing FOR SELECT
  USING (is_active = true);

-- RLS: Admin full access
CREATE POLICY "Admin full access to category pricing"
  ON p2p_category_pricing FOR ALL
  USING (public.is_admin(auth.uid()));
```

---

## UI/UX Flow

```
Owner Adds Vehicle
        │
        ▼
┌──────────────────────────────────────────────┐
│  VehicleForm → Pricing Section               │
│                                              │
│  [Category: SUV selected]                    │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 💡 Pricing Recommendation              │  │
│  │                                        │  │
│  │  $70 ─────●───────────── $120          │  │
│  │  min     $95 (suggested)    max        │  │
│  │                                        │  │
│  │  📊 Estimated earnings per 3-day trip: │  │
│  │     $228 after 20% platform fee        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Daily Rate: [$__95___]                      │
│  Weekly Rate (optional): [_______]           │
│  Monthly Rate (optional): [_______]          │
│                                              │
└──────────────────────────────────────────────┘
```

```
Renter Views Vehicle
        │
        ▼
┌──────────────────────────────────────────────┐
│  Booking Sidebar                             │
│                                              │
│  $95/day                                     │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Rental (3 days × $95/day)    $285.00  │  │
│  │  Service fee                   $28.50  │  │
│  │  🛡️ Insurance protection       $45.00  │  │
│  │  Taxes & fees                  $22.80  │  │
│  │  ───────────────────────────────────── │  │
│  │  Total                        $381.30  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [🛡️ Insurance included during rental]       │
│                                              │
│  [ Book Now ]                                │
└──────────────────────────────────────────────┘
```

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/hooks/useCategoryPricing.ts` | Hooks for category pricing data |
| Create | `src/components/owner/PricingHelper.tsx` | Smart pricing suggestion component |
| Create | `src/pages/admin/modules/AdminCategoryPricingModule.tsx` | Admin pricing configuration |
| Modify | `src/components/owner/VehicleForm.tsx` | Integrate PricingHelper |
| Modify | `src/pages/p2p/P2PVehicleDetail.tsx` | Enhanced price breakdown, insurance badge |
| Modify | `src/pages/p2p/P2PBookingConfirmation.tsx` | Insurance disclosure text |
| Modify | `src/pages/admin/AdminPanel.tsx` | Add Category Pricing nav item |
| Modify | `src/hooks/useP2PCommission.ts` | Add earnings calculator helper |
| Database | Migration | Create p2p_category_pricing table with default data |

---

## Technical Considerations

1. **Validation**: VehicleForm should warn but not block prices outside range (owner flexibility)
2. **City-Specific Pricing**: Supports future market-based pricing adjustments
3. **Commission Sync**: Earnings preview uses live commission settings
4. **Caching**: Category pricing cached for 5 minutes to reduce DB calls
5. **Mobile UX**: PricingHelper collapses gracefully on smaller screens

---

## Future Enhancements

1. **Dynamic Pricing**: Adjust suggestions based on demand/season
2. **Market Analysis**: Show how owner's price compares to similar vehicles
3. **Price History**: Track price changes over time
4. **Revenue Optimizer**: AI-suggested pricing for maximum bookings
