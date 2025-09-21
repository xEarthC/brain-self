-- Create admin access for Xx_Earthy_xX
-- This will allow the admin user to be created when they sign up

-- First, let's create a function to promote a user to admin by nickname
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(_nickname text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update the user's role to admin based on nickname
  UPDATE public.profiles 
  SET role = 'admin'::app_role
  WHERE nickname = _nickname;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;

-- Promote Xx_Earthy_xX to admin (if they exist)
SELECT public.promote_user_to_admin('Xx_Earthy_xX');

-- Create a trigger to automatically give admin access to specific usernames
CREATE OR REPLACE FUNCTION public.check_special_admin_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Automatically assign admin role to specific usernames
  IF NEW.nickname = 'Xx_Earthy_xX' THEN
    NEW.role = 'admin'::app_role;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profile creation
DROP TRIGGER IF EXISTS check_admin_users_trigger ON public.profiles;
CREATE TRIGGER check_admin_users_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_special_admin_users();