-- Drop conflicting/redundant policies on user_roles that call has_role()
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;

-- Recreate clean SELECT policy that uses simple auth.uid() check
CREATE POLICY "user_roles_select_own"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);;
