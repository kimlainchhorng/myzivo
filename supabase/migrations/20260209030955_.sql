-- Add auto-pause configuration columns
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS auto_pause_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_pause_order_threshold INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS auto_pause_prep_threshold_minutes INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS auto_busy_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_busy_order_threshold INTEGER DEFAULT 10;;
