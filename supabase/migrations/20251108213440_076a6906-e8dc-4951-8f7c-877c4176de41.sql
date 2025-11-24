-- Create success_stories table
CREATE TABLE public.success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa TEXT NOT NULL,
  industria TEXT NOT NULL,
  caso_uso TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  impacto_negocio TEXT NOT NULL,
  metrica_clave TEXT NOT NULL,
  valor_metrica TEXT NOT NULL,
  logo_url TEXT,
  testimonio TEXT,
  nombre_contacto TEXT,
  cargo_contacto TEXT,
  pais TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read success stories
CREATE POLICY "Success stories are viewable by everyone"
ON public.success_stories
FOR SELECT
USING (true);

-- Only authenticated users can manage success stories (for future admin feature)
CREATE POLICY "Authenticated users can manage success stories"
ON public.success_stories
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_success_stories_updated_at
BEFORE UPDATE ON public.success_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample success stories
INSERT INTO public.success_stories (empresa, industria, caso_uso, descripcion, impacto_negocio, metrica_clave, valor_metrica, testimonio, nombre_contacto, cargo_contacto, pais)
VALUES 
  ('Banco Central Latam', 'Servicios Financieros', 'Detección de Fraude con ML', 'Implementación de modelos de machine learning para detectar transacciones fraudulentas en tiempo real, reduciendo pérdidas y mejorando la experiencia del cliente.', 'Reducción del 45% en fraudes detectados y respuesta en tiempo real', 'Reducción de fraude', '45%', 'La IA nos permitió pasar de detección reactiva a proactiva, transformando nuestra seguridad.', 'María González', 'Directora de Innovación', 'México'),
  ('RetailMax', 'Retail', 'Personalización de Experiencia de Cliente', 'Sistema de recomendaciones basado en IA que personaliza ofertas y productos según el comportamiento del usuario.', 'Incremento del 32% en conversión y aumento del ticket promedio', 'Incremento en ventas', '32%', 'Las recomendaciones de IA aumentaron significativamente nuestras ventas online.', 'Carlos Ramírez', 'Chief Digital Officer', 'Colombia'),
  ('HealthTech Solutions', 'Salud', 'Diagnóstico Asistido por IA', 'Herramienta de apoyo diagnóstico que analiza imágenes médicas para detectar patologías tempranas.', 'Mejora del 28% en precisión diagnóstica y reducción de tiempos', 'Mejora en precisión', '28%', 'La IA complementa perfectamente la experiencia de nuestros médicos.', 'Dr. Juan Pérez', 'Director Médico', 'Chile'),
  ('LogiTrans', 'Logística', 'Optimización de Rutas con IA', 'Algoritmos de optimización que calculan las rutas más eficientes considerando tráfico, clima y prioridades.', 'Reducción del 23% en costos de combustible y 18% mejora en tiempos', 'Reducción de costos', '23%', 'La optimización de rutas nos dio una ventaja competitiva inmediata.', 'Ana Torres', 'COO', 'Argentina'),
  ('EduTech Pro', 'Educación', 'Tutor Virtual Inteligente', 'Asistente educativo con IA que adapta el contenido según el ritmo de aprendizaje de cada estudiante.', 'Incremento del 40% en retención de estudiantes y mejora en calificaciones', 'Mejora en retención', '40%', 'Nuestros estudiantes ahora tienen apoyo personalizado 24/7.', 'Luis Mendoza', 'Director de Innovación', 'Perú');