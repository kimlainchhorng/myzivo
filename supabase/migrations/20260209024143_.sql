-- Add use_auto_prep_time column to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS use_auto_prep_time boolean DEFAULT false;;
