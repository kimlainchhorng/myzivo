-- Create item availability log table for tracking stock outages
CREATE TABLE public.item_availability_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('out_of_stock', 'restocked')),
  previous_stock_qty INTEGER,
  new_stock_qty INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_item_availability_log_restaurant ON public.item_availability_log(restaurant_id);
CREATE INDEX idx_item_availability_log_event_type ON public.item_availability_log(event_type);
CREATE INDEX idx_item_availability_log_created_at ON public.item_availability_log(created_at);
CREATE INDEX idx_item_availability_log_menu_item ON public.item_availability_log(menu_item_id);

-- Enable RLS
ALTER TABLE public.item_availability_log ENABLE ROW LEVEL SECURITY;

-- Policy for admin access
CREATE POLICY "Admins can view all item availability logs" ON public.item_availability_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for inserting logs (system/service role or admin)
CREATE POLICY "Admins can insert item availability logs" ON public.item_availability_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );;
