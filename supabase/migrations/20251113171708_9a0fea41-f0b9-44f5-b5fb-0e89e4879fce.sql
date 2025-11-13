-- Drop the existing foreign key that points to auth.users
ALTER TABLE public.complaints 
DROP CONSTRAINT complaints_student_id_fkey;

-- Add new foreign key constraint that points to profiles.id
ALTER TABLE public.complaints 
ADD CONSTRAINT complaints_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;