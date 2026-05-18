
-- ============================================================
-- Strategic Planning & KPI Goal Tracking
-- ============================================================

-- 1) strategic_goals — each KPI goal
CREATE TABLE public.strategic_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'revenue',
  goal_type text NOT NULL DEFAULT 'monthly',
  target_value numeric NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'count',
  start_date date NOT NULL,
  end_date date NOT NULL,
  city_id uuid REFERENCES public.regions(id) ON DELETE SET NULL,
  service_type text,
  assigned_team text,
  assigned_user_id uuid,
  status text NOT NULL DEFAULT 'active',
  priority text NOT NULL DEFAULT 'medium',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_strategic_goal()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.category NOT IN ('revenue','trips','driver_onboarding','customer_acquisition','city_launch','orders','retention','custom') THEN
    RAISE EXCEPTION 'Invalid goal category: %', NEW.category;
  END IF;
  IF NEW.goal_type NOT IN ('daily','weekly','monthly','quarterly','yearly','custom') THEN
    RAISE EXCEPTION 'Invalid goal_type: %', NEW.goal_type;
  END IF;
  IF NEW.status NOT IN ('active','completed','at_risk','behind','paused','cancelled') THEN
    RAISE EXCEPTION 'Invalid goal status: %', NEW.status;
  END IF;
  IF NEW.priority NOT IN ('low','medium','high','critical') THEN
    RAISE EXCEPTION 'Invalid priority: %', NEW.priority;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_strategic_goal_validate
  BEFORE INSERT OR UPDATE ON public.strategic_goals
  FOR EACH ROW EXECUTE FUNCTION public.validate_strategic_goal();

CREATE INDEX idx_strategic_goals_status ON public.strategic_goals(status);
CREATE INDEX idx_strategic_goals_category ON public.strategic_goals(category);
CREATE INDEX idx_strategic_goals_dates ON public.strategic_goals(start_date, end_date);

ALTER TABLE public.strategic_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on strategic_goals"
  ON public.strategic_goals FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2) strategic_goal_updates — snapshot history for each goal
CREATE TABLE public.strategic_goal_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.strategic_goals(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  delta numeric NOT NULL DEFAULT 0,
  note text,
  source text NOT NULL DEFAULT 'system',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_goal_updates_goal ON public.strategic_goal_updates(goal_id);
CREATE INDEX idx_goal_updates_date ON public.strategic_goal_updates(recorded_at);

ALTER TABLE public.strategic_goal_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on strategic_goal_updates"
  ON public.strategic_goal_updates FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
;
