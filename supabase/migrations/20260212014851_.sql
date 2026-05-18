
CREATE TABLE public.menu_item_prep_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  avg_prep_minutes NUMERIC NOT NULL DEFAULT 0,
  min_prep_minutes NUMERIC NOT NULL DEFAULT 0,
  max_prep_minutes NUMERIC NOT NULL DEFAULT 0,
  sample_count INTEGER NOT NULL DEFAULT 0,
  peak_hour_avg_minutes NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_item_prep_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage menu_item_prep_stats"
ON public.menu_item_prep_stats
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin', 'manager', 'support')
  )
);

CREATE POLICY "Restaurant owners can view their own prep stats"
ON public.menu_item_prep_stats
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = menu_item_prep_stats.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);

CREATE INDEX idx_menu_item_prep_stats_restaurant ON public.menu_item_prep_stats(restaurant_id);
CREATE INDEX idx_menu_item_prep_stats_item ON public.menu_item_prep_stats(item_name);
;
