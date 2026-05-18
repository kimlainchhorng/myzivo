-- Remove conflicting zivo_* policies that incorrectly compare driver_id to auth.uid()
DROP POLICY IF EXISTS "zivo_vehicles_select" ON public.vehicles;
DROP POLICY IF EXISTS "zivo_vehicles_insert" ON public.vehicles;
DROP POLICY IF EXISTS "zivo_vehicles_update" ON public.vehicles;
DROP POLICY IF EXISTS "zivo_vehicles_delete" ON public.vehicles;

-- Also remove the overly broad vehicles_modify policy
DROP POLICY IF EXISTS "vehicles_modify" ON public.vehicles;;
