
-- Create trigger function for brands updated_at
CREATE OR REPLACE FUNCTION public.set_brands_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#000000',
  domain text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create brand_regions junction table
CREATE TABLE IF NOT EXISTS public.brand_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(brand_id, region_id)
);

CREATE INDEX idx_brand_regions_brand ON public.brand_regions(brand_id);
CREATE INDEX idx_brand_regions_region ON public.brand_regions(region_id);

CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.set_brands_updated_at();

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view brands" ON public.brands FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support')));
CREATE POLICY "Managers can insert brands" ON public.brands FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));
CREATE POLICY "Managers can update brands" ON public.brands FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));
CREATE POLICY "Managers can delete brands" ON public.brands FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));

CREATE POLICY "Admins can view brand_regions" ON public.brand_regions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support')));
CREATE POLICY "Managers can insert brand_regions" ON public.brand_regions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));
CREATE POLICY "Managers can delete brand_regions" ON public.brand_regions FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));

INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Brand logos are publicly accessible" ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-logos');
CREATE POLICY "Admins can upload brand logos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brand-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));
CREATE POLICY "Admins can update brand logos" ON storage.objects FOR UPDATE
  USING (bucket_id = 'brand-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));
CREATE POLICY "Admins can delete brand logos" ON storage.objects FOR DELETE
  USING (bucket_id = 'brand-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')));
;
