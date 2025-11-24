-- Crear función para que admins puedan ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Crear política para que admins puedan actualizar cualquier perfil
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Crear política para que admins puedan eliminar perfiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir a admins ver todas las iniciativas
CREATE POLICY "Admins can view all initiatives"
ON public.initiatives
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir a admins actualizar cualquier iniciativa
CREATE POLICY "Admins can update any initiative"
ON public.initiatives
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir a admins eliminar cualquier iniciativa
CREATE POLICY "Admins can delete any initiative"
ON public.initiatives
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir a admins ver todas las evaluaciones
CREATE POLICY "Admins can view all evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir a admins actualizar cualquier evaluación
CREATE POLICY "Admins can update any evaluation"
ON public.evaluations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir a admins eliminar cualquier evaluación
CREATE POLICY "Admins can delete any evaluation"
ON public.evaluations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir a admins ver todos los roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Función para obtener todos los usuarios con sus roles
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  id uuid,
  email text,
  nombre text,
  empresa text,
  pais text,
  telefono text,
  cargo text,
  rol text,
  created_at timestamp with time zone,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario sea admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver todos los usuarios';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.nombre,
    p.empresa,
    p.pais,
    p.telefono,
    p.cargo,
    p.rol,
    p.created_at,
    COALESCE(array_agg(ur.role::text) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[]) as roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  GROUP BY p.id, p.email, p.nombre, p.empresa, p.pais, p.telefono, p.cargo, p.rol, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;

-- Función para asignar rol a usuario
CREATE OR REPLACE FUNCTION public.assign_role_to_user(
  target_user_id uuid,
  target_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario sea admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden asignar roles';
  END IF;

  -- Insertar o actualizar el rol
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, target_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Función para remover rol de usuario
CREATE OR REPLACE FUNCTION public.remove_role_from_user(
  target_user_id uuid,
  target_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario sea admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden remover roles';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = target_role;
END;
$$;

-- Función para obtener estadísticas del sistema
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS TABLE (
  total_users bigint,
  total_initiatives bigint,
  total_evaluations bigint,
  total_use_cases bigint,
  active_collaborations bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario sea admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver estadísticas del sistema';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles),
    (SELECT COUNT(*) FROM public.initiatives),
    (SELECT COUNT(*) FROM public.evaluations),
    (SELECT COUNT(*) FROM public.use_cases),
    (SELECT COUNT(*) FROM public.initiative_collaborators WHERE estado = 'aceptado'::collaboration_status);
END;
$$;