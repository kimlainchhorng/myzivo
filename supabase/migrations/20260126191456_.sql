-- Create table to track goal completions for streak calculation
CREATE TABLE public.goal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  earnings_met BOOLEAN DEFAULT false,
  deliveries_met BOOLEAN DEFAULT false,
  hours_met BOOLEAN DEFAULT false,
  all_goals_met BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, period_type, period_start)
);

-- Enable RLS
ALTER TABLE public.goal_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own goal completions"
ON public.goal_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal completions"
ON public.goal_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal completions"
ON public.goal_completions FOR UPDATE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_goal_completions_updated_at
BEFORE UPDATE ON public.goal_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
