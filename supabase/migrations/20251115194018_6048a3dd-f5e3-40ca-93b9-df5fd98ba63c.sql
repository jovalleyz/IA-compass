-- Modificar tabla support_conversations para permitir usuarios no autenticados
ALTER TABLE support_conversations 
  ALTER COLUMN user_id DROP NOT NULL;

-- Agregar campos para contacto de usuarios no autenticados
ALTER TABLE support_conversations 
  ADD COLUMN contact_name text,
  ADD COLUMN contact_email text;

-- Actualizar RLS policies para permitir que usuarios no autenticados creen conversaciones
DROP POLICY IF EXISTS "Users can create their own support conversations" ON support_conversations;

CREATE POLICY "Anyone can create support conversations"
  ON support_conversations
  FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR 
    (user_id IS NULL AND contact_email IS NOT NULL AND contact_name IS NOT NULL)
  );

-- Permitir que usuarios no autenticados vean sus conversaciones por email
DROP POLICY IF EXISTS "Users can view their own support conversations" ON support_conversations;

CREATE POLICY "Users can view their own support conversations"
  ON support_conversations
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND contact_email IS NOT NULL)
  );

-- Actualizar políticas de mensajes para permitir usuarios anónimos
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON support_messages;

CREATE POLICY "Users can create messages in their conversations"
  ON support_messages
  FOR INSERT
  WITH CHECK (
    (sender_id = auth.uid() AND EXISTS (
      SELECT 1 FROM support_conversations 
      WHERE support_conversations.id = support_messages.conversation_id 
      AND support_conversations.user_id = auth.uid()
    )) OR
    (sender_id IS NULL AND EXISTS (
      SELECT 1 FROM support_conversations 
      WHERE support_conversations.id = support_messages.conversation_id 
      AND support_conversations.user_id IS NULL
    ))
  );

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON support_messages;

CREATE POLICY "Users can view messages in their conversations"
  ON support_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_conversations 
      WHERE support_conversations.id = support_messages.conversation_id 
      AND (
        support_conversations.user_id = auth.uid() OR
        support_conversations.user_id IS NULL
      )
    )
  );