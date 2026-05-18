-- Create function to get user's highest admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('owner', 'admin', 'manager', 'support', 'operations', 'finance')
  ORDER BY 
    CASE role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'manager' THEN 3
      WHEN 'operations' THEN 4
      WHEN 'finance' THEN 5
      WHEN 'support' THEN 6
      ELSE 7
    END
  LIMIT 1
$$;

-- Create function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.has_admin_permission(
  _user_id uuid, 
  _permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    -- Owner/Admin has all permissions
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role IN ('owner', 'admin')
    ) THEN true
    -- Manager has operations, analytics, and support permissions
    WHEN _permission IN ('operations', 'analytics', 'support', 'orders_view', 'dashboard') AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = 'manager'
    ) THEN true
    -- Support has limited permissions
    WHEN _permission IN ('support', 'orders_view', 'dashboard') AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role IN ('manager', 'support')
    ) THEN true
    ELSE false
  END
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_admin_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_permission(uuid, text) TO authenticated;;
