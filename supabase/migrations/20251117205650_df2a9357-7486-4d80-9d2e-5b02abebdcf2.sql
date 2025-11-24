-- Agregar columna riesgos_score a la tabla evaluations
ALTER TABLE public.evaluations 
ADD COLUMN IF NOT EXISTS riesgos_score numeric;