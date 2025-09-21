-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policy that's causing recursion
DROP POLICY IF EXISTS "Teachers and admins can view all profiles" ON public.profiles;

-- Create a simpler, non-recursive policy for teachers and admins
CREATE POLICY "Teachers and admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('teacher', 'admin')
  )
);