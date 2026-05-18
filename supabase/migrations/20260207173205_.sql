-- Add new columns to square_connections for enhanced tracking
ALTER TABLE public.square_connections
  ADD COLUMN IF NOT EXISTS location_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS token_type TEXT,
  ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create square_catalog_categories table
CREATE TABLE IF NOT EXISTS public.square_catalog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_merchant_id TEXT NOT NULL,
  square_category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  raw JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_square_catalog_categories_unique 
  ON public.square_catalog_categories(user_id, square_merchant_id, square_category_id);
ALTER TABLE public.square_catalog_categories ENABLE ROW LEVEL SECURITY;

-- Create square_modifiers table
CREATE TABLE IF NOT EXISTS public.square_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_merchant_id TEXT NOT NULL,
  square_modifier_list_id TEXT NOT NULL,
  name TEXT NOT NULL,
  raw JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_square_modifiers_unique 
  ON public.square_modifiers(user_id, square_merchant_id, square_modifier_list_id);
ALTER TABLE public.square_modifiers ENABLE ROW LEVEL SECURITY;

-- Create square_items table
CREATE TABLE IF NOT EXISTS public.square_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_merchant_id TEXT NOT NULL,
  square_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_ids TEXT[] DEFAULT '{}',
  is_archived BOOLEAN DEFAULT false,
  raw JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_square_items_unique 
  ON public.square_items(user_id, square_merchant_id, square_item_id);
ALTER TABLE public.square_items ENABLE ROW LEVEL SECURITY;

-- Create square_item_variations table
CREATE TABLE IF NOT EXISTS public.square_item_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_merchant_id TEXT NOT NULL,
  square_variation_id TEXT NOT NULL,
  square_item_id TEXT NOT NULL,
  name TEXT,
  price_cents INTEGER,
  currency TEXT,
  sku TEXT,
  inventory_tracking BOOLEAN,
  raw JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_square_item_variations_unique 
  ON public.square_item_variations(user_id, square_merchant_id, square_variation_id);
ALTER TABLE public.square_item_variations ENABLE ROW LEVEL SECURITY;

-- Create square_sync_jobs table
CREATE TABLE IF NOT EXISTS public.square_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_merchant_id TEXT NOT NULL,
  env TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  items_count INTEGER DEFAULT 0,
  categories_count INTEGER DEFAULT 0,
  variations_count INTEGER DEFAULT 0,
  modifiers_count INTEGER DEFAULT 0,
  log TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.square_sync_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for square_catalog_categories
CREATE POLICY "Users can view own categories" ON public.square_catalog_categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.square_catalog_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.square_catalog_categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.square_catalog_categories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for square_modifiers
CREATE POLICY "Users can view own modifiers" ON public.square_modifiers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own modifiers" ON public.square_modifiers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own modifiers" ON public.square_modifiers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own modifiers" ON public.square_modifiers
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for square_items
CREATE POLICY "Users can view own items" ON public.square_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.square_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.square_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.square_items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for square_item_variations
CREATE POLICY "Users can view own variations" ON public.square_item_variations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own variations" ON public.square_item_variations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own variations" ON public.square_item_variations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own variations" ON public.square_item_variations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for square_sync_jobs
CREATE POLICY "Users can view own sync jobs" ON public.square_sync_jobs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sync jobs" ON public.square_sync_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sync jobs" ON public.square_sync_jobs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sync jobs" ON public.square_sync_jobs
  FOR DELETE USING (auth.uid() = user_id);;
