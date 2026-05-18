
ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS is_group_order boolean DEFAULT false;
ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS participant_count integer;
;
