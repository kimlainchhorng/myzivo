-- Add missing performance columns to restaurants
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS on_time_rate numeric(5,2) DEFAULT 100;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS order_accuracy numeric(5,2) DEFAULT 100;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS performance_score numeric(5,2) DEFAULT 0;

-- Performance score history for trends
CREATE TABLE public.performance_score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- 'driver' or 'restaurant'
  entity_id uuid NOT NULL,
  score numeric(5,2) NOT NULL,
  metrics_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.performance_score_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own score history" ON public.performance_score_history
  FOR SELECT USING (true);
CREATE POLICY "System inserts score history" ON public.performance_score_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );;
