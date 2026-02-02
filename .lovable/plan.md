
# Multi-City & Region Controls (Driver-Only) - Implementation Plan

## Overview
Implement a scalable multi-city/region system for the ZIVO Driver App (Ride, Eats, Move services). This enables isolated operations per region with separate pricing, surge, bonuses, and admin visibility while ensuring drivers only see and receive jobs within their assigned region.

---

## Current System Analysis

### Existing Infrastructure
| Component | Current State |
|-----------|--------------|
| `drivers` table | Has location (lat/lng), service toggles, no region field |
| `trips` table | Has pickup/dropoff coords, no region field |
| `food_orders` table | Has delivery address, no region field |
| `ride_zones` table | Zone-based pricing by `city_name` and `zone_code` |
| `eats_zones` table | Zone-based pricing by `city_name` and `zone_code` |
| `launch_cities` table | P2P city launch tracking (city/state based) |
| Admin Panel | No region selector, shows all data globally |

### Integration Points
- Zone pricing already uses `city_name` for grouping
- City Launch module has state/city structure
- Driver modules show all drivers without region filtering

---

## Database Schema Changes

### 1. New Table: `regions`
Master table for all operational regions.

```sql
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- "Los Angeles Metro"
  city TEXT NOT NULL,                    -- "Los Angeles"
  state TEXT NOT NULL,                   -- "CA"
  country TEXT DEFAULT 'US',             -- "US"
  timezone TEXT DEFAULT 'America/Los_Angeles',
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  disabled_at TIMESTAMPTZ,               -- When region was disabled
  disabled_reason TEXT,                  -- Why region was disabled
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_city_state UNIQUE (city, state)
);

CREATE INDEX idx_regions_active ON regions(is_active);
CREATE INDEX idx_regions_city_state ON regions(city, state);
```

### 2. New Table: `region_settings`
Per-region configuration stored as JSONB for flexibility.

```sql
CREATE TABLE public.region_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  
  -- Commission Settings
  default_commission_pct NUMERIC(5,2) DEFAULT 20.00,
  eats_commission_pct NUMERIC(5,2) DEFAULT 25.00,
  move_commission_pct NUMERIC(5,2) DEFAULT 18.00,
  
  -- Dispatch Settings
  dispatch_mode TEXT DEFAULT 'auto' CHECK (dispatch_mode IN ('auto', 'broadcast', 'manual')),
  max_dispatch_radius_km NUMERIC(6,2) DEFAULT 10.00,
  broadcast_timeout_seconds INTEGER DEFAULT 30,
  
  -- Surge Settings
  surge_enabled BOOLEAN DEFAULT true,
  max_surge_multiplier NUMERIC(3,2) DEFAULT 3.00,
  
  -- Payout Settings
  payout_schedule TEXT DEFAULT 'weekly' CHECK (payout_schedule IN ('weekly', 'biweekly', 'instant')),
  minimum_payout_amount NUMERIC(10,2) DEFAULT 25.00,
  
  -- Service Toggles
  rides_enabled BOOLEAN DEFAULT true,
  eats_enabled BOOLEAN DEFAULT true,
  move_enabled BOOLEAN DEFAULT true,
  
  -- Additional Config
  config JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_region_settings UNIQUE (region_id)
);
```

### 3. New Table: `region_bonuses`
Track bonus campaigns per region.

```sql
CREATE TABLE public.region_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('trips_completed', 'earnings_goal', 'peak_hours', 'streak')),
  target_value INTEGER NOT NULL,        -- e.g., 20 trips
  bonus_amount NUMERIC(10,2) NOT NULL,  -- e.g., $50
  service_type TEXT CHECK (service_type IN ('rides', 'eats', 'move', 'all')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_region_bonuses_region ON region_bonuses(region_id);
CREATE INDEX idx_region_bonuses_active ON region_bonuses(is_active, starts_at, ends_at);
```

### 4. New Table: `region_change_logs`
Audit trail for region changes.

```sql
CREATE TABLE public.region_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('driver', 'region', 'settings')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,                  -- 'region_assigned', 'region_changed', 'region_disabled'
  old_region_id UUID REFERENCES regions(id),
  new_region_id UUID REFERENCES regions(id),
  changed_by UUID,                       -- Admin user ID
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_region_change_logs_entity ON region_change_logs(entity_type, entity_id);
```

### 5. Modify `drivers` Table
Add region assignment fields.

```sql
ALTER TABLE drivers
  ADD COLUMN region_id UUID REFERENCES regions(id),
  ADD COLUMN home_city TEXT,
  ADD COLUMN allowed_regions UUID[] DEFAULT '{}';

CREATE INDEX idx_drivers_region ON drivers(region_id);
```

### 6. Modify `trips` Table
Add region field for job scoping.

```sql
ALTER TABLE trips
  ADD COLUMN region_id UUID REFERENCES regions(id);

CREATE INDEX idx_trips_region ON trips(region_id);
```

### 7. Modify `food_orders` Table
Add region field for job scoping.

```sql
ALTER TABLE food_orders
  ADD COLUMN region_id UUID REFERENCES regions(id);

CREATE INDEX idx_food_orders_region ON food_orders(region_id);
```

### 8. New Table: `move_deliveries` (if not existing, add region)
Ensure Move (package delivery) jobs have region scoping.

```sql
-- Check if delivery_batches or similar exists, add:
ALTER TABLE delivery_batches
  ADD COLUMN region_id UUID REFERENCES regions(id);
```

---

## New Files to Create

```text
src/hooks/useRegions.ts                        - Region CRUD and queries
src/hooks/useRegionSettings.ts                 - Region settings management
src/hooks/useRegionBonuses.ts                  - Region bonus campaigns
src/pages/admin/modules/AdminRegionsModule.tsx - Region management admin UI
src/components/admin/RegionSelector.tsx        - Global region selector component
src/contexts/RegionContext.tsx                 - Region context for admin scoping
src/types/region.ts                            - TypeScript types for regions
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/AdminPanel.tsx` | Add region selector in header, region context |
| `src/pages/admin/modules/AdminDriversModule.tsx` | Filter by selected region |
| `src/pages/admin/modules/AdminRidesModule.tsx` | Filter trips by selected region |
| `src/pages/admin/modules/AdminEatsModule.tsx` | Filter food_orders by selected region |
| `src/pages/admin/modules/AdminMoveModule.tsx` | Filter deliveries by selected region |
| `src/pages/admin/modules/AdminFinanceModule.tsx` | Filter payouts by region |
| `src/hooks/useDrivers.ts` | Add region filtering support |
| `src/hooks/useTrips.ts` | Add region filtering support |
| `src/hooks/useEatsOrders.ts` | Add region filtering support |
| `src/hooks/useZonePricing.ts` | Link zones to regions |

---

## Implementation Details

### 1. types/region.ts

```typescript
export interface Region {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  currency: string;
  is_active: boolean;
  disabled_at: string | null;
  disabled_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegionSettings {
  id: string;
  region_id: string;
  default_commission_pct: number;
  eats_commission_pct: number;
  move_commission_pct: number;
  dispatch_mode: 'auto' | 'broadcast' | 'manual';
  max_dispatch_radius_km: number;
  broadcast_timeout_seconds: number;
  surge_enabled: boolean;
  max_surge_multiplier: number;
  payout_schedule: 'weekly' | 'biweekly' | 'instant';
  minimum_payout_amount: number;
  rides_enabled: boolean;
  eats_enabled: boolean;
  move_enabled: boolean;
  config: Record<string, any>;
}

export interface RegionBonus {
  id: string;
  region_id: string;
  name: string;
  description: string | null;
  bonus_type: 'trips_completed' | 'earnings_goal' | 'peak_hours' | 'streak';
  target_value: number;
  bonus_amount: number;
  service_type: 'rides' | 'eats' | 'move' | 'all' | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export interface RegionWithSettings extends Region {
  settings?: RegionSettings;
}
```

### 2. RegionContext.tsx

```typescript
interface RegionContextType {
  selectedRegionId: string | null;        // null = "All Regions" (super admin)
  selectedRegion: Region | null;
  setSelectedRegionId: (id: string | null) => void;
  regions: Region[];
  isLoading: boolean;
  isSuperAdmin: boolean;
}

export const RegionContext = createContext<RegionContextType>(...);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const { data: regions, isLoading } = useRegions();
  const { isAdmin } = useAuth();
  
  // For now, all admins are super admins
  const isSuperAdmin = isAdmin;
  
  const selectedRegion = regions?.find(r => r.id === selectedRegionId) || null;
  
  return (
    <RegionContext.Provider value={{
      selectedRegionId,
      selectedRegion,
      setSelectedRegionId,
      regions: regions || [],
      isLoading,
      isSuperAdmin,
    }}>
      {children}
    </RegionContext.Provider>
  );
}
```

### 3. RegionSelector.tsx (Admin Header Component)

```typescript
export function RegionSelector() {
  const { selectedRegionId, setSelectedRegionId, regions, isSuperAdmin } = useRegion();
  
  return (
    <Select value={selectedRegionId || "all"} onValueChange={(v) => setSelectedRegionId(v === "all" ? null : v)}>
      <SelectTrigger className="w-48">
        <MapPin className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Select Region" />
      </SelectTrigger>
      <SelectContent>
        {isSuperAdmin && (
          <SelectItem value="all">
            <span className="font-medium">All Regions</span>
          </SelectItem>
        )}
        {regions.filter(r => r.is_active).map(region => (
          <SelectItem key={region.id} value={region.id}>
            {region.city}, {region.state}
          </SelectItem>
        ))}
        {isSuperAdmin && (
          <>
            <Separator className="my-1" />
            {regions.filter(r => !r.is_active).map(region => (
              <SelectItem key={region.id} value={region.id} className="text-muted-foreground">
                {region.city}, {region.state} (Disabled)
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
```

### 4. useRegions.ts Hook

```typescript
// Fetch all regions
export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*, region_settings(*)")
        .order("city");
      if (error) throw error;
      return data as RegionWithSettings[];
    },
  });
}

// Create region
export function useCreateRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>) => {
      // Create region
      const { data: newRegion, error: regionError } = await supabase
        .from("regions")
        .insert(region)
        .select()
        .single();
      if (regionError) throw regionError;
      
      // Create default settings
      const { error: settingsError } = await supabase
        .from("region_settings")
        .insert({ region_id: newRegion.id });
      if (settingsError) throw settingsError;
      
      return newRegion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region created");
    },
  });
}

// Disable region (stops dispatch immediately)
export function useDisableRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ regionId, reason }: { regionId: string; reason?: string }) => {
      // Update region
      const { error } = await supabase
        .from("regions")
        .update({ 
          is_active: false, 
          disabled_at: new Date().toISOString(),
          disabled_reason: reason,
        })
        .eq("id", regionId);
      if (error) throw error;
      
      // Force all drivers in region offline
      await supabase
        .from("drivers")
        .update({ is_online: false })
        .eq("region_id", regionId);
      
      // Log the change
      await supabase
        .from("region_change_logs")
        .insert({
          entity_type: "region",
          entity_id: regionId,
          action: "region_disabled",
          reason,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Region disabled - all drivers forced offline");
    },
  });
}

// Move driver between regions (super admin only)
export function useMoveDriverToRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      driverId, 
      newRegionId, 
      reason 
    }: { 
      driverId: string; 
      newRegionId: string; 
      reason?: string;
    }) => {
      // Get current region
      const { data: driver } = await supabase
        .from("drivers")
        .select("region_id")
        .eq("id", driverId)
        .single();
      
      // Update driver
      const { error } = await supabase
        .from("drivers")
        .update({ region_id: newRegionId, is_online: false })
        .eq("id", driverId);
      if (error) throw error;
      
      // Log the change
      await supabase
        .from("region_change_logs")
        .insert({
          entity_type: "driver",
          entity_id: driverId,
          action: "region_changed",
          old_region_id: driver?.region_id,
          new_region_id: newRegionId,
          reason,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver moved to new region");
    },
  });
}
```

### 5. AdminRegionsModule.tsx

**Features:**
- List all regions with status badges
- Create new region dialog
- Region detail panel with settings
- Disable/enable region controls
- View region-specific stats
- Manage bonuses per region

```typescript
export default function AdminRegionsModule() {
  const { data: regions } = useRegions();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Regions
          </h1>
          <p className="text-muted-foreground">Manage operational regions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Region
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="Total Regions" value={regions?.length || 0} />
        <StatsCard label="Active" value={regions?.filter(r => r.is_active).length || 0} variant="success" />
        <StatsCard label="Disabled" value={regions?.filter(r => !r.is_active).length || 0} variant="warning" />
        <StatsCard label="Total Drivers" value={driverCount} />
      </div>
      
      {/* Region List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions?.map(region => (
          <RegionCard 
            key={region.id}
            region={region}
            onClick={() => setSelectedRegion(region)}
          />
        ))}
      </div>
      
      {/* Region Detail Panel */}
      {selectedRegion && (
        <RegionDetailPanel 
          region={selectedRegion}
          onClose={() => setSelectedRegion(null)}
        />
      )}
    </div>
  );
}
```

### 6. AdminPanel.tsx Updates

Add region context and selector to header:

```typescript
export default function AdminPanel() {
  return (
    <RegionProvider>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 border-r ...">
          <NavContent />
        </aside>

        <div className="flex-1 flex flex-col">
          {/* Header with Region Selector */}
          <header className="hidden md:flex h-14 border-b items-center justify-between px-6">
            <RegionSelector />
            <div className="flex items-center gap-2">
              {/* Notifications, etc */}
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            {renderModule()}
          </main>
        </div>
      </div>
    </RegionProvider>
  );
}
```

### 7. AdminDriversModule.tsx Updates

Filter drivers by selected region:

```typescript
export default function AdminDriversModule() {
  const { selectedRegionId } = useRegion();
  const { data: drivers } = useDrivers({ regionId: selectedRegionId });
  
  // Show region column when "All Regions" selected
  const showRegionColumn = !selectedRegionId;
  
  // Add "Move to Region" action for super admin
  // ...
}
```

### 8. useDrivers.ts Updates

Add region filtering:

```typescript
export const useDrivers = (options?: { regionId?: string | null }) => {
  return useQuery({
    queryKey: ["drivers", options?.regionId],
    queryFn: async () => {
      let query = supabase
        .from("drivers")
        .select("*, regions(name, city, state)")
        .order("created_at", { ascending: false });
      
      // Filter by region if specified
      if (options?.regionId) {
        query = query.eq("region_id", options.regionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
```

---

## Dispatch Scoping (Critical Safety Rule)

### Dispatch Logic Requirements
When dispatching jobs (rides, food orders, move deliveries):

1. **Job must have region_id** - Set at job creation based on pickup location
2. **Filter eligible drivers by region** - `driver.region_id === job.region_id`
3. **Apply region-specific settings**:
   - Surge multiplier from region settings
   - Dispatch radius from region settings
   - Commission rate from region settings

### Pseudocode for Dispatch

```typescript
async function dispatchJob(jobId: string, jobType: 'ride' | 'eats' | 'move') {
  // 1. Get job with region
  const job = await getJob(jobId, jobType);
  if (!job.region_id) throw new Error("Job must have region_id");
  
  // 2. Check region is active
  const region = await getRegion(job.region_id);
  if (!region.is_active) throw new Error("Region is disabled");
  
  // 3. Get region settings
  const settings = await getRegionSettings(job.region_id);
  
  // 4. Find eligible drivers (CRITICAL: filter by region)
  const eligibleDrivers = await supabase
    .from("drivers")
    .select("*")
    .eq("region_id", job.region_id)  // <-- CRITICAL FILTER
    .eq("is_online", true)
    .eq("status", "verified")
    .eq(serviceEnabled(jobType), true);
  
  // 5. Filter by distance within region
  const nearbyDrivers = eligibleDrivers.filter(d => 
    calculateDistance(d.lat, d.lng, job.pickup_lat, job.pickup_lng) <= settings.max_dispatch_radius_km
  );
  
  // 6. Dispatch based on mode
  if (settings.dispatch_mode === 'auto') {
    // Auto-assign to nearest driver
  } else if (settings.dispatch_mode === 'broadcast') {
    // Broadcast to all nearby drivers with timeout
  }
}
```

---

## Driver App UX Changes

### Profile Screen Updates
Show current region and info message:

```tsx
// In DriverProfile.tsx or similar
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <MapPin className="w-5 h-5" />
      Your Region
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-lg font-medium">{driver.region?.city}, {driver.region?.state}</p>
    <p className="text-sm text-muted-foreground mt-1">
      You receive jobs only in this region.
    </p>
  </CardContent>
</Card>
```

### Region Disabled State
When driver's region is disabled, show message and prevent going online:

```typescript
// In driver online toggle logic
const canGoOnline = () => {
  if (!driver.region_id) return false;
  if (!driver.region?.is_active) return false;
  return true;
};

// Show message when region disabled
{!driver.region?.is_active && (
  <Alert variant="destructive">
    <AlertCircle className="w-4 h-4" />
    <AlertTitle>Service Unavailable</AlertTitle>
    <AlertDescription>
      Service is temporarily unavailable in your city. 
      Please check back later or contact support.
    </AlertDescription>
  </Alert>
)}
```

---

## Admin Reporting by Region

Add region filter to all report queries:

```typescript
// Example: Get region stats
async function getRegionStats(regionId: string) {
  const [drivers, trips, orders, payouts] = await Promise.all([
    supabase.from("drivers").select("*", { count: "exact", head: true }).eq("region_id", regionId),
    supabase.from("trips").select("fare_amount").eq("region_id", regionId).eq("status", "completed"),
    supabase.from("food_orders").select("total").eq("region_id", regionId).eq("status", "delivered"),
    supabase.from("driver_withdrawals").select("amount").eq("status", "completed")
      .in("driver_id", subquery), // drivers in region
  ]);
  
  return {
    activeDrivers: drivers.count,
    completedTrips: trips.data?.length,
    revenue: trips.data?.reduce((sum, t) => sum + t.fare_amount, 0),
    payoutTotal: payouts.data?.reduce((sum, p) => sum + p.amount, 0),
  };
}
```

---

## Safety Rules Summary

| Rule | Implementation |
|------|---------------|
| Jobs cannot change region after creation | No UPDATE on region_id after INSERT |
| Drivers cannot self-switch regions | No RLS policy allowing driver to update region_id |
| All region changes logged | Trigger on drivers.region_id change inserts to region_change_logs |
| Region disable stops dispatch immediately | is_active = false forces all drivers offline |
| No cross-city dispatch | Dispatch query always includes `WHERE region_id = job.region_id` |

---

## Database Migration Summary

```sql
-- 1. Create regions table
CREATE TABLE public.regions (...);

-- 2. Create region_settings table
CREATE TABLE public.region_settings (...);

-- 3. Create region_bonuses table
CREATE TABLE public.region_bonuses (...);

-- 4. Create region_change_logs table
CREATE TABLE public.region_change_logs (...);

-- 5. Add region_id to drivers
ALTER TABLE drivers ADD COLUMN region_id UUID REFERENCES regions(id);
ALTER TABLE drivers ADD COLUMN home_city TEXT;
ALTER TABLE drivers ADD COLUMN allowed_regions UUID[] DEFAULT '{}';

-- 6. Add region_id to trips
ALTER TABLE trips ADD COLUMN region_id UUID REFERENCES regions(id);

-- 7. Add region_id to food_orders
ALTER TABLE food_orders ADD COLUMN region_id UUID REFERENCES regions(id);

-- 8. Add region_id to delivery_batches
ALTER TABLE delivery_batches ADD COLUMN region_id UUID REFERENCES regions(id);

-- 9. Create indexes
CREATE INDEX idx_drivers_region ON drivers(region_id);
CREATE INDEX idx_trips_region ON trips(region_id);
CREATE INDEX idx_food_orders_region ON food_orders(region_id);

-- 10. Enable RLS
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_change_logs ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies
-- Regions: Admin can manage, drivers can read their assigned region
CREATE POLICY "Admin full access to regions" ON regions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Drivers can read active regions" ON regions FOR SELECT USING (is_active = true);

-- Region Settings: Admin only
CREATE POLICY "Admin full access to region_settings" ON region_settings FOR ALL USING (is_admin(auth.uid()));

-- Region Bonuses: Admin can manage, drivers can read active
CREATE POLICY "Admin full access to region_bonuses" ON region_bonuses FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Drivers can read active bonuses" ON region_bonuses FOR SELECT USING (is_active = true);

-- Change Logs: Admin only
CREATE POLICY "Admin full access to change logs" ON region_change_logs FOR ALL USING (is_admin(auth.uid()));

-- 12. Trigger to prevent driver self-updating region
CREATE OR REPLACE FUNCTION prevent_driver_region_self_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.region_id IS DISTINCT FROM NEW.region_id THEN
    IF NOT is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Drivers cannot change their own region';
    END IF;
    
    -- Log the change
    INSERT INTO region_change_logs (entity_type, entity_id, action, old_region_id, new_region_id, changed_by)
    VALUES ('driver', NEW.id, 'region_changed', OLD.region_id, NEW.region_id, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER driver_region_change_trigger
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION prevent_driver_region_self_update();
```

---

## Navigation Updates

Add to `navItems` in AdminPanel.tsx:

```typescript
{ id: "regions", label: "Regions", icon: Globe }
```

Add module case:

```typescript
case "regions":
  return <AdminRegionsModule />;
```

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/types/region.ts` | TypeScript types for regions |
| Create | `src/contexts/RegionContext.tsx` | Region context for admin scoping |
| Create | `src/hooks/useRegions.ts` | Region CRUD and queries |
| Create | `src/hooks/useRegionSettings.ts` | Region settings management |
| Create | `src/hooks/useRegionBonuses.ts` | Region bonus campaigns |
| Create | `src/components/admin/RegionSelector.tsx` | Global region selector |
| Create | `src/pages/admin/modules/AdminRegionsModule.tsx` | Region management UI |
| Modify | `src/pages/admin/AdminPanel.tsx` | Add region context, selector, nav item |
| Modify | `src/pages/admin/modules/AdminDriversModule.tsx` | Filter by region, move driver action |
| Modify | `src/pages/admin/modules/AdminRidesModule.tsx` | Filter by region |
| Modify | `src/pages/admin/modules/AdminEatsModule.tsx` | Filter by region |
| Modify | `src/pages/admin/modules/AdminMoveModule.tsx` | Filter by region |
| Modify | `src/pages/admin/modules/AdminFinanceModule.tsx` | Filter payouts by region |
| Modify | `src/hooks/useDrivers.ts` | Add region filtering |
| Modify | `src/hooks/useTrips.ts` | Add region filtering |
| Modify | `src/hooks/useEatsOrders.ts` | Add region filtering |
| Database | Migration | Create tables, add columns, RLS, triggers |

---

## Future Enhancements

1. **Temporary Region Switch**: Allow admin-approved temporary moves between regions
2. **Multi-Region Drivers**: Support drivers working in multiple adjacent regions
3. **Region Analytics Dashboard**: Deep dive into per-region performance
4. **Automated Surge by Region**: AI-driven surge based on regional demand
5. **Region Geofencing**: Automatic region detection based on GPS coordinates
