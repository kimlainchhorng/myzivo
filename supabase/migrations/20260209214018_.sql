
-- Add targeting columns to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_city text;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_zone text;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_activity text;

-- Add engagement tracking columns to announcement_deliveries
ALTER TABLE public.announcement_deliveries ADD COLUMN IF NOT EXISTS opened_at timestamptz;
ALTER TABLE public.announcement_deliveries ADD COLUMN IF NOT EXISTS clicked_at timestamptz;
;
