-- Fix admin role assignment on signup
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user email is admin@brototype.com
  IF NEW.email = 'admin@brototype.com' THEN
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign admin role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role();

-- Create messages table for complaint chat
CREATE TABLE IF NOT EXISTS public.complaint_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_complaint_messages_complaint_id ON public.complaint_messages(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_messages_created_at ON public.complaint_messages(created_at);

-- Enable RLS on complaint_messages
ALTER TABLE public.complaint_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for complaint_messages

-- Students can view messages for their own complaints
CREATE POLICY "Students can view their complaint messages"
ON public.complaint_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.complaints
    WHERE complaints.id = complaint_messages.complaint_id
    AND complaints.student_id = auth.uid()
  )
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.complaint_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Students can insert messages to their own complaints
CREATE POLICY "Students can send messages to their complaints"
ON public.complaint_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.complaints
    WHERE complaints.id = complaint_messages.complaint_id
    AND complaints.student_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

-- Admins can insert messages to any complaint
CREATE POLICY "Admins can send messages to any complaint"
ON public.complaint_messages
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND sender_id = auth.uid()
);

-- Enable realtime for complaint_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_messages;