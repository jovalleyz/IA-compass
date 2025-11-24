-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  rol TEXT,
  empresa TEXT,
  pais TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  global_answers JSONB,
  estrategia_score DECIMAL,
  datos_score DECIMAL,
  tecnologia_score DECIMAL,
  talento_score DECIMAL,
  casos_score DECIMAL,
  puntaje_total DECIMAL,
  nivel_madurez TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluations"
  ON public.evaluations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own evaluations"
  ON public.evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evaluations"
  ON public.evaluations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create use_cases table
CREATE TABLE public.use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
  industria TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo_ia TEXT, -- Predictiva, Generativa, Cognitiva, Agentica, Híbrida
  agentic_tipo TEXT, -- IA Agentica, IA Híbrida, Automatización Tradicional
  impacto TEXT,
  esfuerzo TEXT,
  complejidad TEXT,
  alineamiento_estrategico DECIMAL,
  nivel_madurez_requerido DECIMAL,
  madurez_gap DECIMAL,
  estado TEXT DEFAULT 'identificado',
  es_personalizado BOOLEAN DEFAULT false,
  respuestas JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own use cases"
  ON public.use_cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own use cases"
  ON public.use_cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own use cases"
  ON public.use_cases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own use cases"
  ON public.use_cases FOR DELETE
  USING (auth.uid() = user_id);

-- Create roadmap table
CREATE TABLE public.roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id UUID REFERENCES public.use_cases(id) ON DELETE CASCADE NOT NULL,
  etapa TEXT NOT NULL,
  responsable TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  progreso INTEGER DEFAULT 0,
  kpi TEXT,
  descripcion TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roadmap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roadmap for own use cases"
  ON public.roadmap FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.use_cases
      WHERE use_cases.id = roadmap.use_case_id
      AND use_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create roadmap for own use cases"
  ON public.roadmap FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.use_cases
      WHERE use_cases.id = roadmap.use_case_id
      AND use_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update roadmap for own use cases"
  ON public.roadmap FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.use_cases
      WHERE use_cases.id = roadmap.use_case_id
      AND use_cases.user_id = auth.uid()
    )
  );

-- Create analytics_global table (aggregated anonymous data)
CREATE TABLE public.analytics_global (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industria TEXT NOT NULL,
  pais TEXT,
  promedio_madurez DECIMAL,
  total_evaluaciones INTEGER DEFAULT 0,
  top_casos JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.analytics_global ENABLE ROW LEVEL SECURITY;

-- Public read access for analytics
CREATE POLICY "Analytics are viewable by authenticated users"
  ON public.analytics_global FOR SELECT
  TO authenticated
  USING (true);

-- Create chat_history table
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mensaje_usuario TEXT NOT NULL,
  respuesta_ia TEXT,
  contexto JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_use_cases_updated_at
  BEFORE UPDATE ON public.use_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmap_updated_at
  BEFORE UPDATE ON public.roadmap
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();