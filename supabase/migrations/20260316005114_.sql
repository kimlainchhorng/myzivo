-- Add region_id to ride_zones so we can filter by country
ALTER TABLE public.ride_zones ADD COLUMN IF NOT EXISTS region_id uuid REFERENCES public.regions(id);

-- Find the Cambodia region or create one if needed
-- First, insert Phnom Penh districts as ride zones for Cambodia
INSERT INTO public.ride_zones (city_name, zone_code, base_fare, per_mile_rate, per_minute_rate, minimum_fare, booking_fee, service_fee_percent, standard_multiplier, xl_multiplier, premium_multiplier, surge_multiplier, is_active)
VALUES
  ('Chamkarmon', 'PNH-CKM', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Daun Penh', 'PNH-DP', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('7 Makara', 'PNH-7MK', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Toul Kork', 'PNH-TK', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Meanchey', 'PNH-MC', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Russey Keo', 'PNH-RK', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Sen Sok', 'PNH-SS', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Por Senchey', 'PNH-PS', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Chroy Changvar', 'PNH-CC', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Prek Pnov', 'PNH-PP', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Chbar Ampov', 'PNH-CA', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Kamboul', 'PNH-KB', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true),
  ('Phnom Penh (All)', 'PNH', 1.50, 0.80, 0.12, 2.00, 0.50, 15, 1.0, 1.3, 1.8, 1.0, true);

-- Add country column to ride_zones for easier filtering
ALTER TABLE public.ride_zones ADD COLUMN IF NOT EXISTS country text DEFAULT 'US';

-- Tag Phnom Penh zones as KH
UPDATE public.ride_zones SET country = 'KH' WHERE zone_code LIKE 'PNH%';;
