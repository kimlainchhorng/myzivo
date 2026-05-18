-- Add ZIVO control columns to existing Square tables
ALTER TABLE public.square_catalog_categories
  ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

ALTER TABLE public.square_items
  ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.square_item_variations
  ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

ALTER TABLE public.square_modifiers
  ADD COLUMN IF NOT EXISTS is_enabled boolean DEFAULT true;

-- Create item-modifier join table
CREATE TABLE IF NOT EXISTS public.square_item_modifier_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_merchant_id text NOT NULL,
  square_item_id text NOT NULL,
  square_modifier_list_id text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create unique constraint for upserts
CREATE UNIQUE INDEX IF NOT EXISTS square_item_modifier_lists_unique 
  ON public.square_item_modifier_lists(user_id, square_merchant_id, square_item_id, square_modifier_list_id);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_square_item_mod_lists_user 
  ON public.square_item_modifier_lists(user_id);

CREATE INDEX IF NOT EXISTS idx_square_item_mod_lists_item 
  ON public.square_item_modifier_lists(square_item_id);

CREATE INDEX IF NOT EXISTS idx_square_item_mod_lists_modifier 
  ON public.square_item_modifier_lists(square_modifier_list_id);

-- Enable RLS for new table
ALTER TABLE public.square_item_modifier_lists ENABLE ROW LEVEL SECURITY;

-- RLS policies for square_item_modifier_lists
CREATE POLICY "Users can view own item modifier lists"
  ON public.square_item_modifier_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own item modifier lists"
  ON public.square_item_modifier_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own item modifier lists"
  ON public.square_item_modifier_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own item modifier lists"
  ON public.square_item_modifier_lists FOR DELETE
  USING (auth.uid() = user_id);;
