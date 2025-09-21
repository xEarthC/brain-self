-- Allow teachers and admins to view all profiles for dropdowns
CREATE POLICY "Teachers and admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE user_id = auth.uid() 
  AND role IN ('teacher', 'admin')
));