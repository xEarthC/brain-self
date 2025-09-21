-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role public.app_role DEFAULT 'student'::public.app_role;

-- Update existing profile for admin access
UPDATE public.profiles SET role = 'admin' WHERE nickname = 'Xx_Earthy_xX';

-- Create student_marks table for term test results
CREATE TABLE public.student_marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id),
  subject_name TEXT NOT NULL,
  marks INTEGER NOT NULL CHECK (marks >= 0 AND marks <= 100),
  grade_level TEXT NOT NULL CHECK (grade_level IN ('grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12', 'grade_13')),
  term TEXT NOT NULL CHECK (term IN ('term_1', 'term_2', 'term_3')),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on student_marks
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;

-- Create policies for student_marks
CREATE POLICY "Students can view their own marks" ON public.student_marks
  FOR SELECT USING (
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can view all marks" ON public.student_marks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can insert marks" ON public.student_marks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can update marks" ON public.student_marks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_student_marks_updated_at
  BEFORE UPDATE ON public.student_marks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to check if user has teacher or admin access
CREATE OR REPLACE FUNCTION public.has_teacher_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role IN ('teacher', 'admin')
  );
$$;