-- Fix critical RLS vulnerabilities: profiles and ride_requests tables
-- Remove public SELECT access and implement proper user-scoped policies

-- ============================================
-- 1. FIX PROFILES TABLE RLS
-- ============================================

-- Drop the insecure public SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admins and support can view all profiles for customer service
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'support')
);

-- ============================================
-- 2. FIX RIDE_REQUESTS TABLE RLS
-- ============================================

-- Drop the insecure public SELECT policy
DROP POLICY IF EXISTS "Anyone can read ride requests" ON ride_requests;

-- Customers can view their own ride requests
CREATE POLICY "Users can view own ride requests"
ON ride_requests FOR SELECT
USING (auth.uid() = user_id);

-- Assigned drivers can view their assigned ride requests
CREATE POLICY "Drivers can view assigned ride requests"
ON ride_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM drivers d
    WHERE d.user_id = auth.uid()
    AND d.id = ride_requests.assigned_driver_id
  )
);

-- Admins and operations can view all ride requests
CREATE POLICY "Admins can view all ride requests"
ON ride_requests FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'operations') OR
  public.has_role(auth.uid(), 'support')
);;
