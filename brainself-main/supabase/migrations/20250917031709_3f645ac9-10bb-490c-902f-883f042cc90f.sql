-- Add missing registration_number column to student_marks table
ALTER TABLE public.student_marks 
ADD COLUMN IF NOT EXISTS registration_number text;