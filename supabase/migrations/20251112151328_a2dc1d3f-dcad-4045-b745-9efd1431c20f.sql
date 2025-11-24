-- Agregar campo sexo a profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sexo text CHECK (sexo IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir'));

-- Crear tabla para tracking de sesiones
CREATE TABLE IF NOT EXISTS public.session_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_time timestamp with time zone NOT NULL DEFAULT now(),
  logout_time timestamp with time zone,
  session_duration interval,
  ip_address text,
  country text,
  region text,
  city text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para mejorar performance de queries
CREATE INDEX IF NOT EXISTS idx_session_analytics_user_id ON public.session_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_login_time ON public.session_analytics(login_time);
CREATE INDEX IF NOT EXISTS idx_session_analytics_country ON public.session_analytics(country);

-- Habilitar RLS
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para session_analytics
CREATE POLICY "Users can view own sessions"
  ON public.session_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.session_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.session_analytics
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.session_analytics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Función para obtener estadísticas de sesiones por rango de fechas
CREATE OR REPLACE FUNCTION public.get_session_stats(
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
RETURNS TABLE(
  date date,
  total_sessions bigint,
  unique_users bigint,
  avg_duration interval
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver estadísticas de sesiones';
  END IF;

  RETURN QUERY
  SELECT 
    DATE(login_time) as date,
    COUNT(*)::bigint as total_sessions,
    COUNT(DISTINCT user_id)::bigint as unique_users,
    AVG(session_duration) as avg_duration
  FROM public.session_analytics
  WHERE login_time >= start_date AND login_time <= end_date
  GROUP BY DATE(login_time)
  ORDER BY date DESC;
END;
$$;

-- Función para obtener usuarios más activos
CREATE OR REPLACE FUNCTION public.get_most_active_users(
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  limit_count integer DEFAULT 10
)
RETURNS TABLE(
  user_id uuid,
  nombre text,
  email text,
  total_sessions bigint,
  total_time interval,
  avg_session_duration interval
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver usuarios activos';
  END IF;

  RETURN QUERY
  SELECT 
    sa.user_id,
    p.nombre,
    p.email,
    COUNT(*)::bigint as total_sessions,
    SUM(sa.session_duration) as total_time,
    AVG(sa.session_duration) as avg_session_duration
  FROM public.session_analytics sa
  JOIN public.profiles p ON sa.user_id = p.id
  WHERE sa.login_time >= start_date AND sa.login_time <= end_date
    AND sa.session_duration IS NOT NULL
  GROUP BY sa.user_id, p.nombre, p.email
  ORDER BY total_sessions DESC
  LIMIT limit_count;
END;
$$;

-- Función para obtener sesiones por país
CREATE OR REPLACE FUNCTION public.get_sessions_by_country(
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
RETURNS TABLE(
  country text,
  total_sessions bigint,
  unique_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver sesiones por país';
  END IF;

  RETURN QUERY
  SELECT 
    sa.country,
    COUNT(*)::bigint as total_sessions,
    COUNT(DISTINCT sa.user_id)::bigint as unique_users
  FROM public.session_analytics sa
  WHERE sa.login_time >= start_date AND sa.login_time <= end_date
    AND sa.country IS NOT NULL
  GROUP BY sa.country
  ORDER BY total_sessions DESC;
END;
$$;

-- Función para obtener iniciativas por usuario
CREATE OR REPLACE FUNCTION public.get_user_initiatives_stats()
RETURNS TABLE(
  user_id uuid,
  nombre text,
  email text,
  total_initiatives bigint,
  total_evaluations bigint,
  total_use_cases bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver estadísticas de usuarios';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.nombre,
    p.email,
    (SELECT COUNT(*)::bigint FROM public.initiatives WHERE user_id = p.id) as total_initiatives,
    (SELECT COUNT(*)::bigint FROM public.evaluations WHERE user_id = p.id) as total_evaluations,
    (SELECT COUNT(*)::bigint FROM public.use_cases WHERE user_id = p.id) as total_use_cases
  FROM public.profiles p
  ORDER BY total_initiatives DESC;
END;
$$;

-- Función para obtener iniciativas sin seguimiento
CREATE OR REPLACE FUNCTION public.get_inactive_initiatives(
  days_inactive integer DEFAULT 30
)
RETURNS TABLE(
  initiative_id uuid,
  nombre text,
  user_name text,
  user_email text,
  days_since_update integer,
  last_update timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver iniciativas inactivas';
  END IF;

  RETURN QUERY
  SELECT 
    i.id as initiative_id,
    i.nombre,
    p.nombre as user_name,
    p.email as user_email,
    EXTRACT(DAY FROM (now() - i.updated_at))::integer as days_since_update,
    i.updated_at as last_update
  FROM public.initiatives i
  JOIN public.profiles p ON i.user_id = p.id
  WHERE i.updated_at < (now() - (days_inactive || ' days')::interval)
  ORDER BY i.updated_at ASC;
END;
$$;