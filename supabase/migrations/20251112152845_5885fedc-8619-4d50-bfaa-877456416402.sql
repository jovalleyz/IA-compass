-- Add sexo column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sexo TEXT;

-- Function to create a new user session
CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id UUID,
  p_ip_address TEXT,
  p_country TEXT,
  p_region TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Insert new session record
  INSERT INTO public.session_analytics (
    user_id,
    ip_address,
    country,
    region,
    city,
    user_agent,
    login_time
  ) VALUES (
    p_user_id,
    p_ip_address,
    p_country,
    p_region,
    p_city,
    p_user_agent,
    now()
  )
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$;

-- Function to update session duration periodically
CREATE OR REPLACE FUNCTION public.update_session_duration(
  p_session_id UUID,
  p_duration_seconds INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.session_analytics
  SET session_duration = make_interval(secs => p_duration_seconds)
  WHERE id = p_session_id;
END;
$$;

-- Function to update session on logout
CREATE OR REPLACE FUNCTION public.update_session_logout(
  p_session_id UUID,
  p_logout_timestamp TIMESTAMPTZ,
  p_duration_seconds INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.session_analytics
  SET 
    logout_time = p_logout_timestamp,
    session_duration = make_interval(secs => p_duration_seconds)
  WHERE id = p_session_id;
END;
$$;