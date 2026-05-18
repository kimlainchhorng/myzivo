-- Goal Milestone Notifications (persists which milestones have been notified)
CREATE TABLE IF NOT EXISTS public.goal_milestone_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly')),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('earnings', 'deliveries', 'hours')),
  milestone INTEGER NOT NULL CHECK (milestone IN (50, 75, 100)),
  period_key TEXT NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, period, goal_type, milestone, period_key)
);

-- Enable RLS
ALTER TABLE public.goal_milestone_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_milestone_notifications
CREATE POLICY "Users can view their own milestone notifications"
  ON public.goal_milestone_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestone notifications"
  ON public.goal_milestone_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestone notifications"
  ON public.goal_milestone_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_goal_milestone_notifications_lookup
  ON public.goal_milestone_notifications(user_id, period, goal_type, period_key);;
