-- Vehicle maintenance service logs table (replaces generated mock data)
CREATE TABLE IF NOT EXISTS public.vehicle_service_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mileage INTEGER NOT NULL,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shop_name TEXT,
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vehicle maintenance reminders table (replaces generated mock data)
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_reminders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    due_date DATE,
    due_mileage INTEGER,
    estimated_cost NUMERIC(10, 2),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'overdue', 'completed')),
    notifications_enabled BOOLEAN DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_reminders ENABLE ROW LEVEL SECURITY;

-- Service logs policies - drivers can only manage their own
DROP POLICY IF EXISTS "Drivers can view own service logs" ON public.vehicle_service_logs;
CREATE POLICY "Drivers can view own service logs" 
ON public.vehicle_service_logs FOR SELECT 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can create own service logs" ON public.vehicle_service_logs;
CREATE POLICY "Drivers can create own service logs" 
ON public.vehicle_service_logs FOR INSERT 
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can update own service logs" ON public.vehicle_service_logs;
CREATE POLICY "Drivers can update own service logs" 
ON public.vehicle_service_logs FOR UPDATE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can delete own service logs" ON public.vehicle_service_logs;
CREATE POLICY "Drivers can delete own service logs" 
ON public.vehicle_service_logs FOR DELETE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Maintenance reminders policies
DROP POLICY IF EXISTS "Drivers can view own maintenance reminders" ON public.vehicle_maintenance_reminders;
CREATE POLICY "Drivers can view own maintenance reminders" 
ON public.vehicle_maintenance_reminders FOR SELECT 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can create own maintenance reminders" ON public.vehicle_maintenance_reminders;
CREATE POLICY "Drivers can create own maintenance reminders" 
ON public.vehicle_maintenance_reminders FOR INSERT 
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can update own maintenance reminders" ON public.vehicle_maintenance_reminders;
CREATE POLICY "Drivers can update own maintenance reminders" 
ON public.vehicle_maintenance_reminders FOR UPDATE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can delete own maintenance reminders" ON public.vehicle_maintenance_reminders;
CREATE POLICY "Drivers can delete own maintenance reminders" 
ON public.vehicle_maintenance_reminders FOR DELETE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_logs_vehicle ON public.vehicle_service_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_driver ON public.vehicle_service_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_date ON public.vehicle_service_logs(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_vehicle ON public.vehicle_maintenance_reminders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_driver ON public.vehicle_maintenance_reminders(driver_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_status ON public.vehicle_maintenance_reminders(status);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_vehicle_maintenance_reminders_updated_at ON public.vehicle_maintenance_reminders;
CREATE TRIGGER update_vehicle_maintenance_reminders_updated_at
BEFORE UPDATE ON public.vehicle_maintenance_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
