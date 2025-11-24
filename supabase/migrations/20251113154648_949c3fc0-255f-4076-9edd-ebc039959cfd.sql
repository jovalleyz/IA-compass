-- Add empresa field to profiles with visibility control
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS empresa_visible BOOLEAN DEFAULT false;

-- Update analytics_global to be populated automatically
CREATE OR REPLACE FUNCTION update_analytics_global()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing data
  DELETE FROM analytics_global;
  
  -- Insert aggregated statistics by industry
  INSERT INTO analytics_global (industria, total_evaluaciones, promedio_madurez, top_casos)
  SELECT 
    COALESCE(p.empresa, 'General') as industria,
    COUNT(DISTINCT e.id)::integer as total_evaluaciones,
    AVG(e.puntaje_total) as promedio_madurez,
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'nombre', uc.nombre,
        'count', (SELECT COUNT(*) FROM use_cases WHERE nombre = uc.nombre)
      )
    ) FILTER (WHERE uc.nombre IS NOT NULL) as top_casos
  FROM evaluations e
  LEFT JOIN profiles p ON e.user_id = p.id
  LEFT JOIN use_cases uc ON uc.evaluation_id = e.id
  GROUP BY COALESCE(p.empresa, 'General');
  
  -- Insert overall statistics
  INSERT INTO analytics_global (industria, total_evaluaciones, promedio_madurez, pais)
  VALUES (
    'Global',
    (SELECT COUNT(*)::integer FROM evaluations),
    (SELECT AVG(puntaje_total) FROM evaluations),
    NULL
  )
  ON CONFLICT DO NOTHING;
END;
$$;

-- Create trigger to update analytics on evaluation changes
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM update_analytics_global();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_evaluation_change ON evaluations;
CREATE TRIGGER on_evaluation_change
  AFTER INSERT OR UPDATE OR DELETE ON evaluations
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_analytics();

-- Initial population of analytics
SELECT update_analytics_global();