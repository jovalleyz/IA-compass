-- Crear enum para el estado de casos de uso
CREATE TYPE public.case_status AS ENUM ('en_evaluacion', 'en_ejecucion', 'caso_de_exito');

-- Agregar columnas a la tabla use_cases para identificar casos de éxito de usuarios
ALTER TABLE public.use_cases
ADD COLUMN is_user_created BOOLEAN DEFAULT false,
ADD COLUMN creator_company TEXT,
ADD COLUMN status_case case_status DEFAULT 'en_evaluacion';

-- Crear índice para mejorar consultas de casos de éxito
CREATE INDEX idx_use_cases_status ON public.use_cases(status_case);
CREATE INDEX idx_use_cases_user_created ON public.use_cases(is_user_created) WHERE is_user_created = true;