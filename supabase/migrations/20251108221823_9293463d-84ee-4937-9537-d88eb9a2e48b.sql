-- Corregir recursión infinita en políticas RLS de initiatives e initiative_collaborators

-- Primero eliminamos las políticas problemáticas
DROP POLICY IF EXISTS "Users can view collaborators of their initiatives" ON initiative_collaborators;
DROP POLICY IF EXISTS "Users can view initiatives where they are collaborators" ON initiatives;

-- Recreamos la política de initiative_collaborators sin referencia a initiatives
CREATE POLICY "Users can view collaborators of their initiatives"
ON initiative_collaborators
FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  invited_by = auth.uid()
);

-- Recreamos la política de initiatives sin problemas
CREATE POLICY "Users can view initiatives where they are collaborators"
ON initiatives
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM initiative_collaborators
    WHERE initiative_collaborators.initiative_id = initiatives.id
      AND initiative_collaborators.user_id = auth.uid()
      AND initiative_collaborators.estado = 'aceptado'
  )
);