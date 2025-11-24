-- Add new columns to initiatives table
ALTER TABLE public.initiatives
ADD COLUMN status_general text DEFAULT 'activa',
ADD COLUMN porcentaje_avance integer DEFAULT 0,
ADD COLUMN fecha_cierre_comprometida date;

-- Add check constraint for percentage
ALTER TABLE public.initiatives
ADD CONSTRAINT check_porcentaje_avance CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100);

-- Add check constraint for status_general
ALTER TABLE public.initiatives
ADD CONSTRAINT check_status_general CHECK (status_general IN ('activa', 'standby'));

-- Create trigger to automatically set priority based on recommendation
CREATE OR REPLACE FUNCTION public.set_priority_from_recommendation()
RETURNS TRIGGER AS $$
BEGIN
  -- Set priority based on recommendation
  CASE NEW.recomendacion
    WHEN 'implementar_ahora' THEN
      NEW.prioridad := 'alta'::priority_level;
    WHEN 'postergar' THEN
      NEW.prioridad := 'media'::priority_level;
    WHEN 'analizar_mas' THEN
      NEW.prioridad := 'baja'::priority_level;
    ELSE
      -- Default to media if no recommendation
      NEW.prioridad := 'media'::priority_level;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for INSERT operations
CREATE TRIGGER trigger_set_priority_on_insert
BEFORE INSERT ON public.initiatives
FOR EACH ROW
EXECUTE FUNCTION public.set_priority_from_recommendation();

-- Create trigger for UPDATE operations (when recommendation changes)
CREATE TRIGGER trigger_set_priority_on_update
BEFORE UPDATE OF recomendacion ON public.initiatives
FOR EACH ROW
WHEN (OLD.recomendacion IS DISTINCT FROM NEW.recomendacion)
EXECUTE FUNCTION public.set_priority_from_recommendation();