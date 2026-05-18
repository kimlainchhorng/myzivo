-- Add bank_connected column to drivers table
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS bank_connected BOOLEAN DEFAULT false;;
