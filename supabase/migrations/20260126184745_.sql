-- Create analytics goals table (user-based instead of restaurant-based)
CREATE TABLE public.analytics_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('revenue', 'orders')),
  target_value NUMERIC NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint for one active goal per type/period per user
CREATE UNIQUE INDEX idx_unique_active_goal ON public.analytics_goals (user_id, goal_type, period) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.analytics_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals"
ON public.analytics_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.analytics_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.analytics_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.analytics_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_analytics_goals_updated_at
BEFORE UPDATE ON public.analytics_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
