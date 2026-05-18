-- ================================================
-- Comprehensive RLS Policies for Driver System
-- Add missing UPDATE policies for driver-related tables
-- ================================================

-- 1. ORDER_OFFERS - Add UPDATE policy for accept/decline
DROP POLICY IF EXISTS "drivers_update_own_offers" ON public.order_offers;

CREATE POLICY "drivers_update_own_offers"
ON public.order_offers FOR UPDATE TO authenticated
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 2. DRIVER_DOCUMENTS - Add UPDATE policy
DROP POLICY IF EXISTS "drivers_update_own_documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can update their own documents" ON public.driver_documents;

CREATE POLICY "drivers_update_own_documents"
ON public.driver_documents FOR UPDATE TO authenticated
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 3. DRIVER_LOCATION_HISTORY - Add UPDATE policy
DROP POLICY IF EXISTS "location_final_update" ON public.driver_location_history;

CREATE POLICY "location_final_update"
ON public.driver_location_history FOR UPDATE TO authenticated
USING (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()))
WITH CHECK (driver_id IN (SELECT d.id FROM drivers d WHERE d.user_id = auth.uid()));;
