-- Create a SECURITY DEFINER function to safely check if the current user's phone matches
CREATE OR REPLACE FUNCTION public.user_phone_matches(phone_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND phone = phone_to_check
  )
$$;

-- Drop and recreate the RLS policy to use the new function
DROP POLICY IF EXISTS "Users can read own orders by phone" ON public.food_orders;

CREATE POLICY "Users can read own orders by phone" ON public.food_orders
FOR SELECT USING (
  is_admin() OR (
    auth.uid() IS NOT NULL 
    AND customer_phone IS NOT NULL 
    AND user_phone_matches(customer_phone)
  )
);;
