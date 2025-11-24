-- Ensure RLS policy allows users to read their own roles from user_roles table
-- This is critical for Edge Functions to verify admin status

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create policy allowing users to read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure admins can read all roles (for admin functions)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);