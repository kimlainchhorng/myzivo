ALTER TABLE dispatch_settings
  ADD COLUMN IF NOT EXISTS eta_weight integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workload_weight integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zone_demand_weight integer DEFAULT 0;;
