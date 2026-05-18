
-- Restaurant ratings table (separate from driver trip_ratings)
CREATE TABLE public.restaurant_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  food_rating INTEGER NOT NULL CHECK (food_rating BETWEEN 1 AND 5),
  packaging_rating INTEGER CHECK (packaging_rating BETWEEN 1 AND 5),
  accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  feedback TEXT,
  tags TEXT[] DEFAULT '{}',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flagged_reason TEXT,
  flagged_by UUID,
  flagged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, customer_id)
);

ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can create reviews"
  ON public.restaurant_reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can view visible reviews"
  ON public.restaurant_reviews FOR SELECT
  USING (is_visible = true OR customer_id = auth.uid());

CREATE POLICY "Admins can manage reviews"
  ON public.restaurant_reviews FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Customers can update own reviews within 24h"
  ON public.restaurant_reviews FOR UPDATE
  USING (
    auth.uid() = customer_id
    AND created_at > now() - interval '24 hours'
  );

-- Review reports (for moderation)
CREATE TABLE public.review_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.restaurant_reviews(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL DEFAULT 'restaurant',
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report reviews"
  ON public.review_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports"
  ON public.review_reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Indexes
CREATE INDEX idx_restaurant_reviews_restaurant ON public.restaurant_reviews(restaurant_id);
CREATE INDEX idx_restaurant_reviews_order ON public.restaurant_reviews(order_id);
CREATE INDEX idx_restaurant_reviews_customer ON public.restaurant_reviews(customer_id);
CREATE INDEX idx_review_reports_status ON public.review_reports(status);

-- Updated_at trigger
CREATE TRIGGER update_restaurant_reviews_updated_at
  BEFORE UPDATE ON public.restaurant_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
