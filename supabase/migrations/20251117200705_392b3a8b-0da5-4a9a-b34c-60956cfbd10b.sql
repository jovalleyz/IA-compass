-- Fix RLS policy for initiative_stages to allow INSERT operations
DROP POLICY IF EXISTS "Users can manage stages of own initiatives" ON initiative_stages;

CREATE POLICY "Users can manage stages of own initiatives"
ON initiative_stages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM initiatives
    WHERE initiatives.id = initiative_stages.initiative_id
    AND (
      initiatives.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM initiative_collaborators
        WHERE initiative_collaborators.initiative_id = initiatives.id
        AND initiative_collaborators.user_id = auth.uid()
        AND initiative_collaborators.estado = 'aceptado'
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM initiatives
    WHERE initiatives.id = initiative_stages.initiative_id
    AND (
      initiatives.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM initiative_collaborators
        WHERE initiative_collaborators.initiative_id = initiatives.id
        AND initiative_collaborators.user_id = auth.uid()
        AND initiative_collaborators.estado = 'aceptado'
      )
    )
  )
);