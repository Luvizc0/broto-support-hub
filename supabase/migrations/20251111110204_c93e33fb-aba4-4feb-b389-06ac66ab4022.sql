-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', true);

-- Create RLS policies for the bucket
CREATE POLICY "Anyone can view complaint attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-attachments');

CREATE POLICY "Authenticated users can upload complaint attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'complaint-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'complaint-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create dummy admin account
-- First insert into profiles (this would normally be done by the trigger when user signs up)
-- Email: admin@brototype.com
-- Password: Admin@123
-- The actual auth.users entry needs to be created through signup, but we'll prepare the role

-- Insert a dummy profile (the auth trigger will handle this on signup)
-- We'll add the admin role for any user with this email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@brototype.com'
ON CONFLICT (user_id, role) DO NOTHING;