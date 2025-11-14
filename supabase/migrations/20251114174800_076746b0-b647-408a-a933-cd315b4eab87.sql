-- Make student_id nullable for anonymous complaints
ALTER TABLE public.complaints ALTER COLUMN student_id DROP NOT NULL;

-- Add is_anonymous flag
ALTER TABLE public.complaints ADD COLUMN is_anonymous boolean DEFAULT false;

-- Update RLS policies to allow anonymous complaints
DROP POLICY IF EXISTS "Students can create their own complaints" ON public.complaints;

CREATE POLICY "Users can create complaints"
ON public.complaints
FOR INSERT
TO authenticated
WITH CHECK (
  (student_id = auth.uid() AND is_anonymous = false) OR 
  (student_id IS NULL AND is_anonymous = true)
);

-- Anonymous complaints should be viewable by admins only
DROP POLICY IF EXISTS "Students can view their own complaints" ON public.complaints;

CREATE POLICY "Students can view their own complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (
  (student_id = auth.uid() AND is_anonymous = false)
);

-- Update delete and update policies
DROP POLICY IF EXISTS "Students can delete their own pending complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students can update their own pending complaints" ON public.complaints;

CREATE POLICY "Students can delete their own pending complaints"
ON public.complaints
FOR DELETE
TO authenticated
USING (
  student_id = auth.uid() AND 
  status = 'pending'::complaint_status AND 
  is_anonymous = false
);

CREATE POLICY "Students can update their own pending complaints"
ON public.complaints
FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid() AND 
  status = 'pending'::complaint_status AND 
  is_anonymous = false
);