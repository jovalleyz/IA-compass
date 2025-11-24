-- Drop existing admin DELETE policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can delete any evaluation" ON public.evaluations;
DROP POLICY IF EXISTS "Admins can delete any initiative" ON public.initiatives;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

-- Recreate admin DELETE policies
CREATE POLICY "Admins can delete any evaluation" 
ON public.evaluations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any initiative" 
ON public.initiatives 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add missing DELETE policies for admin operations on other tables
CREATE POLICY "Admins can delete any use case" 
ON public.use_cases 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any initiative stage" 
ON public.initiative_stages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any initiative activity" 
ON public.initiative_activities 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any initiative comment" 
ON public.initiative_comments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any initiative collaborator" 
ON public.initiative_collaborators 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete session analytics" 
ON public.session_analytics 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));