-- Agregar columna para relacionar iniciativa con caso de uso
ALTER TABLE initiatives 
ADD COLUMN IF NOT EXISTS use_case_id UUID REFERENCES use_cases(id) ON DELETE SET NULL;

-- Actualizar la iniciativa existente con el caso de uso correcto
UPDATE initiatives 
SET use_case_id = 'f39fa251-d215-4a1e-a594-622598fe98a9',
    nombre = 'Agente Q&A de Pólizas',
    unidad_negocio = 'Atención al Cliente'
WHERE id = '70ad84fd-26c3-471a-b400-bf7708f3fb95';