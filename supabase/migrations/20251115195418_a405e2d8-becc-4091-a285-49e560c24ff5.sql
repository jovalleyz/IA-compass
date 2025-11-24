-- Agregar campo de teléfono a la tabla de leads
ALTER TABLE public.leads 
  ADD COLUMN phone text;