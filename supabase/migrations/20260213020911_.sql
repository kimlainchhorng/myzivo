
-- Add express delivery columns to food_orders
ALTER TABLE public.food_orders
ADD COLUMN IF NOT EXISTS is_express boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS express_fee_cents integer NOT NULL DEFAULT 0;

-- Add express delivery config to eats_zones
ALTER TABLE public.eats_zones
ADD COLUMN IF NOT EXISTS express_fee_cents integer NOT NULL DEFAULT 299,
ADD COLUMN IF NOT EXISTS express_time_reduction_percent integer NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS express_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS max_express_per_zone integer NOT NULL DEFAULT 10;
;
