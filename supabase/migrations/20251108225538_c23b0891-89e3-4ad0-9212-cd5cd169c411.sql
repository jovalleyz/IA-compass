-- Crear tabla de unidades de negocio predefinidas
CREATE TABLE IF NOT EXISTS public.business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  industria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver las unidades de negocio
CREATE POLICY "Business units are viewable by authenticated users"
  ON public.business_units
  FOR SELECT
  TO authenticated
  USING (true);

-- Insertar unidades de negocio comunes
INSERT INTO public.business_units (nombre, descripcion, industria) VALUES
  ('Tecnología', 'Desarrollo, infraestructura y sistemas', 'General'),
  ('Operaciones', 'Gestión operativa y procesos', 'General'),
  ('Marketing', 'Marketing, publicidad y comunicaciones', 'General'),
  ('Ventas', 'Fuerza de ventas y comercial', 'General'),
  ('Recursos Humanos', 'Gestión de talento y RRHH', 'General'),
  ('Finanzas', 'Finanzas, contabilidad y tesorería', 'General'),
  ('Atención al Cliente', 'Servicio y soporte al cliente', 'General'),
  ('Logística', 'Cadena de suministro y distribución', 'General'),
  ('Producción', 'Manufactura y producción', 'Manufactura'),
  ('Investigación y Desarrollo', 'I+D e innovación', 'General'),
  ('Legal', 'Asuntos legales y compliance', 'General'),
  ('Calidad', 'Control y aseguramiento de calidad', 'General'),
  ('Compras', 'Adquisiciones y procurement', 'General'),
  ('Riesgos', 'Gestión de riesgos', 'Seguros'),
  ('Suscripción', 'Underwriting y evaluación', 'Seguros'),
  ('Reclamos', 'Gestión de siniestros', 'Seguros'),
  ('Crédito', 'Análisis y otorgamiento de crédito', 'Banca'),
  ('Cobranzas', 'Recuperación de cartera', 'Banca'),
  ('Sucursales', 'Red de sucursales', 'Banca')
ON CONFLICT (nombre) DO NOTHING;