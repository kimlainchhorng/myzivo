-- Create square_connections table for storing OAuth tokens
CREATE TABLE public.square_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_merchant_id TEXT NOT NULL,
  square_location_id TEXT,
  env TEXT NOT NULL CHECK (env IN ('sandbox', 'production')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index on user_id, square_merchant_id, env
CREATE UNIQUE INDEX square_connections_user_merchant_env_idx 
  ON public.square_connections(user_id, square_merchant_id, env);

-- Create index for faster lookups by user_id
CREATE INDEX square_connections_user_id_idx ON public.square_connections(user_id);

-- Enable RLS
ALTER TABLE public.square_connections ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only read their own connections
CREATE POLICY "Users can view own square connections"
  ON public.square_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create square_catalog_items table for storing raw Square catalog data
CREATE TABLE public.square_catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_merchant_id TEXT NOT NULL,
  square_object_id TEXT NOT NULL,
  object_type TEXT NOT NULL,
  name TEXT,
  description TEXT,
  price_cents INTEGER,
  currency TEXT,
  raw JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index on user_id, square_merchant_id, square_object_id
CREATE UNIQUE INDEX square_catalog_items_user_merchant_object_idx 
  ON public.square_catalog_items(user_id, square_merchant_id, square_object_id);

-- Create index for faster lookups by user_id
CREATE INDEX square_catalog_items_user_id_idx ON public.square_catalog_items(user_id);

-- Create index for filtering by object_type
CREATE INDEX square_catalog_items_object_type_idx ON public.square_catalog_items(object_type);

-- Enable RLS
ALTER TABLE public.square_catalog_items ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only read their own catalog items
CREATE POLICY "Users can view own square catalog items"
  ON public.square_catalog_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at on square_connections
CREATE OR REPLACE FUNCTION public.update_square_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_square_connections_updated_at
  BEFORE UPDATE ON public.square_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_square_connections_updated_at();

-- Create trigger to update updated_at on square_catalog_items
CREATE TRIGGER update_square_catalog_items_updated_at
  BEFORE UPDATE ON public.square_catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_square_connections_updated_at();;
