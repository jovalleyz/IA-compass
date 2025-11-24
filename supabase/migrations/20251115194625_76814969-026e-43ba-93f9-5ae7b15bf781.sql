-- Crear tabla de leads para trackear contactos de usuarios no autenticados
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  conversation_id uuid REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  registered boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all leads
CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update leads
CREATE POLICY "Admins can update leads"
  ON public.leads
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- System can create leads
CREATE POLICY "System can create leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;