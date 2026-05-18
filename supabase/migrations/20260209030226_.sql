-- Add item badge columns for recommended and popular items
ALTER TABLE public.square_items
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

-- Indexes for efficient featured item queries
CREATE INDEX IF NOT EXISTS idx_square_items_recommended 
ON public.square_items(is_recommended) WHERE is_recommended = true;

CREATE INDEX IF NOT EXISTS idx_square_items_popular 
ON public.square_items(is_popular) WHERE is_popular = true;;
