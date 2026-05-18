-- Add operating control columns to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS closed_reason text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS busy_prep_time_bonus_minutes int DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS pause_new_orders boolean DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS delivery_mode text DEFAULT 'radius';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS delivery_polygon jsonb;

-- Create restaurant status log table for audit trail
CREATE TABLE IF NOT EXISTS public.restaurant_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  previous_state jsonb,
  new_state jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_status_log_restaurant ON restaurant_status_log(restaurant_id, created_at DESC);

-- Enable RLS on status log
ALTER TABLE restaurant_status_log ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can read their own logs
CREATE POLICY "Owners can read own status logs" ON restaurant_status_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
  );

-- Policy: Owners can insert logs for their restaurants
CREATE POLICY "Owners can insert status logs" ON restaurant_status_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
  );;
