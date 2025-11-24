-- Crear enums para las nuevas tablas
CREATE TYPE public.priority_level AS ENUM ('alta', 'media', 'baja');
CREATE TYPE public.recommendation_type AS ENUM ('implementar_ahora', 'postergar', 'analizar_mas');
CREATE TYPE public.collaboration_status AS ENUM ('pendiente', 'aceptado', 'rechazado');
CREATE TYPE public.notification_type AS ENUM ('invitacion_colaboracion', 'cambio_estado_iniciativa', 'nuevo_caso_exito', 'recordatorio_roadmap');
CREATE TYPE public.activity_status AS ENUM ('no_iniciado', 'en_progreso', 'completado', 'bloqueado');

-- Tabla de iniciativas
CREATE TABLE public.initiatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  prioridad priority_level NOT NULL DEFAULT 'media',
  unidad_negocio TEXT,
  puntaje_total NUMERIC,
  recomendacion recommendation_type DEFAULT 'analizar_mas',
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de etapas de iniciativas
CREATE TABLE public.initiative_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL,
  orden INTEGER NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  avance INTEGER DEFAULT 0 CHECK (avance >= 0 AND avance <= 100),
  responsable TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de actividades por etapa
CREATE TABLE public.initiative_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES public.initiative_stages(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  responsable TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  status activity_status DEFAULT 'no_iniciado',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de colaboradores de iniciativas
CREATE TABLE public.initiative_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estado collaboration_status DEFAULT 'pendiente',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(initiative_id, user_id)
);

-- Tabla de notificaciones
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo notification_type NOT NULL,
  mensaje TEXT NOT NULL,
  link TEXT,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_initiatives_user ON public.initiatives(user_id);
CREATE INDEX idx_initiative_stages_initiative ON public.initiative_stages(initiative_id);
CREATE INDEX idx_initiative_activities_stage ON public.initiative_activities(stage_id);
CREATE INDEX idx_initiative_collaborators_initiative ON public.initiative_collaborators(initiative_id);
CREATE INDEX idx_initiative_collaborators_user ON public.initiative_collaborators(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, leida) WHERE leida = false;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para initiatives
CREATE POLICY "Users can view own initiatives"
  ON public.initiatives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view initiatives where they are collaborators"
  ON public.initiatives FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.initiative_collaborators
    WHERE initiative_id = initiatives.id
    AND user_id = auth.uid()
    AND estado = 'aceptado'
  ));

CREATE POLICY "Users can create own initiatives"
  ON public.initiatives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own initiatives"
  ON public.initiatives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Collaborators can update initiatives"
  ON public.initiatives FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.initiative_collaborators
    WHERE initiative_id = initiatives.id
    AND user_id = auth.uid()
    AND estado = 'aceptado'
  ));

CREATE POLICY "Users can delete own initiatives"
  ON public.initiatives FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para initiative_stages
CREATE POLICY "Users can view stages of their initiatives"
  ON public.initiative_stages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.initiatives
    WHERE id = initiative_stages.initiative_id
    AND (user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.initiative_collaborators
      WHERE initiative_id = initiatives.id
      AND user_id = auth.uid()
      AND estado = 'aceptado'
    ))
  ));

CREATE POLICY "Users can manage stages of own initiatives"
  ON public.initiative_stages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.initiatives
    WHERE id = initiative_stages.initiative_id
    AND (user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.initiative_collaborators
      WHERE initiative_id = initiatives.id
      AND user_id = auth.uid()
      AND estado = 'aceptado'
    ))
  ));

-- Políticas RLS para initiative_activities
CREATE POLICY "Users can view activities of their initiatives"
  ON public.initiative_activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.initiative_stages
    JOIN public.initiatives ON initiatives.id = initiative_stages.initiative_id
    WHERE initiative_stages.id = initiative_activities.stage_id
    AND (initiatives.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.initiative_collaborators
      WHERE initiative_id = initiatives.id
      AND user_id = auth.uid()
      AND estado = 'aceptado'
    ))
  ));

CREATE POLICY "Users can manage activities of their initiatives"
  ON public.initiative_activities FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.initiative_stages
    JOIN public.initiatives ON initiatives.id = initiative_stages.initiative_id
    WHERE initiative_stages.id = initiative_activities.stage_id
    AND (initiatives.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.initiative_collaborators
      WHERE initiative_id = initiatives.id
      AND user_id = auth.uid()
      AND estado = 'aceptado'
    ))
  ));

-- Políticas RLS para initiative_collaborators
CREATE POLICY "Users can view collaborators of their initiatives"
  ON public.initiative_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.initiatives
      WHERE id = initiative_collaborators.initiative_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Initiative owners can invite collaborators"
  ON public.initiative_collaborators FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.initiatives
    WHERE id = initiative_collaborators.initiative_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own collaboration status"
  ON public.initiative_collaborators FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Initiative owners can delete collaborators"
  ON public.initiative_collaborators FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.initiatives
    WHERE id = initiative_collaborators.initiative_id
    AND user_id = auth.uid()
  ));

-- Políticas RLS para notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_initiatives_updated_at
  BEFORE UPDATE ON public.initiatives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_initiative_stages_updated_at
  BEFORE UPDATE ON public.initiative_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_initiative_activities_updated_at
  BEFORE UPDATE ON public.initiative_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_initiative_collaborators_updated_at
  BEFORE UPDATE ON public.initiative_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear notificación cuando se invita a un colaborador
CREATE OR REPLACE FUNCTION notify_collaboration_invite()
RETURNS TRIGGER AS $$
DECLARE
  initiative_name TEXT;
  inviter_name TEXT;
BEGIN
  -- Obtener nombre de la iniciativa
  SELECT nombre INTO initiative_name
  FROM public.initiatives
  WHERE id = NEW.initiative_id;
  
  -- Obtener nombre del invitador
  SELECT nombre INTO inviter_name
  FROM public.profiles
  WHERE id = NEW.invited_by;
  
  -- Crear notificación
  INSERT INTO public.notifications (user_id, tipo, mensaje, link)
  VALUES (
    NEW.user_id,
    'invitacion_colaboracion',
    COALESCE(inviter_name, 'Un usuario') || ' te ha invitado a colaborar en la iniciativa "' || initiative_name || '"',
    '/initiatives/' || NEW.initiative_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_collaborator_invited
  AFTER INSERT ON public.initiative_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION notify_collaboration_invite();