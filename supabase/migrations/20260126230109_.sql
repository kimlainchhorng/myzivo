-- Create only the tables that don't exist yet

-- Waste Tracking Tables
CREATE TABLE IF NOT EXISTS public.waste_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#ef4444',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.waste_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.waste_categories(id) ON DELETE SET NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  waste_reason TEXT NOT NULL,
  waste_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_by TEXT,
  notes TEXT,
  is_compostable BOOLEAN DEFAULT false,
  is_recyclable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Split Bills / Payment Tables
CREATE TABLE IF NOT EXISTS public.bill_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id UUID,
  original_amount NUMERIC NOT NULL,
  split_type TEXT NOT NULL DEFAULT 'equal',
  total_splits INTEGER DEFAULT 2,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bill_split_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_split_id UUID NOT NULL REFERENCES public.bill_splits(id) ON DELETE CASCADE,
  payer_name TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  tip_amount NUMERIC DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_split_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waste_categories
CREATE POLICY "Users can view their waste categories"
  ON public.waste_categories FOR SELECT
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert waste categories"
  ON public.waste_categories FOR INSERT
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update waste categories"
  ON public.waste_categories FOR UPDATE
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete waste categories"
  ON public.waste_categories FOR DELETE
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- RLS Policies for waste_logs
CREATE POLICY "Users can view their waste logs"
  ON public.waste_logs FOR SELECT
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert waste logs"
  ON public.waste_logs FOR INSERT
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update waste logs"
  ON public.waste_logs FOR UPDATE
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete waste logs"
  ON public.waste_logs FOR DELETE
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- RLS Policies for bill_splits
CREATE POLICY "Users can view their bill splits"
  ON public.bill_splits FOR SELECT
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert bill splits"
  ON public.bill_splits FOR INSERT
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update bill splits"
  ON public.bill_splits FOR UPDATE
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete bill splits"
  ON public.bill_splits FOR DELETE
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- RLS Policies for bill_split_payments
CREATE POLICY "Users can view bill split payments"
  ON public.bill_split_payments FOR SELECT
  USING (bill_split_id IN (SELECT id FROM public.bill_splits WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())));

CREATE POLICY "Users can insert bill split payments"
  ON public.bill_split_payments FOR INSERT
  WITH CHECK (bill_split_id IN (SELECT id FROM public.bill_splits WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())));

CREATE POLICY "Users can update bill split payments"
  ON public.bill_split_payments FOR UPDATE
  USING (bill_split_id IN (SELECT id FROM public.bill_splits WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())));

CREATE POLICY "Users can delete bill split payments"
  ON public.bill_split_payments FOR DELETE
  USING (bill_split_id IN (SELECT id FROM public.bill_splits WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())));

-- Trigger for bill_splits updated_at
CREATE TRIGGER update_bill_splits_updated_at
  BEFORE UPDATE ON public.bill_splits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
