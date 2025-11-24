-- Tabla de comentarios para iniciativas
CREATE TABLE public.initiative_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.initiative_comments(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  mentioned_users UUID[] DEFAULT '{}',
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en comentarios
ALTER TABLE public.initiative_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para comentarios
CREATE POLICY "Los usuarios pueden ver comentarios de iniciativas donde colaboran"
ON public.initiative_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.initiative_collaborators
    WHERE initiative_id = initiative_comments.initiative_id
    AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.initiatives
    WHERE id = initiative_comments.initiative_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Los usuarios pueden crear comentarios en iniciativas donde colaboran"
ON public.initiative_comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.initiative_collaborators
      WHERE initiative_id = initiative_comments.initiative_id
      AND user_id = auth.uid()
      AND estado = 'aceptado'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.initiatives
      WHERE id = initiative_comments.initiative_id
      AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "Los usuarios pueden actualizar sus propios comentarios"
ON public.initiative_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios comentarios"
ON public.initiative_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Índices para mejor rendimiento
CREATE INDEX idx_initiative_comments_initiative ON public.initiative_comments(initiative_id);
CREATE INDEX idx_initiative_comments_user ON public.initiative_comments(user_id);
CREATE INDEX idx_initiative_comments_parent ON public.initiative_comments(parent_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_initiative_comments_updated_at
BEFORE UPDATE ON public.initiative_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para notificar menciones en comentarios
CREATE OR REPLACE FUNCTION public.notify_comment_mentions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_user_id UUID;
  initiative_name TEXT;
  commenter_name TEXT;
BEGIN
  -- Obtener nombre de la iniciativa
  SELECT nombre INTO initiative_name
  FROM public.initiatives
  WHERE id = NEW.initiative_id;
  
  -- Obtener nombre del comentarista
  SELECT nombre INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Crear notificaciones para cada usuario mencionado
  IF NEW.mentioned_users IS NOT NULL AND array_length(NEW.mentioned_users, 1) > 0 THEN
    FOREACH mentioned_user_id IN ARRAY NEW.mentioned_users
    LOOP
      -- No notificar al autor del comentario
      IF mentioned_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, tipo, mensaje, link)
        VALUES (
          mentioned_user_id,
          'mencion',
          COALESCE(commenter_name, 'Un usuario') || ' te mencionó en un comentario en "' || initiative_name || '"',
          '/initiatives/' || NEW.initiative_id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para notificar menciones
CREATE TRIGGER on_comment_mention
AFTER INSERT ON public.initiative_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_comment_mentions();

-- Función para notificar nuevos comentarios a colaboradores
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  collaborator_record RECORD;
  initiative_name TEXT;
  commenter_name TEXT;
BEGIN
  -- Obtener nombre de la iniciativa
  SELECT nombre INTO initiative_name
  FROM public.initiatives
  WHERE id = NEW.initiative_id;
  
  -- Obtener nombre del comentarista
  SELECT nombre INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Notificar a todos los colaboradores (excepto al autor del comentario)
  FOR collaborator_record IN
    SELECT DISTINCT user_id
    FROM public.initiative_collaborators
    WHERE initiative_id = NEW.initiative_id
    AND user_id != NEW.user_id
    AND estado = 'aceptado'
  LOOP
    INSERT INTO public.notifications (user_id, tipo, mensaje, link)
    VALUES (
      collaborator_record.user_id,
      'comentario_nuevo',
      COALESCE(commenter_name, 'Un usuario') || ' comentó en "' || initiative_name || '"',
      '/initiatives/' || NEW.initiative_id
    );
  END LOOP;
  
  -- Notificar al dueño de la iniciativa si no es el comentarista
  INSERT INTO public.notifications (user_id, tipo, mensaje, link)
  SELECT i.user_id, 'comentario_nuevo', 
    COALESCE(commenter_name, 'Un usuario') || ' comentó en tu iniciativa "' || initiative_name || '"',
    '/initiatives/' || NEW.initiative_id
  FROM public.initiatives i
  WHERE i.id = NEW.initiative_id
  AND i.user_id != NEW.user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.initiative_collaborators
    WHERE initiative_id = NEW.initiative_id
    AND user_id = i.user_id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para notificar nuevos comentarios
CREATE TRIGGER on_new_comment
AFTER INSERT ON public.initiative_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_comment();

-- Habilitar realtime para comentarios
ALTER PUBLICATION supabase_realtime ADD TABLE public.initiative_comments;