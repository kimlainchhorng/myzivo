-- Add onboarding tracking and delivery configuration columns to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS onboarding_step int DEFAULT 1;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS zip text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS delivery_radius_miles numeric DEFAULT 5;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS min_order_cents int DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS delivery_fee_cents int DEFAULT 299;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS accepts_pickup boolean DEFAULT true;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS accepts_delivery boolean DEFAULT true;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS service_fee_percent numeric DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS auto_accept_orders boolean DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS prep_time_minutes int DEFAULT 20;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cuisine_type text;;
