-- Create achievements definition table
CREATE TABLE public.achievement_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  threshold INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert achievement definitions
INSERT INTO public.achievement_definitions (id, name, description, icon, category, threshold, sort_order) VALUES
('first_trip', 'First Mile', 'Complete your first delivery', 'navigation', 'trips', 1, 1),
('trips_10', 'Getting Started', 'Complete 10 deliveries', 'truck', 'trips', 10, 2),
('trips_50', 'Road Warrior', 'Complete 50 deliveries', 'route', 'trips', 50, 3),
('trips_100', 'Century Club', 'Complete 100 deliveries', 'trophy', 'trips', 100, 4),
('trips_500', 'Elite Driver', 'Complete 500 deliveries', 'crown', 'trips', 500, 5),
('rating_45', 'Highly Rated', 'Achieve a 4.5+ star rating', 'star', 'rating', NULL, 6),
('rating_perfect', 'Perfectionist', 'Achieve a perfect 5.0 rating', 'sparkles', 'rating', NULL, 7),
('first_cashout', 'First Payday', 'Request your first cash out', 'banknote', 'earnings', 1, 8),
('earnings_500', 'Money Maker', 'Earn $500 total', 'dollar-sign', 'earnings', 500, 9),
('earnings_1000', 'Big Earner', 'Earn $1,000 total', 'coins', 'earnings', 1000, 10),
('earnings_5000', 'Top Earner', 'Earn $5,000 total', 'gem', 'earnings', 5000, 11),
('streak_3', 'On Fire', 'Achieve a 3-week/month streak', 'flame', 'streaks', 3, 12),
('streak_5', 'Unstoppable', 'Achieve a 5-week/month streak', 'zap', 'streaks', 5, 13),
('streak_10', 'Legend', 'Achieve a 10-week/month streak', 'medal', 'streaks', 10, 14);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL REFERENCES public.achievement_definitions(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for definitions (public read)
CREATE POLICY "Anyone can view achievement definitions"
ON public.achievement_definitions FOR SELECT
USING (true);

-- RLS policies for user achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);;
