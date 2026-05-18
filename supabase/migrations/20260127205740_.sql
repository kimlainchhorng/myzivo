-- Create fuel_entries table for tracking fuel costs
CREATE TABLE public.fuel_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  gallons NUMERIC(10,2) NOT NULL,
  price_per_gallon NUMERIC(10,3) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  odometer INTEGER NOT NULL,
  mpg NUMERIC(5,1),
  station_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_expenses table for expense tracking
CREATE TABLE public.driver_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_deductible BOOLEAN DEFAULT true,
  has_receipt BOOLEAN DEFAULT false,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create safety_incidents table for incident reporting
CREATE TABLE public.safety_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved')),
  photos_count INTEGER DEFAULT 0,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fuel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for fuel_entries
CREATE POLICY "Drivers can view their own fuel entries" 
ON public.fuel_entries FOR SELECT 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert their own fuel entries" 
ON public.fuel_entries FOR INSERT 
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own fuel entries" 
ON public.fuel_entries FOR UPDATE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can delete their own fuel entries" 
ON public.fuel_entries FOR DELETE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS policies for driver_expenses
CREATE POLICY "Drivers can view their own expenses" 
ON public.driver_expenses FOR SELECT 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert their own expenses" 
ON public.driver_expenses FOR INSERT 
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own expenses" 
ON public.driver_expenses FOR UPDATE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can delete their own expenses" 
ON public.driver_expenses FOR DELETE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS policies for safety_incidents
CREATE POLICY "Drivers can view their own incidents" 
ON public.safety_incidents FOR SELECT 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert their own incidents" 
ON public.safety_incidents FOR INSERT 
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own incidents" 
ON public.safety_incidents FOR UPDATE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS policies for emergency_contacts
CREATE POLICY "Drivers can view their own emergency contacts" 
ON public.emergency_contacts FOR SELECT 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert their own emergency contacts" 
ON public.emergency_contacts FOR INSERT 
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own emergency contacts" 
ON public.emergency_contacts FOR UPDATE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can delete their own emergency contacts" 
ON public.emergency_contacts FOR DELETE 
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Add updated_at trigger for safety_incidents
CREATE TRIGGER update_safety_incidents_updated_at
BEFORE UPDATE ON public.safety_incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
