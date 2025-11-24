-- FORCE DROP the problematic policy
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles CASCADE;

-- Recreate ONLY the non-recursive policy for admins
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));