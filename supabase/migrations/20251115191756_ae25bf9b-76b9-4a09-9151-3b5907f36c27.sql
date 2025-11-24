-- Create support conversations table
CREATE TABLE public.support_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subject TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'assigned', 'resolved'))
);

-- Create support messages table
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_ai BOOLEAN NOT NULL DEFAULT false,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policies for support_conversations
CREATE POLICY "Users can view their own support conversations"
ON public.support_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support conversations"
ON public.support_conversations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own support conversations"
ON public.support_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update support conversations"
ON public.support_conversations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for support_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.support_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations
    WHERE support_conversations.id = support_messages.conversation_id
    AND support_conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all support messages"
ON public.support_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create messages in their conversations"
ON public.support_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.support_conversations
    WHERE support_conversations.id = support_messages.conversation_id
    AND support_conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can create messages in any conversation"
ON public.support_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create indexes
CREATE INDEX idx_support_conversations_user ON public.support_conversations(user_id);
CREATE INDEX idx_support_conversations_admin ON public.support_conversations(assigned_admin_id);
CREATE INDEX idx_support_conversations_status ON public.support_conversations(status);
CREATE INDEX idx_support_messages_conversation ON public.support_messages(conversation_id);

-- Function to notify admins of new support requests
CREATE OR REPLACE FUNCTION public.notify_admins_new_support()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Notify all admins
  FOR admin_record IN
    SELECT DISTINCT user_id
    FROM public.user_roles
    WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, tipo, mensaje, link)
    VALUES (
      admin_record.user_id,
      'nuevo_caso_exito',
      'Nueva solicitud de soporte de un usuario',
      '/admin?tab=support'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new support conversations
CREATE TRIGGER notify_admins_on_new_support
AFTER INSERT ON public.support_conversations
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_new_support();

-- Enable realtime for support
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;