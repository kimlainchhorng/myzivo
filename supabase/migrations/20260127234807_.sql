-- Create role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS: Only admins can view all roles, users can see their own
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to auto-apply approved profile changes
CREATE OR REPLACE FUNCTION public.apply_approved_profile_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only run when status changes to approved
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    
    -- Handle avatar approval
    IF NEW.change_type = 'avatar' THEN
      UPDATE public.drivers
      SET avatar_url = NEW.change_data->>'public_url',
          updated_at = now()
      WHERE id = NEW.driver_id;
    END IF;
    
    -- Set reviewed timestamp
    NEW.reviewed_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-applying approved changes
DROP TRIGGER IF EXISTS trigger_apply_approved_change ON public.pending_profile_changes;
CREATE TRIGGER trigger_apply_approved_change
  BEFORE UPDATE ON public.pending_profile_changes
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_approved_profile_change();

-- Function to auto-apply approved vehicle
CREATE OR REPLACE FUNCTION public.apply_approved_vehicle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set reviewed timestamp when approved
  IF NEW.approval_status = 'approved' AND OLD.approval_status = 'pending' THEN
    NEW.updated_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for vehicle approval
DROP TRIGGER IF EXISTS trigger_apply_approved_vehicle ON public.vehicles;
CREATE TRIGGER trigger_apply_approved_vehicle
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_approved_vehicle();;
