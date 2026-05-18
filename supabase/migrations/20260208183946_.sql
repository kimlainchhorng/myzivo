-- Create driver_daily_goals table for tracking daily objectives
CREATE TABLE driver_daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('trips', 'earnings')),
  goal_target INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  bonus_earned NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(driver_id, goal_date, goal_type, goal_target)
);

-- Index for fast date-based queries
CREATE INDEX idx_driver_daily_goals_date ON driver_daily_goals(driver_id, goal_date);
CREATE INDEX idx_driver_daily_goals_completed ON driver_daily_goals(driver_id, completed, goal_date);

-- RLS policies
ALTER TABLE driver_daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own daily goals"
  ON driver_daily_goals FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update own daily goals"
  ON driver_daily_goals FOR UPDATE
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- Create driver_bonus_history table for tracking all bonuses
CREATE TABLE driver_bonus_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  bonus_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('daily_goal', 'streak', 'challenge', 'referral', 'other')),
  bonus_amount NUMERIC(10,2) NOT NULL,
  goal_id UUID REFERENCES driver_daily_goals(id) ON DELETE SET NULL,
  notes TEXT,
  credited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for history queries
CREATE INDEX idx_driver_bonus_history_date ON driver_bonus_history(driver_id, bonus_date);
CREATE INDEX idx_driver_bonus_history_type ON driver_bonus_history(driver_id, bonus_type);

-- RLS policies
ALTER TABLE driver_bonus_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own bonus history"
  ON driver_bonus_history FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));;
