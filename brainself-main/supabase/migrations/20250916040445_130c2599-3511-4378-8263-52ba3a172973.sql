-- Add student registration number to profiles table
ALTER TABLE public.profiles 
ADD COLUMN registration_number TEXT;

-- Create index for registration number lookups
CREATE INDEX idx_profiles_registration_number ON public.profiles(registration_number);

-- Create school_tags table for custom school-specific roles
CREATE TABLE public.school_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on school_tags
ALTER TABLE public.school_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for school_tags
CREATE POLICY "Anyone can view school tags" 
ON public.school_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create school tags" 
ON public.school_tags 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update school tags" 
ON public.school_tags 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete school tags" 
ON public.school_tags 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create user_school_tags junction table
CREATE TABLE public.user_school_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school_tag_id UUID NOT NULL REFERENCES public.school_tags(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, school_tag_id)
);

-- Enable RLS on user_school_tags
ALTER TABLE public.user_school_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for user_school_tags
CREATE POLICY "Users can view their own school tags" 
ON public.user_school_tags 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user school tags" 
ON public.user_school_tags 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can assign school tags" 
ON public.user_school_tags 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can remove school tags" 
ON public.user_school_tags 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add updated_at trigger for school_tags
CREATE TRIGGER update_school_tags_updated_at
BEFORE UPDATE ON public.school_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();