-- Create shift_slots table for platform-defined available shifts
CREATE TABLE public.shift_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  zone VARCHAR(100),
  max_drivers INTEGER DEFAULT 10,
  current_drivers INTEGER DEFAULT 0,
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  demand_level VARCHAR(20) DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shift_slots ENABLE ROW LEVEL SECURITY;

-- Everyone can read active slots
CREATE POLICY "Anyone can view active shift slots"
ON public.shift_slots
FOR SELECT
USING (is_active = true);

-- Add slot_id to driver_shifts for linking reservations
ALTER TABLE public.driver_shifts 
ADD COLUMN slot_id UUID REFERENCES public.shift_slots(id);

-- Create indexes for efficient querying
CREATE INDEX idx_shift_slots_date ON public.shift_slots(shift_date);
CREATE INDEX idx_shift_slots_active ON public.shift_slots(is_active, shift_date);
CREATE INDEX idx_driver_shifts_slot ON public.driver_shifts(slot_id);

-- Function to update current_drivers count
CREATE OR REPLACE FUNCTION public.update_slot_driver_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.slot_id IS NOT NULL THEN
    UPDATE public.shift_slots 
    SET current_drivers = current_drivers + 1,
        updated_at = NOW()
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'DELETE' AND OLD.slot_id IS NOT NULL THEN
    UPDATE public.shift_slots 
    SET current_drivers = GREATEST(0, current_drivers - 1),
        updated_at = NOW()
    WHERE id = OLD.slot_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle slot changes
    IF OLD.slot_id IS DISTINCT FROM NEW.slot_id THEN
      IF OLD.slot_id IS NOT NULL THEN
        UPDATE public.shift_slots 
        SET current_drivers = GREATEST(0, current_drivers - 1),
            updated_at = NOW()
        WHERE id = OLD.slot_id;
      END IF;
      IF NEW.slot_id IS NOT NULL THEN
        UPDATE public.shift_slots 
        SET current_drivers = current_drivers + 1,
            updated_at = NOW()
        WHERE id = NEW.slot_id;
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to maintain current_drivers count
CREATE TRIGGER maintain_slot_driver_count
AFTER INSERT OR UPDATE OR DELETE ON public.driver_shifts
FOR EACH ROW
EXECUTE FUNCTION public.update_slot_driver_count();

-- Insert some sample shift slots for the next 7 days
INSERT INTO public.shift_slots (shift_date, start_time, end_time, zone, max_drivers, bonus_amount, demand_level)
SELECT 
  CURRENT_DATE + i,
  '08:00'::TIME,
  '12:00'::TIME,
  'Downtown',
  10,
  CASE WHEN i % 2 = 0 THEN 15.00 ELSE 0 END,
  CASE WHEN i % 3 = 0 THEN 'high' WHEN i % 2 = 0 THEN 'medium' ELSE 'low' END
FROM generate_series(0, 6) AS i
UNION ALL
SELECT 
  CURRENT_DATE + i,
  '12:00'::TIME,
  '17:00'::TIME,
  'Mall District',
  8,
  CASE WHEN i % 2 = 1 THEN 20.00 ELSE 10.00 END,
  'medium'
FROM generate_series(0, 6) AS i
UNION ALL
SELECT 
  CURRENT_DATE + i,
  '17:00'::TIME,
  '22:00'::TIME,
  'Downtown',
  12,
  25.00,
  'high'
FROM generate_series(0, 6) AS i;;
