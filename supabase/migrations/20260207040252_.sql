-- Create option_groups table
CREATE TABLE IF NOT EXISTS public.option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  min_select INTEGER DEFAULT 0,
  max_select INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create options table
CREATE TABLE IF NOT EXISTS public.options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id UUID NOT NULL REFERENCES public.option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_delta NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create item_option_groups junction table
CREATE TABLE IF NOT EXISTS public.item_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  option_group_id UUID NOT NULL REFERENCES public.option_groups(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(menu_item_id, option_group_id)
);

-- Enable RLS on all tables
ALTER TABLE public.option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_option_groups ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_option_groups_restaurant ON public.option_groups(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_options_group ON public.options(option_group_id);
CREATE INDEX IF NOT EXISTS idx_item_option_groups_item ON public.item_option_groups(menu_item_id);

-- RLS Policies for option_groups
CREATE POLICY "option_groups_select_own" ON public.option_groups
FOR SELECT USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "option_groups_insert_own" ON public.option_groups
FOR INSERT WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "option_groups_update_own" ON public.option_groups
FOR UPDATE USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()))
WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "option_groups_delete_own" ON public.option_groups
FOR DELETE USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- RLS Policies for options (via option_group join)
CREATE POLICY "options_select_own" ON public.options
FOR SELECT USING (
  option_group_id IN (
    SELECT og.id FROM public.option_groups og
    JOIN public.restaurants r ON r.id = og.restaurant_id
    WHERE r.owner_id = auth.uid()
  )
);

CREATE POLICY "options_insert_own" ON public.options
FOR INSERT WITH CHECK (
  option_group_id IN (
    SELECT og.id FROM public.option_groups og
    JOIN public.restaurants r ON r.id = og.restaurant_id
    WHERE r.owner_id = auth.uid()
  )
);

CREATE POLICY "options_update_own" ON public.options
FOR UPDATE USING (
  option_group_id IN (
    SELECT og.id FROM public.option_groups og
    JOIN public.restaurants r ON r.id = og.restaurant_id
    WHERE r.owner_id = auth.uid()
  )
)
WITH CHECK (
  option_group_id IN (
    SELECT og.id FROM public.option_groups og
    JOIN public.restaurants r ON r.id = og.restaurant_id
    WHERE r.owner_id = auth.uid()
  )
);

CREATE POLICY "options_delete_own" ON public.options
FOR DELETE USING (
  option_group_id IN (
    SELECT og.id FROM public.option_groups og
    JOIN public.restaurants r ON r.id = og.restaurant_id
    WHERE r.owner_id = auth.uid()
  )
);

-- RLS Policies for item_option_groups (via menu_item join)
CREATE POLICY "item_option_groups_select_own" ON public.item_option_groups
FOR SELECT USING (
  menu_item_id IN (
    SELECT mi.id FROM public.menu_items mi
    JOIN public.restaurants r ON r.id = mi.restaurant_id
    WHERE r.owner_id = auth.uid()
  )
);

CREATE POLICY "item_option_groups_insert_own" ON public.item_option_groups
FOR INSERT WITH CHECK (
  menu_item_id IN (
    SELECT mi.id FROM public.menu_items mi
    JOIN public.restaurants r ON r.id = mi.restaurant_id
    WHERE r.owner_id = auth.uid()
  )
);

CREATE POLICY "item_option_groups_delete_own" ON public.item_option_groups
FOR DELETE USING (
  menu_item_id IN (
    SELECT mi.id FROM public.menu_items mi
    JOIN public.restaurants r ON r.id = mi.restaurant_id
    WHERE r.owner_id = auth.uid()
  )
);;
