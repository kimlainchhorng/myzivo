
-- Driver Availability table
CREATE TABLE public.driver_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  day_of_week integer,
  specific_date date,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  preferred_zone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_day_or_date CHECK (day_of_week IS NOT NULL OR specific_date IS NOT NULL),
  CONSTRAINT chk_day_of_week_range CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6))
);

-- Driver Scheduled Shifts table
CREATE TABLE public.driver_scheduled_shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  shift_slot_id uuid REFERENCES public.shift_slots(id) ON DELETE SET NULL,
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  zone text,
  status text NOT NULL DEFAULT 'scheduled',
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_driver_shift UNIQUE (driver_id, shift_date, start_time)
);

-- Indexes
CREATE INDEX idx_driver_availability_driver ON public.driver_availability(driver_id);
CREATE INDEX idx_driver_availability_day ON public.driver_availability(day_of_week);
CREATE INDEX idx_driver_availability_date ON public.driver_availability(specific_date);
CREATE INDEX idx_driver_scheduled_shifts_driver ON public.driver_scheduled_shifts(driver_id);
CREATE INDEX idx_driver_scheduled_shifts_date ON public.driver_scheduled_shifts(shift_date);
CREATE INDEX idx_driver_scheduled_shifts_status ON public.driver_scheduled_shifts(status);

-- Enable RLS
ALTER TABLE public.driver_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_scheduled_shifts ENABLE ROW LEVEL SECURITY;

-- RLS: driver_availability
CREATE POLICY "Drivers manage own availability"
  ON public.driver_availability FOR ALL
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access to driver_availability"
  ON public.driver_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- RLS: driver_scheduled_shifts
CREATE POLICY "Drivers manage own scheduled shifts"
  ON public.driver_scheduled_shifts FOR ALL
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access to driver_scheduled_shifts"
  ON public.driver_scheduled_shifts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- Updated_at triggers
CREATE TRIGGER update_driver_availability_updated_at
  BEFORE UPDATE ON public.driver_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_scheduled_shifts_updated_at
  BEFORE UPDATE ON public.driver_scheduled_shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
;
