-- Create pos_integrations table
CREATE TABLE IF NOT EXISTS public.pos_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('none', 'square', 'toast', 'clover', 'csv')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('inactive', 'connecting', 'active', 'error')),
  external_merchant_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, provider)
);

-- Create menu_import_logs table
CREATE TABLE IF NOT EXISTS public.menu_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('csv', 'square', 'toast', 'clover')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  items_imported INTEGER DEFAULT 0,
  categories_imported INTEGER DEFAULT 0,
  errors JSONB,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pos_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_import_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pos_integrations_restaurant ON public.pos_integrations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_import_logs_restaurant ON public.menu_import_logs(restaurant_id);

-- RLS Policies for pos_integrations
CREATE POLICY "pos_integrations_select_own"
ON public.pos_integrations FOR SELECT
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "pos_integrations_insert_own"
ON public.pos_integrations FOR INSERT
WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "pos_integrations_update_own"
ON public.pos_integrations FOR UPDATE
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()))
WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "pos_integrations_delete_own"
ON public.pos_integrations FOR DELETE
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- RLS Policies for menu_import_logs
CREATE POLICY "menu_import_logs_select_own"
ON public.menu_import_logs FOR SELECT
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "menu_import_logs_insert_own"
ON public.menu_import_logs FOR INSERT
WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "menu_import_logs_update_own"
ON public.menu_import_logs FOR UPDATE
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()))
WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_pos_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for updated_at
CREATE TRIGGER update_pos_integrations_updated_at
BEFORE UPDATE ON public.pos_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_pos_integrations_updated_at();;
